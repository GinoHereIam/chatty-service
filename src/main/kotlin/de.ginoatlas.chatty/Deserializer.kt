package de.ginoatlas.chatty

import com.google.gson.*
import java.lang.reflect.Type
import mu.KotlinLogging

private val deserializerLogger = KotlinLogging.logger {}
class Deserializer : JsonDeserializer<CPoW> {
    override fun deserialize(json: JsonElement?, typeOfT: Type?, context: JsonDeserializationContext?): CPoW {

        var header = Header()
        var action: ActionType = ActionType.NONE
        var response: ResponseType = ResponseType.NONE
        var version = Version()
        var password = Password()
        var participant = User()
        var user = User()
        var message = Message()
        var chats = arrayListOf<Chat>()

        val jsonObject = json?.asJsonObject
        if (jsonObject != null) {

            deserializerLogger.debug { "Incoming Data: $jsonObject" }

            if(jsonObject.has("actionType")) {
                val elem = jsonObject.get("actionType")
                if(elem != null && ! elem.isJsonNull) {
                    // INFO get ActionType
                    action = ActionType.valueOf(elem.asString)

                    deserializerLogger.trace { "Action object: $action" }
                }
            }

            if(jsonObject.has("response")) {
                val elem = jsonObject.get("response")
                if(elem != null && ! elem.isJsonNull) {
                    // INFO get ResponseType
                    response = ResponseType.valueOf(elem.asString)

                    deserializerLogger.trace { "Response object: $response" }
                }
            }

            if(jsonObject.has("password")) {
                val elem = jsonObject.get("password")
                if(elem != null && ! elem.isJsonNull) {
                    val gson = GsonBuilder().create()
                    password = gson.fromJson(elem, Password::class.java)

                    deserializerLogger.trace { "Password object: $password" }
                }
            }

            if(jsonObject.has("header")) {
                val elem = jsonObject.get("header")
                if(elem != null && ! elem.isJsonNull) {
                    val gson = GsonBuilder().create()
                    header = gson.fromJson(elem, Header::class.java)

                    deserializerLogger.trace { "Header object: $header" }

                }
            }

            if(jsonObject.has("version")) {
                val elem = jsonObject.get("version")
                if(elem != null && ! elem.isJsonNull) {
                    val gson = GsonBuilder().create()
                    version = gson.fromJson(elem, Version::class.java)

                    deserializerLogger.trace { "Version object: $version" }
                }
            }

            if(jsonObject.has("participant")) {
                val elem = jsonObject.get("participant")
                if(elem != null && ! elem.isJsonNull) {
                    val gson = GsonBuilder().create()
                    participant = gson.fromJson(elem, User::class.java)

                    deserializerLogger.trace { "Participant object: $participant" }
                }
            }

            if(jsonObject.has("user")) {
                val elem = jsonObject.get("user")
                if(elem != null && ! elem.isJsonNull) {
                    val gson = GsonBuilder().create()
                    user = gson.fromJson(elem, User::class.java)

                    deserializerLogger.trace { "Participant object: $user" }
                }
            }

            if(jsonObject.has("message")) {
                val elem = jsonObject.get("message")
                if(elem != null && ! elem.isJsonNull) {
                    val gson = GsonBuilder().create()
                    message = gson.fromJson(elem, Message::class.java)

                    deserializerLogger.trace { "Message object: $message" }
                }
            }

            if(jsonObject.has("chats")) {
                val elem = jsonObject.get("chats")
                if(elem != null && ! elem.isJsonNull) {
                    val gson = GsonBuilder().create()
                    val length = elem.asJsonArray.size()
                    val _chats = arrayListOf<Chat>()
                    if(length > 0) {
                        var counter = 0
                        do {
                            _chats.add(gson.fromJson(elem.asJsonArray[counter], Chat::class.java))
                            counter++
                        }while (counter < length)
                    }
                    chats = _chats
                    deserializerLogger.trace { "Chat object: $chats" }
                }
            }
        }

        val CPOW = CPoW()

        CPOW.actionType = action
        CPOW.responseType = response
        CPOW.user = user
        CPOW.participent = participant
        CPOW.password = password
        CPOW.message = message
        CPOW.chats = chats
        CPOW.version = version
        CPOW.header = header

        return CPOW
    }
}
