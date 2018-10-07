package de.ginoatlas.chatty

// For JSON
import com.google.gson.GsonBuilder
import mu.KotlinLogging
import java.util.*
import kotlin.collections.ArrayList

/**
 * Created by GinoHereIam on 30.06.17.
 *
 */

//
// PROTOCOL DEFINITION
//

/*
    TODO Create own library which the client/service can use the protocol
*/


// Global constants
const val user_minimumLength = 4
const val user_maxLength = 15
const val message_content_maxLength = 1024
const val password_hash_length = 512

private val apiLogger = KotlinLogging.logger {}

open class Chat(
        var chatID: UUID = UUID.randomUUID(),
        var members: ArrayList<User> = arrayListOf(),
        var messages: Map<User, Message> = mapOf()
)

// TODO add isConnected state
class User {
    // INFO Set user minimum length
    val minimumLength: Int = user_minimumLength

    // INFO Unique user name
    var username: String = ""
    // INFO Display name
    var name: String = ""
    // INFO Credential token
    lateinit var token: UUID
    // INFO the picture data is being hold in a byte array
    var photo: ByteArray? = null
}

data class Password(
        var encrypted: String = "42",
        val minimumLength: Int = 8
)

enum class ResponseType {
    SUCCESS,
    FAILED,
    NONE
}

enum class ActionType {
    // Actions to friends
    USER_FIND_FRIEND,
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

    // Actions to settings
    USER_UPDATE_PICTURE,
    USER_UPDATE_NAME,
    USER_UPDATE_PASSWORD,

    // Actions to connection
    USER_CONNECT,
    USER_DISCONNECT,

    // Default
    NONE
}

class Message {
    // INFO Each message has a counter to identify the message
    var id: Int = 0

    // INFO Each message has a timestamp
    lateinit var timestamp: String

    // INFO the actual message content
    lateinit var content: String
}

class Header {
    // INFO To send extra information to the client or server
    lateinit var additionalText: String
}

data class Version(
        // INFO version information
        val author: String = "ThraaxSession",
        val service: String = "Alpha",
        val license: String = "MIT License",
        val homepage: String = "https://gitbucket.gino-atlas.de/Chatty/chatty-service",
        val thirdParties: String = "ReactJS & Material-Ui & Google material icons & with ♥ Kotlin/Ktor."
)

// INFO wrap up all data container
class CPoW {
    lateinit var actionType: ActionType
    lateinit var responseType: ResponseType
    lateinit var user: User
    lateinit var participant: User
    lateinit var password: Password
    lateinit var message: Message
    lateinit var contacts: ArrayList<String>
    lateinit var userList: ArrayList<String>
    lateinit var chats: ArrayList<Chat>

    lateinit var header: Header

    // TODO For verification compatibility
    lateinit var version: Version
}

fun parseCPOW(protocol: CPoW): String {
    val gson = GsonBuilder().create()
    val json = gson.toJson(protocol)

    apiLogger.trace { "GSON JSON: $json" }
    return json
}