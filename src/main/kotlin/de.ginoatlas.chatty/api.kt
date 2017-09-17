package de.ginoatlas.chatty

// For JSON
import com.beust.klaxon.JsonArray
import com.beust.klaxon.json
import org.eclipse.jetty.websocket.api.Session
import org.jetbrains.ktor.websocket.DefaultWebSocketSession
import org.joda.time.DateTime
import java.util.*

/**
 * Created by gino on 30.06.17.
 *
 */

//
// PROTOCOL DEFINITION
//

/*
    TODO Create own library which the client/service can use the protocol
*/


// Global constants
val user_minimumLength = 4
val user_maxLength = 15
val message_content_maxLength = 1024
val password_hash_length = 512

// TODO add isConnected state
data class User(
        // Add more user properties here
        val conn: DefaultWebSocketSession?,
        val sessionID: UUID,
        val minimumLength: Int = user_minimumLength
) {
    // Unique user name | it's for login
    var username: String = ""
        get
        set

    // Display name
    var name: String = ""
        get
        set

    // Credential token
    var token: UUID = UUID.fromString("00000000-0000-0000-0000-000000000000")
        get
        set

    // Probably wrong type?
    var photo: Byte? = null
        get
        set
}

data class Password(
        val minimumLength: Int = 8
)

enum class ResponseType {
    SUCCESS,
    FAILED,
    NONE
}

enum class ActionType {
    // Actions to friends
    USER_ADD_FRIEND,
    USER_DELETE_FRIEND,

    // Actions to chat
    USER_CREATE_CHAT,
    USER_SEND_MESSAGE,
    USER_DELETE_MESSAGE,

    // Actions to account
    USER_REGISTER_ACCOUNT,
    USER_LOGIN_ACCOUNT,
    USER_DELETE_ACCOUNT,

    // Actions to connection
    USER_CONNECT,
    USER_DISCONNECT,

    // Default
    NONE
}

data class Message(
        val timestamp: DateTime,
        val content: String
)

data class Header(
        var additionalText: String = "") {
    var setAdditionalText: String = ""
        set(value) {
            additionalText = value
        }
}

data class Version(
        val author: String = "GinoHereIam",
        val service: String = "Alpha",
        val client: String = "0.0.0",
        val license: String = "MIT License",
        val homepage: String = "TO CREATE!",
        val thirdParties: String = "ReactJS, Material-Ui & Google material icons"
)

data class CPoW(
        val action: ActionType,
        val response: ResponseType,
        val participant: User,
        val password: Password,
        val header: Header,
        // TODO For verification compatibility
        val version: Version) {

    // Getter / Setter
    var actionType: ActionType = action
        get
        set

    var responseType: ResponseType = response
        get
        set

    var user: User = participant
        get
        set

    var messageHeader: Header = header
        get
        set

    lateinit var message: Message
        get
        set

    lateinit var contacts: MutableList<User>
        get
        set

    lateinit var chats: MutableList<Chat>
        get
        set

}

suspend fun parseCPOW(protocol: CPoW): JsonArray<Any?> {

    // FIXME use GSON
    val cpow = json {
        array(
                obj(
                        "version" to array(
                                obj(
                                        "author" to protocol.version.author
                                ),
                                obj(
                                        "service" to protocol.version.service
                                ),
                                obj(
                                        "client" to protocol.version.client
                                ),
                                obj(
                                        "homepage" to protocol.version.homepage
                                ),
                                obj(
                                        "license" to protocol.version.license
                                ),
                                obj(
                                        "thirdParties" to protocol.version.thirdParties
                                )
                        )
                ),
                obj(
                        "actionType" to protocol.actionType.name
                ),
                obj(
                        "message" to array(
                                obj(
                                        "content" to protocol.message.content
                                ),
                                obj(
                                        "timestamp" to protocol.message.timestamp.toLocalDateTime().toString()
                                )
                        )
                ),
                obj(
                        "header" to array(
                                obj(
                                        "additionalText" to protocol.header.additionalText
                                )
                        )
                ),
                obj(
                        "responseType" to protocol.responseType.name
                ),
                obj(
                        "user" to array(
                                obj(
                                        "sessionID" to protocol.user.sessionID.toString()
                                ),
                                obj(
                                        "username" to protocol.user.username
                                ),
                                obj(
                                        "name" to protocol.user.name
                                ),
                                obj(
                                        "token" to protocol.user.token.toString()
                                ),
                                obj(
                                        "minimumLength" to protocol.user.minimumLength
                                )
                        )
                ),
                obj(
                        "contacts" to array(
                                // Contacts related information
                                if (protocol.contacts.size > 0) {
                                    protocol.contacts.forEach {
                                        obj("contacts" to arrayListOf(it.name))
                                        obj("sessions" to arrayListOf(it.sessionID.toString()))
                                    }
                                } else {
                                    obj("contacts" to array())
                                    obj("sessions" to array())
                                }
                        )
                ),
                obj(
                        "chats" to array(
                                // Get each unique chat id
                                if (protocol.chats.size > 0) {
                                    protocol.chats.forEach {
                                        // Chat related information
                                        obj("chats" to protocol.chats.size)
                                        obj("chatIDs" to arrayListOf(it.chatID.toString()))
                                    }
                                } else {
                                    obj("chats" to 0)
                                    obj("chatIDs" to array())
                                }
                        )
                ),
                obj(
                        "password" to array(
                            obj("minimumLength" to protocol.password.minimumLength)
                        )
                )
        )
    }

    // TODO just for debugging
    // println(CPOW.toJsonString(true))

    return cpow
}