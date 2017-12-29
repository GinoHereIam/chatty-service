package de.ginoatlas.chatty

import com.beust.klaxon.JsonObject
import com.beust.klaxon.Parser
import de.ginoatlas.chatty.util.PropertyManager
import kotlinx.coroutines.experimental.CommonPool
import kotlinx.coroutines.experimental.channels.*
import kotlinx.coroutines.experimental.launch
import mu.KotlinLogging
import io.ktor.application.*
import io.ktor.content.*
import io.ktor.features.*
import io.ktor.routing.*
import io.ktor.sessions.*
import io.ktor.util.*
import io.ktor.websocket.*
import io.ktor.server.jetty.*
import io.ktor.server.engine.*
import kotlinx.coroutines.experimental.async
import org.joda.time.DateTime

import java.time.*

data class ChatSession(val id: String)

val mainLogger = KotlinLogging.logger {}

fun Application.module() {
    install(DefaultHeaders)
    install(CallLogging)
    install(Compression)
    // FIXME This is only for development
    install(CORS) {
        anyHost()
    }
    install(WebSockets) {
        pingPeriod = Duration.ofSeconds(1)
        timeout = Duration.ofSeconds(3)
    }

    install(Routing) {
        install(Sessions) {
            cookie<ChatSession>("SESSION")
        }

        intercept(ApplicationCallPipeline.Infrastructure) {
            if (call.sessions.get<ChatSession>() == null) {
                call.sessions.set(ChatSession(nextNonce()))
            }
        }

        val chatty_config = PropertyManager().getConfig()
        val parser = Parser()

        // Each connected user
        val users: MutableList<User> = mutableListOf()

        // Database setup
        initDB()
        setupDB()

        webSocket("/chatty") {

            // Upon each websocket connection at this endpoint, generate a random id for it
            val id = java.util.UUID.randomUUID()
            val sessionID = call.sessions.get<ChatSession>()

            if (sessionID == null) {
                close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "No session"))
                return@webSocket
            }

            val session = this

            val version = Version()
            val password = Password()
            val header = Header()
            val action: ActionType = ActionType.NONE
            val response: ResponseType = ResponseType.NONE
            val user = User()

            var protocol: CPoW = CPoW(
                    // Contains information about version and so on
                    version = version,
                    // Each user is create by first connection
                    participant = user,
                    // Set password attributes here
                    password = password,
                    // There is always a basic header with no information
                    header = header,
                    // Default action = None
                    // Needed to overwritten on each action request
                    action = action,
                    // Default response = None
                    // Needed to overwritten on each response
                    response = response
            )

            val auth = Authentication(users, protocol)

            mainLogger.info { "Started websocket connection ${DateTime.now().toLocalDateTime()}" }
            mainLogger.debug { "[$id] a client connected ${call.request.local.host}" }
            users.add(protocol.user)

            try {
                incoming.consumeEach({ frame ->
                    if (frame is Frame.Text) {
                        val message = frame.readText()
                        mainLogger.trace { "[$id] client sent us: $message" }

                        val stringBuilder = StringBuilder(message)
                        val cpow = parser.parse(stringBuilder) as JsonObject
                        try {
                            // Get message
                            val actionType: ActionType = ActionType.valueOf(cpow["actionType"] as String)
                            val timestamp: DateTime = DateTime.now()

                            var content = ""
                            if (cpow["content"] != null && cpow["username"] != null) {
                                content = cpow["content"] as String
                            }

                            /*
                            * FIXME probably we should move it to the action where the token is necessary like
                            * INFO The token is important like a password.
                            * List for needed credential token
                            * + USER_CREATE_CHAT
                            * + USER_SEND_MESSAGE
                            * + USER_DELETE_MESSAGE
                            * + USER_LOGIN_ACCOUNT
                            * + USER_ADD_FRIEND
                            * + USER_DELETE_FRIEND
                            * + USER_DELETE_ACCOUNT
                            */

                            // val token: UUID = if (CPOW["token"] == "") UUID.fromString("00000000-0000-0000-0000-000000000000") else UUID.fromString(CPOW["token"] as String)
                            // user.token = token
                            if (cpow["username"] != null) {
                                protocol.user.username = cpow["username"] as String
                            }

                            protocol.message = Message(timestamp, content)
                            protocol.contacts = mutableListOf()
                            protocol.chats = mutableListOf()
                            protocol.actionType = actionType
                            protocol.userList = mutableListOf()

                            mainLogger.trace { "ActionType: $actionType, Protocol: $protocol" }
                            when (actionType) {
                                ActionType.USER_CONNECT -> {
                                    async {
                                        protocol.responseType = ResponseType.SUCCESS
                                        protocol.header.setAdditionalText = "[chatty-service]: you are connected!"
                                        val response = parseCPOW(protocol).toJsonString()

                                        call.sessions.set(ChatSession("Connected"))
                                        session.send(Frame.Text(response))
                                    }
                                }

                                ActionType.USER_DISCONNECT -> {
                                    async {
                                        if(sessionID.id != "Authorized") {
                                            protocol.responseType = ResponseType.FAILED
                                            protocol.header.additionalText = "Not Authorized!"

                                            val responseFriend = parseCPOW(protocol).toJsonString()
                                            session.send(Frame.Text(responseFriend))
                                        }

                                        mainLogger.info { "Close connection to client!" }

                                        // TODO Make user shown offline
                                        protocol.responseType = ResponseType.SUCCESS
                                        protocol.header.setAdditionalText = "[chatty-service]: You are offline now!"
                                        val response = parseCPOW(protocol).toJsonString()
                                        session.send(Frame.Text(response))
                                        //close(CloseReason(CloseReason.Codes.GOING_AWAY, "client left"))
                                    }
                                }

                                ActionType.USER_REGISTER_ACCOUNT -> {
                                    async {

                                        // Set credentials
                                        auth.username = cpow["username"] as String
                                        auth.name = cpow["name"] as String
                                        auth.password = cpow["password"] as String
                                        protocol = auth.register()

                                        val response = parseCPOW(protocol).toJsonString()
                                        session.send(Frame.Text(response))
                                    }
                                }

                                ActionType.USER_LOGIN_ACCOUNT -> {
                                    async {
                                        // Set credentials
                                        auth.username = cpow["username"] as String
                                        auth.password = cpow["password"] as String
                                        protocol = auth.login()

                                        if(protocol.responseType.equals(ResponseType.SUCCESS)) {
                                            call.sessions.set(ChatSession("Authorized"))
                                        }

                                        // Find all friends
                                        protocol.contacts = dbFindAllFriends(protocol.user.username)

                                        if (protocol.user.token.toString() != "") {
                                            val response: String = parseCPOW(protocol).toJsonString()
                                            session.send(Frame.Text(response))
                                        }
                                    }
                                }

                                ActionType.USER_FIND_FRIEND -> {
                                    async {
                                        // FIXME put me in a function
                                        if(sessionID.id != "Authorized") {
                                            protocol.responseType = ResponseType.FAILED
                                            protocol.header.additionalText = "Not Authorized!"

                                            val responseFriend = parseCPOW(protocol).toJsonString()
                                            session.send(Frame.Text(responseFriend))
                                        }

                                        // TODO return name and picture of user

                                        val searchedUser = cpow["header"] as String
                                        val currentUser = protocol.user.username
                                        val getListOfUsernames: MutableList<String> = mutableListOf()

                                        if (searchedUser.isNotEmpty()) {
                                            // Get array of possible users
                                            getListOfUsernames.addAll(getListOfMatchedUsername(searchedUser, currentUser))
                                        }

                                        protocol.userList = getListOfUsernames
                                        if (protocol.userList.size > 0) {
                                            protocol.responseType = ResponseType.SUCCESS
                                        }

                                        val responseFriend = parseCPOW(protocol).toJsonString()
                                        session.send(Frame.Text(responseFriend))
                                    }
                                }

                                ActionType.USER_ADD_FRIEND -> {
                                    // TODO create user add process
                                    async {
                                        if(sessionID.id != "Authorized") {
                                            protocol.responseType = ResponseType.FAILED
                                            protocol.header.additionalText = "Not Authorized!"

                                            val responseFriend = parseCPOW(protocol).toJsonString()
                                            session.send(Frame.Text(responseFriend))
                                        }

                                        val contact = cpow["contact"] as String
                                        val alreadyAdded = dbAddContact(protocol.user.username, contact)

                                        if (alreadyAdded) {
                                            val message = "[chatty-service]: is $contact already in your friends list"
                                            protocol.header.additionalText = message
                                        } else {
                                            val message = "[chatty-service]: $contact is added to your friends list"
                                            protocol.header.additionalText = message
                                        }

                                        val response = parseCPOW(protocol).toJsonString()
                                        session.send(Frame.Text(response))
                                    }
                                }

                                ActionType.USER_DELETE_FRIEND -> {
                                    async {
                                        if(sessionID.id != "Authorized") {
                                            protocol.responseType = ResponseType.FAILED
                                            protocol.header.additionalText = "Not Authorized!"

                                            val responseFriend = parseCPOW(protocol).toJsonString()
                                            session.send(Frame.Text(responseFriend))
                                        }

                                        protocol.header.additionalText = "This does not exist yet."
                                        val response = parseCPOW(protocol).toJsonString()
                                        session.send(Frame.Text(response))
                                    }
                                }

                                ActionType.USER_CREATE_CHAT -> {
                                    async {
                                        if(sessionID.id != "Authorized") {
                                            protocol.responseType = ResponseType.FAILED
                                            protocol.header.additionalText = "Not Authorized!"

                                            val responseFriend = parseCPOW(protocol).toJsonString()
                                            session.send(Frame.Text(responseFriend))
                                        }

                                        val participant = cpow["participant"] as String

                                        // Create a chat
                                        val chat: Chat = Chat()
                                        // Add the user itself to the chat
                                        chat.addParticipant(user)

                                        // Find partner in global list
                                        val partner = mutableListOf<User>()
                                        users.filter {
                                            it.username == participant
                                        }.forEach {
                                            partner.add(it)
                                        }

                                        if (partner.size > 0) {
                                            // Add participant
                                            partner.forEach { chat.addParticipant(it) }
                                            // Set information in protocol
                                            protocol.responseType = ResponseType.SUCCESS
                                            protocol.header.setAdditionalText = "[chatty-service]: chat ${chat.chatID} with ${participant} was created!"
                                            protocol.chats.add(chat)

                                            val response = parseCPOW(protocol).toJsonString()
                                            session.send(Frame.Text(response))
                                        } else {
                                            protocol.responseType = ResponseType.FAILED
                                            protocol.header.setAdditionalText = "[chatty-service]: failed to create chat with ${participant}!"
                                        }
                                    }
                                }

                                else -> {
                                    async {
                                        protocol.header.additionalText = "Unknown message type!"
                                        protocol.responseType = ResponseType.FAILED
                                        val response = parseCPOW(protocol).toJsonString()
                                        session.send(Frame.Text(response))
                                    }
                                }
                            }
                        } catch (e: TypeCastException) {
                            // This really shouldn't happen
                            mainLogger.error { e.printStackTrace() }
                        } catch (e: IllegalArgumentException) {
                            // Happen with wrong action type request
                            mainLogger.error { e.printStackTrace() }
                        }
                    }
                })
            } finally {
                if (protocol.user.username.isEmpty()) {
                    mainLogger.info { "[chatty-service]: $id disconnected" }
                } else {
                    mainLogger.info { "[chatty-service]: ${protocol.user.username} disconnected" }
                }
                call.sessions.clear<ChatSession>()
            }
        }

        static {
            defaultResource("dist/index.html", "public/assets")
            resources("public/assets/dist")
        }
    }
}

fun main(args: Array<String>) {
    embeddedServer(Jetty, commandLineEnvironment(args)).start()
}