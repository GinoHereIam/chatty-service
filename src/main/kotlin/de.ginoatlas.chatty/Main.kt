package de.ginoatlas.chatty

import com.beust.klaxon.JsonObject
import com.beust.klaxon.Parser
import com.danneu.kog.*
import com.danneu.kog.batteries.logger
import com.danneu.kog.batteries.serveStatic
import de.ginoatlas.chatty.util.PropertyManager
import de.ginoatlas.chatty.util.service
import kotlinx.coroutines.experimental.CommonPool
import kotlinx.coroutines.experimental.launch
import kotlinx.coroutines.experimental.runBlocking
import org.eclipse.jetty.websocket.api.Session
import org.joda.time.DateTime
import java.time.Duration

fun main(args: Array<String>) = runBlocking<Unit> {
    val chatty_config = PropertyManager().getConfig()
    val parser = Parser()

    // Each connected user
    val users: MutableList<User> = mutableListOf()

    val router = Router {
        get("/test", fun(): Handler = {
            val websocket_test = this::class.java.getResource("/public/websocket-test.html").readText()
            Response().html(websocket_test)
        })

        // This endpoint will open a websocket connection that echos back any text the client sends it.
        get("/ws/chatty", fun(): Handler = {
            // Current limitation: The first argument to Response.websocket() must be a static url path.
            // It does *not* accept route patterns like "/ws/<num>". (#willfix)
            Response.websocket("/ws/chatty", fun(_: Request, session: Session): WebSocketHandler {
                // Upon each websocket connection at this endpoint, generate a random id for it
                val id = java.util.UUID.randomUUID()

                val password: Password = Password()
                val header: Header = Header()
                val action: ActionType = ActionType.NONE
                val response: ResponseType = ResponseType.NONE
                val user = User(session, id)

                var protocol: CPoW = CPoW(
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
                        /*
                        Basically there is no message, chat or any contact yet
                        But there are setter/getter for lateinit
                        */
                )

                val auth = Authentication(users, protocol)

                println("Started websocket connection ${DateTime.now().toLocalDateTime()}")

                // the connection should be never closed!
                session.idleTimeout = 0

                return object : WebSocketHandler {
                    override fun onOpen() {
                        println("[$id] a client connected")
                        users.add(protocol.user)
                    }

                    override fun onText(message: String) {
                        // println("[$id] client sent us: $message")

                        val stringBuilder = StringBuilder(message)
                        val cpow = parser.parse(stringBuilder) as JsonObject

                        try {
                            // Get message
                            val actionType: ActionType = ActionType.valueOf(cpow["actionType"] as String)
                            val timestamp: DateTime = DateTime.now()
                            val content: String = cpow["content"] as String
                            val message = Message(timestamp, content)

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

                            // val token: UUID = if (cpow["token"] == "") UUID.fromString("00000000-0000-0000-0000-000000000000") else UUID.fromString(cpow["token"] as String)
                            // user.token = token

                            protocol.message = message
                            protocol.contacts = mutableListOf()
                            protocol.chats = mutableListOf()
                            protocol.actionType = actionType

                            when (actionType) {
                                ActionType.USER_CONNECT -> {
                                    val asyncConnect = launch(CommonPool) {
                                        // TODO Make user shown online
                                        protocol.responseType = ResponseType.SUCCESS
                                        protocol.header.setAdditionalText = "[chatty-service]: ${protocol.user.sessionID} is connected!"
                                        val response = parseCPOW(protocol).toJsonString()
                                        session.remote.sendString(response)
                                    }
                                }

                                ActionType.USER_DISCONNECT -> {
                                    val asyncDisconnect = launch(CommonPool) {
                                        // TODO Make user shown online
                                        protocol.header.setAdditionalText = "You are offline now!"
                                        val response = parseCPOW(protocol).toJsonString()
                                        session.remote.sendString(response)
                                        session.close()
                                    }
                                }

                                ActionType.USER_CREATE_CHAT -> {
                                    val asyncChatCreation = launch(CommonPool) {
                                        val participant = cpow["participant"] as String

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
                                            session.remote.sendString(response)
                                        }else{
                                            protocol.responseType = ResponseType.FAILED
                                            protocol.header.setAdditionalText = "[chatty-service]: failed to create chat with ${participant}!"
                                        }
                                    }
                                }

                                ActionType.USER_REGISTER_ACCOUNT -> {
                                    val asyncAuth = launch(CommonPool) {

                                        // Set credentials
                                        auth.username = cpow["username"] as String
                                        auth.name = cpow["name"] as String
                                        auth.password = cpow["password"] as String
                                        protocol = auth.register()

                                        val response = parseCPOW(protocol).toJsonString()
                                        session.remote.sendString(response)
                                    }
                                }

                                ActionType.USER_LOGIN_ACCOUNT -> {
                                    val asyncAuth = launch(CommonPool) {

                                        // Set credentials
                                        auth.username = cpow["username"] as String
                                        auth.password = cpow["password"] as String
                                        protocol = auth.login()

                                        if (protocol.user.token.toString() != "") {
                                            val response = parseCPOW(protocol).toJsonString()
                                            session.remote.sendString(response)
                                        }
                                    }
                                }

                                ActionType.USER_ADD_FRIEND -> {
                                    // TODO create user add process
                                    val asyncAdd = launch(CommonPool) {
                                        session.remote.sendString("This user does not yet exist.")
                                    }
                                }

                                ActionType.USER_DELETE_FRIEND -> {
                                    val asyncDelete = launch(CommonPool) {
                                        session.remote.sendString("This user does not yet exist.")
                                    }
                                }

                                else -> {
                                    session.remote.sendString("Unknown message type!")
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

                    override fun onError(cause: Throwable) {
                        println("[$id] onError: ${cause.message}")
                    }

                    override fun onClose(statusCode: Int, reason: String?) {
                        println("[$id] onClose: $statusCode ${reason ?: "<no reason>"}")
                    }
                }
            })
        })

        // This endpoint demonstrates how to mount a websocket handler on a dynamic URL that accepts request
        // paths like /ws/1, /ws/2, /ws/3, etc.
        //
        // It also demonstrates the current limitation that the first argument to `Response.websocket()` must
        // be a static path. (#willfix)
        //
        // Due to this limitation, dynamic path websocket handlers by default will currently cause unbounded growth of
        // the internal jetty mapping of path to websocket handler until I find a better way to work with jetty.
        /*get("/ws/<>", fun(n: Int): Handler = {
            Response.websocket("/ws/$n", fun(_: Request, session: Session) = object : WebSocketHandler {
                override fun onOpen() {
                    session.remote.sendString("you connected to /ws/$n")
                }
            })
        })*/
    }

    val middleware = logger()
    val handler = middleware(router.handler())

    val public = this::class.java.getResource("/public").path
    val static =  serveStatic(public, maxAge = Duration.ofDays(365))
    Server(static(handler)).listen(chatty_config[service.port])
}

