package de.ginoatlas.chatty

import java.nio.ByteBuffer
import java.util.*

// TODO add those information to database
class Chat {
    val chatID: UUID = UUID.randomUUID()
        get
    var users: MutableList<User> = mutableListOf()
    var messages: MutableList<Map<User, Message>> = mutableListOf()
        set

    init {
        println("Create a new chat with id: ${chatID}")
    }

    suspend fun addParticipant(user: User) {
        users.add(user)
    }

    suspend fun removeParticipant(user: User) {
        users.remove(user)
    }

    suspend fun addMessage(user: User, msg: Message, participantID: String) {
        if(users.contains(user)) {
            val user_message = mapOf(user to msg)
            messages.add(user_message)
            users.filter {
                it.name == participantID }
                    .forEach {
                        // TODO valid CPoW
                        it.conn.remote.sendString("My message")
                    }
        }
    }
}
