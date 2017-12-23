package de.ginoatlas.chatty

import mu.KotlinLogging
import java.nio.ByteBuffer
import java.util.*
import kotlin.math.log

// TODO add those information to database
class Chat {
    private val logger = KotlinLogging.logger {}

    val chatID: UUID = UUID.randomUUID()
        get
    var users: MutableList<User> = mutableListOf()
    var messages: MutableList<Map<User, Message>> = mutableListOf()
        set

    init {
        logger.info { "Create a new chat with id: ${chatID}" }
    }

    suspend fun addParticipant(user: User) {
        logger.debug { "Add user to chat: $user" }
        users.add(user)
    }

    suspend fun removeParticipant(user: User) {
        logger.debug { "Remove user to chat: $user" }
        users.remove(user)
    }

    suspend fun addMessage(user: User, msg: Message, participantID: String) {
        logger.trace { "Add message '$msg' from $user to chatID '$participantID'" }

        if(users.contains(user)) {
            val user_message = mapOf(user to msg)
            messages.add(user_message)
            users.filter {
                it.name == participantID }
                    .forEach {
                        // TODO valid CPoW
                        // session.send(Frame.Text("This does not exist yet."))
                        //it.conn.remote.sendString("My message")
                    }
        }
    }
}
