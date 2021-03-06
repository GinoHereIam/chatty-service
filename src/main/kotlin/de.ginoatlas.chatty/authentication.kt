package de.ginoatlas.chatty

import mu.KotlinLogging
import java.nio.charset.Charset
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

    private val logger = KotlinLogging.logger {}

    private var encrypted: String = ""

    // Register and get a credential token
    suspend fun register(): CPoW {

        var isRegistered = false

        // Checking for password/username or registered token!
        if (password == "" || username == "" || name == "") {
            proto.responseType = ResponseType.FAILED
            proto.header.additionalText = "[chatty-service]: either no password/username/name provided!"
            return proto
        }

        // Check password length
        if (password.length < proto.password.minimumLength) {
            proto.responseType = ResponseType.FAILED
            proto.header.additionalText = "[chatty-service]: " +
                    "Your password needs to be at least ${proto.password.minimumLength} chars long!"
            return proto
        }

        // Check username length
        if (username.length < proto.user.minimumLength || name.length < proto.user.minimumLength) {
            proto.responseType = ResponseType.FAILED
            proto.header.additionalText = "[chatty-service]: Your username/name needs " +
                    "to be at least ${proto.user.minimumLength} chars long!"
            return proto
        }

        if (dbFindUserByUsername(username) != -1) isRegistered = true

        val enc = encrypt(proto)
        val protocol = enc.keys.first()

        protocol.user.username = username
        protocol.user.name = name

        encrypted = enc.values.first()
        if (encrypted != "") {
            if (!isRegistered) {
                val userID = dbRegister(username, name, encrypted)
                if(userID != -1) {
                    protocol.user.token = UUID.randomUUID()
                    // Set server information
                    protocol.header.additionalText = "[chatty-service]: ${protocol.user.username} is registered!"
                    protocol.responseType = ResponseType.SUCCESS
                    return protocol
                }else {
                    // Set server information
                    protocol.header.additionalText = "[chatty-service]: " +
                            "${protocol.user.username} could not being registered!"
                    protocol.responseType = ResponseType.FAILED
                    return protocol
                }
            } else {
                protocol.header.additionalText = "[chatty-service]: ${protocol.user.username} is already registered!"
                protocol.responseType = ResponseType.FAILED
                return protocol
            }
        } else {
            protocol.header.additionalText = "[chatty-service]: could not encrypt the user!"
            protocol.responseType = ResponseType.FAILED
            return protocol
        }
    }

    // TODO return the login token
    suspend fun login(): CPoW {
        logger.info { "User is logging in." }
        val enc = encrypt(proto)
        val protocol = enc.keys.first()
        val _encrypted = enc.values.first()

        val userID = dbLogin(username, _encrypted)
        return if (userID != -1) {
            logger.info { "Login SUCCESSFUL." }
            protocol.responseType = ResponseType.SUCCESS
            protocol.user.username = username
            // This might be empty, if the user didn't register in same
            // That's why we get it from database
            protocol.user.name = dbFindNameByUsername(username)
            protocol.header.additionalText = "[chatty-service]: " +
                    "${protocol.user.username} has been successfully logged in!"
            protocol
        } else {
            logger.info { "Login FAILED." }
            protocol.responseType = ResponseType.FAILED
            protocol.user.username = username
            protocol.header.additionalText = "[chatty-service]: " +
                    "${protocol.user.username} has been failed to log in! Wrong password?"
            protocol
        }
    }

    private suspend fun encrypt(prot: CPoW): Map<CPoW, String> {
        logger.debug { "Encrypting password!" }

        try {
            // Decode first password!
            val passwordDecoded = String(Base64.getDecoder().decode(password), Charset.defaultCharset())
            val MD = MessageDigest.getInstance("SHA-512")
            MD.update(passwordDecoded.toByteArray())

            val byteData = MD.digest()

            val sb = StringBuffer()
            for (i in 0 until byteData.size) {
                sb.append(Integer.toString((byteData[i] and 0xff.toByte()) + 0x100, 16).substring(1))
            }

            val hex = sb.toString()

            return mapOf(prot to hex)

        } catch (e: Exception) {
            // Let's get the stacktrace, even this should never happen
            logger.error { e.printStackTrace() }

            prot.responseType = ResponseType.FAILED
            prot.header.additionalText =
                    "[chatty-service]: Something went wrong during encrypting and saving your password.\n" +
                            "Please provide the stacktrace: ${e.printStackTrace()}"
            return mapOf(prot to "")
        }
    }
}
