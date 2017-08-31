package de.ginoatlas.chatty

import java.util.*
import java.security.MessageDigest
import kotlin.experimental.and


data class Authentication(private val users: MutableList<User>, private val proto: CPoW) {
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

        var isRegistered = false

        // Checking for password/username or registered token!
        if (password == "" || username == "" || name == "") {
            proto.responseType = ResponseType.FAILED
            proto.header.setAdditionalText = "[chatty-service]: either no password/username/name provided!"
            return proto
        }

        // Check password length
        if (password.length < proto.password.minimumLength) {
            proto.responseType = ResponseType.FAILED
            proto.header.setAdditionalText = "[chatty-service]: Your password needs to be at least ${proto.password.minimumLength} chars long!"
            return proto
        }

        if (username.length < proto.user.minimumLength || name.length < proto.user.minimumLength) {
            proto.responseType = ResponseType.FAILED
            proto.header.setAdditionalText = "[chatty-service]: Your username/name needs to be at least ${proto.user.minimumLength} chars long!"
            return proto
        }

        if (dbFindUserByUsername(username) != -1) isRegistered = true

        val enc = encrypt(proto)
        val protocol = enc.keys.first()
        encrypted = enc.values.first()
        if (encrypted != "") {
            if (!isRegistered) {
                dbRegister(username, name, encrypted)
            }
            protocol.user.token = UUID.randomUUID()
            // Set user defined properties
            protocol.user.username = username
            protocol.user.name = name
            // Set server informations
            protocol.header.setAdditionalText = "[chatty-service]: ${protocol.user.username} is registered!"
            protocol.responseType = ResponseType.SUCCESS
            return protocol

        } else {
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

        val userID = dbLogin(username, _encrypted)
        return if (userID != -1) {
            protocol.responseType = ResponseType.SUCCESS
            protocol.user.username = username
            // This might be empty, if the user didn't register in same
            // That's why we get it from database
            protocol.user.name = dbFindNameByUsername(username)
            protocol.header.setAdditionalText = "[chatty-service]: ${protocol.user.username} has been successfully logged in!"
            protocol
        } else {
            protocol.responseType = ResponseType.FAILED
            protocol.user.username = username
            protocol.header.setAdditionalText = "[chatty-service]: ${protocol.user.username} has been failed to log in! Wrong password?"
            protocol
        }
    }

    private suspend fun encrypt(prot: CPoW): Map<CPoW, String> {

        try {
            val MD = MessageDigest.getInstance("SHA-512")
            MD.update(password.toByteArray())

            val byteData = MD.digest()

            val sb = StringBuffer()
            for (i in 0 until byteData.size) {
                sb.append(Integer.toString((byteData[i] and 0xff.toByte()) + 0x100, 16).substring(1))
            }

            val hex = sb.toString()

            return mapOf(prot to hex)

        } catch (e: Exception) {
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
