package de.ginoatlas.chatty

import com.beust.klaxon.Parser
import com.google.gson.GsonBuilder
import de.ginoatlas.chatty.util.PropertyManager
import kotlinx.coroutines.experimental.channels.*
import mu.KotlinLogging
import io.ktor.gson.*
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
import java.text.DateFormat
import java.time.*
import java.time.format.DateTimeFormatter
import java.util.*
import kotlin.collections.ArrayList


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
    install(ContentNegotiation) {
        gson {
            setDateFormat(DateFormat.LONG)
            setPrettyPrinting()
        }
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

        // INFO Each connected user
        val users: MutableList<User> = mutableListOf()
        // INFO All chats which have been created
        // TODO Think about if we need this leak
        //val globalChats: MutableList<Chat> = mutableListOf()

        // INFO Database setup
        initDB()
        setupDB()

        webSocket("/chatty") {

            // INFO Upon each websocket connection at this endpoint, generate a random id for it
            val id = java.util.UUID.randomUUID()
            val sessionID = call.sessions.get<ChatSession>()

            if (sessionID == null) {
                close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "No session"))
                return@webSocket
            }

            val session = this
            mainLogger.info { "Started websocket connection ${DateTime.now().toLocalDateTime()}" }
            mainLogger.debug { "[$id] a client connected ${call.request.local.host}" }

            var globalUser = ""

            try {
                incoming.consumeEach { frame ->
                    if (frame is Frame.Text) {
                        val message = frame.readText()
                        mainLogger.trace { "[$id] client sent us: $message" }

                        val deserializer = Deserializer()
                        val gson = GsonBuilder().registerTypeAdapter(CPoW::class.java, deserializer).create()
                        val protocol = gson.fromJson(message, CPoW::class.java)

                        val auth = Authentication(users, protocol)
                        mainLogger.debug { "CPOW Incoming: $protocol" }

                        try {

                            // Get message
                            val actionType: ActionType = protocol.actionType

                            // Input String
                            val now = LocalDateTime.now()
                            val zdt = ZonedDateTime.now()
                            val zdt2 = now.atZone(zdt.zone)

                            val dtf = DateTimeFormatter.ofPattern("yyy-MM-dd HH:mm:ss")
                            val timestamp = dtf.format(zdt2)

                            // INFO set server timestamp
                            protocol.message.timestamp = timestamp.toString()

                            // INFO
                            // check if the current CPoW is not null and
                            // set the user name more globally and add it to global user list
                            if(protocol?.user != null) {
                                if(protocol.user.username.isNotEmpty()) {
                                    globalUser = protocol.user.username
                                    if(!users.contains(protocol.user)){
                                        users.add(protocol.user)
                                    }
                                }
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

                            // val token: UUID = if (CPOW["token"] == "")
                            // UUID.fromString("00000000-0000-0000-0000-000000000000")
                            // else UUID.fromString(CPOW["token"] as String)
                            // user.token = token

                            mainLogger.trace { "ActionType: $actionType, Protocol: $protocol" }
                            when (actionType) {
                                ActionType.USER_CONNECT -> {
                                    async {
                                        protocol.responseType = ResponseType.SUCCESS
                                        protocol.header.additionalText = "[chatty-service]: you are connected!"

                                        val response = parseCPOW(protocol)
                                        call.sessions.set(ChatSession("Connected"))
                                        session.send(Frame.Text(response))
                                    }
                                }

                                ActionType.USER_DISCONNECT -> {
                                    async {
                                        /*
                                                if(sessionID.id != "Authorized") {
                                                    protocol.responseType = ResponseType.FAILED
                                                    protocol.header.additionalText = "Not Authorized!"

                                                    val responseFriend = parseCPOW(protocol).toJsonString()
                                                    session.send(Frame.Text(responseFriend))
                                                }*/

                                        mainLogger.info { "Close connection to client!" }

                                        // TODO Make user shown offline
                                        protocol.responseType = ResponseType.SUCCESS
                                        protocol.header.additionalText = "[chatty-service]: You are offline now!"

                                        val response = parseCPOW(protocol)
                                        session.send(Frame.Text(response))
                                        //close(CloseReason(CloseReason.Codes.GOING_AWAY, "client left"))
                                    }
                                }

                                ActionType.USER_REGISTER_ACCOUNT -> {
                                    async {

                                        // Set credentials
                                        auth.username = protocol.user.username
                                        auth.name = protocol.user.name
                                        auth.password = protocol.password.encrypted
                                        val updatedProtocol = auth.register()

                                        val response = parseCPOW(updatedProtocol)
                                        session.send(Frame.Text(response))
                                    }
                                }

                                ActionType.USER_LOGIN_ACCOUNT -> {
                                    async {
                                        // Set credentials
                                        auth.username = protocol.user.username
                                        auth.password = protocol.password.encrypted

                                        mainLogger.debug {
                                            "Login: user: " +
                                                    "${protocol.user.username} password: ${protocol.password.encrypted}"
                                        }
                                        val updatedProtocol = auth.login()

                                        if(protocol.responseType == ResponseType.SUCCESS) {
                                            call.sessions.set(ChatSession("Authorized"))
                                        }

                                        // Find all friends
                                        updatedProtocol.contacts = dbFindAllFriends(updatedProtocol.user.username)

                                        val response = parseCPOW(updatedProtocol)
                                        session.send(Frame.Text(response))
                                    }
                                }

                                ActionType.USER_FIND_FRIEND -> {
                                    async {
                                        // FIXME put me in a function
                                        /*
                                                if(call.sessions.get(ChatSession("Authorized"))) {
                                                    protocol.responseType = ResponseType.FAILED
                                                    protocol.header.additionalText = "Not Authorized!"

                                                    val responseFriend = parseCPOW(protocol).toJsonString()
                                                    session.send(Frame.Text(responseFriend))
                                                }*/

                                        // TODO return name and picture of user

                                        val searchedUser = protocol.header.additionalText
                                        val currentUser = protocol.user.username
                                        val getListOfUsernames: ArrayList<String> = arrayListOf()

                                        if (searchedUser.isNotEmpty()) {
                                            // INFO Get array of possible users
                                            getListOfUsernames.addAll(
                                                    getListOfMatchedUsername(searchedUser, currentUser)
                                            )
                                        }

                                        protocol.userList = getListOfUsernames
                                        if (protocol.userList.size > 0) {
                                            protocol.responseType = ResponseType.SUCCESS
                                        }

                                        val responseFriend = parseCPOW(protocol)
                                        session.send(Frame.Text(responseFriend))
                                    }
                                }

                                ActionType.USER_ADD_FRIEND -> {
                                    // TODO create user add process
                                    async {
                                        /*
                                                if(sessionID.id != "Authorized") {
                                                    protocol.responseType = ResponseType.FAILED
                                                    protocol.header.additionalText = "Not Authorized!"

                                                    val responseFriend = parseCPOW(protocol).toJsonString()
                                                    session.send(Frame.Text(responseFriend))
                                                }*/

                                        val contact = protocol.header.additionalText
                                        val alreadyAdded = dbAddContact(protocol.user.username, contact)

                                        // Find all friends
                                        protocol.contacts = dbFindAllFriends(protocol.user.username)

                                        if (alreadyAdded) {
                                            protocol.responseType = ResponseType.FAILED
                                            val message = "[chatty-service]: is $contact already in your friends list"
                                            protocol.header.additionalText = message
                                        } else {
                                            protocol.responseType = ResponseType.SUCCESS
                                            val message = "[chatty-service]: $contact is added to your friends list"
                                            protocol.header.additionalText = message
                                        }

                                        val response = parseCPOW(protocol)
                                        session.send(Frame.Text(response))
                                    }
                                }

                                ActionType.USER_DELETE_FRIEND -> {
                                    async {
                                        /*
                                                if(sessionID.id != "Authorized") {
                                                    protocol.responseType = ResponseType.FAILED
                                                    protocol.header.additionalText = "Not Authorized!"

                                                    val responseFriend = parseCPOW(protocol).toJsonString()
                                                    session.send(Frame.Text(responseFriend))
                                                }*/

                                        protocol.responseType = ResponseType.FAILED
                                        protocol.header.additionalText = "This does not exist yet."

                                        val response = parseCPOW(protocol)
                                        session.send(Frame.Text(response))
                                    }
                                }

                                ActionType.USER_CREATE_CHAT -> {
                                    async {
                                        /*
                                                mainLogger.trace { "sessionID: ${sessionID.id}" }
                                                if(sessionID.id != "Authorized") {
                                                    protocol.responseType = ResponseType.FAILED
                                                    protocol.header.additionalText = "Not Authorized!"

                                                    val responseFriend = parseCPOW(protocol).toJsonString()
                                                    session.send(Frame.Text(responseFriend))
                                                }*/

                                        val participant = protocol.participant.username

                                        // INFO Find partner in the database and add it
                                        val userParticipantObject = dbFindUserObjectByUsername(participant)

                                        if (userParticipantObject.username.isNotEmpty()) {
                                            var chatExists = false
                                            var chatID = UUID.fromString("00000000-0000-0000-0000-000000000000")

                                            // INFO first we figure out if a chat already exists
                                            mainLogger.trace { "Chat size: ${protocol.chats.size}" }
                                            for(chat in protocol.chats) {
                                                mainLogger.trace { "ChatID: ${chat.chatID}" }
                                                chat.members.forEach{
                                                    mainLogger.trace { "   -- Members: ${it.username}" }

                                                    // INFO
                                                    // We only need to find the partner,
                                                    // the user itself will always be there.
                                                    if(it.username == userParticipantObject.username) {
                                                        chatExists = true
                                                        chatID = chat.chatID
                                                    }
                                                }
                                            }

                                            // ... if chat does not exist we will create a new one

                                            if(!chatExists){

                                                // INFO Create a chat if the partner(s) is online
                                                val chat = ChatImpl()
                                                // INFO Add the user itself to the chat
                                                chat.addParticipant(protocol.user)
                                                // INFO Add participant
                                                chat.addParticipant(userParticipantObject)

                                                mainLogger.info { "Chat was created with ${chat.chatID}" }

                                                // Set information in protocol
                                                protocol.responseType = ResponseType.NONE
                                                protocol.header.additionalText =
                                                        "[chatty-service]: " +
                                                        "chat ${chat.chatID} with $participant was created!"

                                                // INFO add chat locally ...
                                                protocol.chats.add(chat)
                                                // INFO ... and globally
                                                // globalChats.add(chat)

                                                protocol.chats.forEach{
                                                    mainLogger.trace { "${it.chatID}" }
                                                }

                                                val responseOpenChat = parseCPOW(protocol)
                                                session.send(Frame.Text(responseOpenChat))
                                            }else{
                                                // INFO Chat already exists
                                                mainLogger.trace { "Chat already exists." }

                                                // Set information in protocol
                                                protocol.responseType = ResponseType.NONE
                                                protocol.header.additionalText =
                                                        "[chatty-service]: chat $chatID already exists!"

                                                val responseOpenChat = parseCPOW(protocol)
                                                session.send(Frame.Text(responseOpenChat))
                                            }
                                        } else {
                                            mainLogger.info {
                                                "$participant does not exist. Chat could not being created."
                                            }
                                            protocol.responseType = ResponseType.FAILED
                                            protocol.header.additionalText =
                                                    "[chatty-service]: $participant does not exist!"

                                            val responseOpenChat = parseCPOW(protocol)
                                            session.send(Frame.Text(responseOpenChat))
                                        }
                                    }
                                }

                                else -> {
                                    async {
                                        protocol.header.additionalText = "Unknown message type!"
                                        protocol.responseType = ResponseType.FAILED

                                        val response = parseCPOW(protocol)
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
                }
            } finally {
                if (globalUser.isEmpty()) {
                    mainLogger.info { "[chatty-service]: $id disconnected" }
                } else {
                    mainLogger.info { "[chatty-service]: ${globalUser} disconnected" }
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