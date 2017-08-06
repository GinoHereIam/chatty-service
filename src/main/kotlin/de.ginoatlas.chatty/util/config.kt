package de.ginoatlas.chatty.util
import com.beust.klaxon.Parser
import com.natpryce.konfig.*
import com.natpryce.konfig.ConfigurationProperties.Companion.systemProperties
import java.io.File

/**
 * Created by gino on 18.07.17.
 */

object service : PropertyGroup() {
    val port by intType
    val host by stringType
}

class PropertyManager(val file: String = "") {
    fun getConfig() : Configuration {
        if(file != "") {
            return systemProperties() overriding
                    EnvironmentVariables() overriding
                    ConfigurationProperties.fromFile(File(file)) overriding
                    ConfigurationProperties.fromResource("default.properties")
        }else{
            return systemProperties() overriding
                    EnvironmentVariables() overriding
                    ConfigurationProperties.fromResource("default.properties")
        }
    }
}

fun parse(name: String) : Any? {
    val cls = Parser::class.java
    return cls.getResourceAsStream(name)?.let { inputStream ->
        return Parser().parse(inputStream)
    }
}