package de.ginoatlas.chatty

import com.beust.klaxon.JsonObject
import com.beust.klaxon.Parser
import de.ginoatlas.chatty.util.PropertyManager
import kotlinx.coroutines.experimental.CommonPool
import kotlinx.coroutines.experimental.channels.*
import kotlinx.coroutines.experimental.launch
import org.jetbrains.ktor.application.*
import org.jetbrains.ktor.content.*
import org.jetbrains.ktor.features.*
import org.jetbrains.ktor.routing.*
import org.jetbrains.ktor.sessions.*
import org.jetbrains.ktor.util.*
import org.jetbrains.ktor.websocket.*
import org.jetbrains.ktor.host.*
import org.jetbrains.ktor.http.*
import org.jetbrains.ktor.jetty.*
import org.joda.time.DateTime

import java.time.*

data class ChatSession(val id: String)

fun Application.module() {
    install(DefaultHeaders)
    install(CallLogging)
    install(WebSockets) {
        pingPeriod = Duration.ofMinutes(1)
    }

    install(Routing) {
        install(Sessions) {
            cookie<ChatSession>("SESSION")
        }

        intercept(ApplicationCallPipeline.Infrastructure) {
            if(call.sessions.get<ChatSession>() == null) {
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
            val session = this

            if ( sessionID == null ) {
                close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "No session"))
                return@webSocket
            }

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

            println("Started websocket connection ${DateTime.now().toLocalDateTime()}")
            println("[$id] a client connected ${call.request.local.host}")
            users.add(protocol.user)

            try {
                incoming.consumeEach({ frame ->
                    if (frame is Frame.Text) {

                        // println("[$id] client sent us: $message")
                        val message = frame.readText()

                        val stringBuilder = StringBuilder(message)
                        val CPOW = parser.parse(stringBuilder) as JsonObject
                        try {
                            // Get message
                            val actionType: ActionType = ActionType.valueOf(CPOW["actionType"] as String)
                            val timestamp: DateTime = DateTime.now()

                            var content = ""
                            if (CPOW["content"] !== null) {
                                content = CPOW["content"] as String
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

                            protocol.message = Message(timestamp, content)
                            protocol.contacts = mutableListOf()
                            protocol.chats = mutableListOf()
                            protocol.actionType = actionType
                            protocol.userList = mutableListOf()

                            when (actionType) {
                                ActionType.USER_CONNECT -> {
                                    val asyncConnect = launch(CommonPool) {
                                        // TODO Make user shown online
                                        protocol.responseType = ResponseType.SUCCESS
                                        protocol.header.setAdditionalText = "[chatty-service]: ${protocol.user.username} is connected!"
                                        val response = parseCPOW(protocol).toJsonString()
                                        session.send(Frame.Text(response))
                                    }
                                }

                                ActionType.USER_DISCONNECT -> {
                                    val asyncDisconnect = launch(CommonPool) {
                                        println("Close connection to client!")
                                        // TODO Make user shown online
                                        protocol.responseType = ResponseType.SUCCESS
                                        protocol.header.setAdditionalText = "[chatty-service]: You are offline now!"
                                        val response = parseCPOW(protocol).toJsonString()
                                        session.send(Frame.Text(response))
                                        //close(CloseReason(CloseReason.Codes.GOING_AWAY, "client left"))
                                    }
                                }

                                ActionType.USER_CREATE_CHAT -> {
                                    val asyncChatCreation = launch(CommonPool) {
                                        val participant = CPOW["participant"] as String

                                        // Create a chat
                                        val chat: Chat = Chat()
                                        chat.addParticipant(user)

                                        // Find partner in global list
                                        val partner = mutableListOf<User>()
                                        users.filter {
                                            it.name == participant
                                        }.forEach {
                                            partner.add(it)
                                        }

                                        if (partner.size > 0) {
                                            // Addd participant
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

                                ActionType.USER_REGISTER_ACCOUNT -> {
                                    val asyncAuth = launch(CommonPool) {

                                        // Set credentials
                                        auth.username = CPOW["username"] as String
                                        auth.name = CPOW["name"] as String
                                        auth.password = CPOW["password"] as String
                                        protocol = auth.register()

                                        val response = parseCPOW(protocol).toJsonString()
                                        session.send(Frame.Text(response))
                                    }
                                }

                                ActionType.USER_LOGIN_ACCOUNT -> {
                                    val asyncAuth = launch(CommonPool) {

                                        // Set credentials
                                        auth.username = CPOW["username"] as String
                                        auth.password = CPOW["password"] as String
                                        protocol = auth.login()

                                        if (protocol.user.token.toString() != "") {
                                            val response = parseCPOW(protocol).toJsonString()
                                            session.send(Frame.Text(response))
                                        }
                                    }
                                }

                                ActionType.USER_FIND_FRIEND -> {
                                    val asyncSearchFriend = launch(CommonPool) {
                                        // TODO return name and picture of user

                                        val searchedUser = CPOW["header"] as String
                                        val currentUser = protocol.user.username

                                        val getListOfUsernames: MutableList<String> = mutableListOf()

                                        if(searchedUser.isNotEmpty()) {
                                            // Get array of possible uers
                                            getListOfUsernames.addAll(getListOfMatchedUsername(searchedUser, currentUser))
                                        }

                                        protocol.userList = getListOfUsernames
                                        val responseFriend = parseCPOW(protocol).toJsonString()
                                        session.send(Frame.Text(responseFriend))
                                    }
                                }

                                ActionType.USER_ADD_FRIEND -> {
                                    // TODO create user add process
                                    val asyncAdd = launch(CommonPool) {
                                        session.send(Frame.Text("This does not exist yet."))
                                    }
                                }

                                ActionType.USER_DELETE_FRIEND -> {
                                    val asyncDelete = launch(CommonPool) {
                                        session.send(Frame.Text("This does not exist yet."))
                                    }
                                }

                                else -> {
                                    session.send(Frame.Text("Unknown message type!"))
                                }
                            }
                        } catch (e: TypeCastException) {
                            // This really shouldn't happen
                            println(e.printStackTrace())
                        } catch (e: IllegalArgumentException) {
                            // Happen with wrong action type request
                            println(e.printStackTrace())
                        }
                    }
                })
            }  finally {
                if (protocol.user.username.isNullOrEmpty()) {
                    println("[chatty-service]: $id disconnected")
                }else {
                    println("[chatty-service]: ${protocol.user.username} disconnected")
                }
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