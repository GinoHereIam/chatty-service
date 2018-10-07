package de.ginoatlas.chatty

import mu.KotlinLogging

private val logger = KotlinLogging.logger {}

// TODO add those information to database
class ChatImpl : Chat() {
    init {
        logger.info { "Create a new chat with id: ${chatID}" }
    }

    fun addParticipant(user: User) {
        logger.debug { "Add ${user.username} to chat" }
        members.add(user)
    }

    fun removeParticipant(user: User) {
        logger.debug { "Remove user to chat: $user" }
        members.remove(user)
    }

    fun addMessage(user: User, msg: Message, participantID: String) {
        logger.trace { "Add message '$msg' from $user to chatID '$participantID'" }

        if (members.contains(user)) {
            val user_message = mapOf(user to msg)
            //messages.add(user_message)
            members.filter {
                it.name == participantID
            }
                    .forEach {
                        // TODO valid CPoW
                        // session.send(Frame.Text("This does not exist yet."))
                        //it.conn.remote.sendString("My message")
                    }
        }
    }
}
