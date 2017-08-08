package de.ginoatlas.chatty

import de.ginoatlas.chatty.util.Ciphertext
import de.ginoatlas.chatty.util.encryptGcm
import de.ginoatlas.chatty.util.generateKey
import java.util.*

data class Authentication(val users: MutableList<User>, val proto: CPoW) {
    // Has to be set always!
    var password: String = ""
        set

    var username: String = ""
        set

    var name: String = ""
        set

    // Register and get a credential token
    suspend fun register(): CPoW {

        // Checking for password/username or registered token!
        if (password == "" || username == "") {
            proto.responseType = ResponseType.FAILED
            proto.header.setAdditionalText = "[chatty-service]: either no password/username provided!"
            return proto
        }

        /*
         * FIXME even it is only for runtime! Actually data should come from database
         * 1. user is already in global user list
         * 2. the token is changed
         * ... this should work on different connections with same user
         */

        // Those users are the current connected one
        users.filter {
            it.username == username
        }.forEach {
            // The user seems to be already in global list
            if (!it.token.equals(UUID.fromString("00000000-0000-0000-0000-000000000000"))) {
                // it's in global list + credential token already changed!
                proto.responseType = ResponseType.FAILED
                proto.header.setAdditionalText = "[chatty-service]: ${it.name} is already registered!"
                return proto
            }
        }

        val enc = encrypt(proto)
        val protocol = enc.keys.first()
        if (enc.values.first() != null) {
            // TODO good place to save user credentials in database

            protocol.user.token = UUID.randomUUID()
            // Set user defined properties
            protocol.user.username = username
            protocol.user.name = name
            // Set server informations
            protocol.header.setAdditionalText = "[chatty-service]: ${proto.user.name} is registered!"
            protocol.responseType = ResponseType.SUCCESS

            return protocol
        }else {
            protocol.header.setAdditionalText = "[chatty-service]: could not encrypt password."
            protocol.responseType = ResponseType.FAILED

            return protocol
        }
    }

    // TODO return the login token
    suspend fun login(): String {
        return ""
    }

    private suspend fun encrypt(prot: CPoW): Map<CPoW, Ciphertext?> {
        try {
            // We should move it in an extra function
            // useful for registration and login
            val key = generateKey(128)
            val encrypted = encryptGcm(password.toByteArray(), key)
            // This is the string we save
            return mapOf(prot to encrypted)
        } catch (e: Exception) {
            // Let's get the stacktrace, even this should enver happen
            println(e.printStackTrace())

            prot.responseType = ResponseType.FAILED
            prot.header.setAdditionalText =
                    "[chatty-service]: Something went wrong during encrypting and saving your password.\n" +
                            "Please provide the stacktrace: ${e.printStackTrace()}"
            return mapOf(prot to null)
        }
    }
}
