package de.ginoatlas.chatty
import java.util.*
import java.security.MessageDigest
import kotlin.experimental.and


data class Authentication(val users: MutableList<User>, val proto: CPoW) {
    // Has to be set always!
    var password: String = ""
        set

    var username: String = ""
        set

    var name: String = ""
        set

    private var encrypted: String = ""

    // Register and get a credential token
    suspend fun register(): CPoW {

        // Checking for password/username or registered token!
        if (password == "" || username == "" || name == "") {
            proto.responseType = ResponseType.FAILED
            proto.header.setAdditionalText = "[chatty-service]: either no password/username/name provided!"
            return proto
        }

        // Check password length
        if(password.length < 8) {
            proto.responseType = ResponseType.FAILED
            proto.header.setAdditionalText = "[chatty-service]: Your password needs to be at least 8 chars long!"
            return proto
        }

        if(username.length < 4 || name.length < 4) {
            proto.responseType = ResponseType.FAILED
            proto.header.setAdditionalText = "[chatty-service]: Your username/name needs to be at least 4 chars long!"
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
        encrypted = enc.values.first()
        if (encrypted != "") {

            // TODO good place to save user credentials in database

            protocol.user.token = UUID.randomUUID()
            // Set user defined properties
            protocol.user.username = username
            protocol.user.name = name
            // Set server informations
            protocol.header.setAdditionalText = "[chatty-service]: ${proto.user.username} is registered!"
            protocol.responseType = ResponseType.SUCCESS
            return protocol

        }else {
            protocol.header.setAdditionalText = "[chatty-service]: could not encrypt password."
            protocol.responseType = ResponseType.FAILED

            return protocol
        }
    }

    // TODO return the login token
    suspend fun login(): CPoW {
        val enc = encrypt(proto)
        val protocol = enc.keys.first()
        val _encrypted = enc.values.first()

        // TODO get encrypted password from DB
        if(_encrypted == encrypted) {
            protocol.responseType = ResponseType.SUCCESS
            protocol.header.setAdditionalText = "[chatty-service]: ${protocol.user.name} has been successfully logged in!"

            return protocol
        }else {
            protocol.responseType = ResponseType.FAILED
            protocol.header.setAdditionalText = "[chatty-service]: ${protocol.user.name} has been failed to log in! Wrong password?"

            return protocol
        }
    }

    private suspend fun encrypt(prot: CPoW): Map<CPoW, String> {

        try {
            val MD = MessageDigest.getInstance("SHA-512")
            MD.update(password.toByteArray())

            val byteData = MD.digest()

            val sb = StringBuffer()
            for (i in 0..byteData.size - 1) {
                sb.append(Integer.toString((byteData[i] and 0xff.toByte()) + 0x100, 16).substring(1))
            }

            val hex = sb.toString()

            return mapOf(prot to hex)

        }catch(e: Exception) {
            // Let's get the stacktrace, even this should never happen
            println(e.printStackTrace())

            prot.responseType = ResponseType.FAILED
            prot.header.setAdditionalText =
                    "[chatty-service]: Something went wrong during encrypting and saving your password.\n" +
                            "Please provide the stacktrace: ${e.printStackTrace()}"
            return mapOf(prot to "")
        }
    }
}
