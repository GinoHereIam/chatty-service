package de.ginoatlas.chatty

import mu.KotlinLogging
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SchemaUtils.create

/*
    TODO draw UML model
 */
val dbLogger = KotlinLogging.logger {}
object Users : Table() {
    val id = integer("id").autoIncrement().primaryKey()
    val username = varchar("username", user_maxLength)
    val name = varchar("name", user_maxLength)
    val password = varchar("password", password_hash_length)
}

object Contacts : Table() {
    val id = integer("id").autoIncrement().primaryKey()
    val contact = varchar("contact", user_maxLength)
    val userid = (integer("user_id") references Users.id)
}

object Messages : Table() {
    val id = integer("id").autoIncrement().primaryKey()
    val text = varchar("text", message_content_maxLength)
}

object Chats : Table() {
    val chatID = (integer("chat_id").autoIncrement().primaryKey())
    val msgID = (integer("msg_id") references Messages.id)
}

fun initDB() {
    val db = "jdbc:h2:~/.chatty/storage"

    // Customize path to database
    dbLogger.info { "Initialize database." }
    dbLogger.debug { "Database path: $db" }
    Database.connect(db, driver = "org.h2.Driver")
}

fun setupDB() {
    dbLogger.info { "Set up tables." }
    transaction {
        create(Users, Contacts, Messages, Chats)
    }
}

/**
 * Insert a user to the database
 * @param username
 * @param name
 * @param password
 * @return get the user id which is equal to the database index
 */
fun dbRegister(username: String, name: String, password: String): Int {
    dbLogger.debug { "Registering username: $username, name: $name, password: $password" }

    var userID: Int = -1
    transaction {
        userID = Users.insert {
            it[Users.username] = username
            it[Users.name] = name
            it[Users.password] = password
        } get Users.id
    }

    return userID
}

/**
 * @param username
 * @param password
 * @return the user id
 */
fun dbLogin(username: String, password: String): Int {
    dbLogger.debug { "Login username: $username, password: $password" }

    var userID: Int = -1
    transaction {
        Users.select {
            Users.username.eq(username)
        }.forEach {
            if(it[Users.password] == password) {
                userID = it[Users.id]
            }
        }
    }
    return userID
}

/**
 * @param username
 * @return the user id
 */
fun dbFindUserByUsername(username: String): Int {
    dbLogger.debug { "Find username: $username" }

    var userID: Int = -1
    transaction {
        Users.select {
            Users.username.eq(username)
        }.forEach {
            userID = it[Users.id]
        }
    }
    return userID
}

/**
 * @param username
 * @return get a list of usernames which matches the input
 */
fun getListOfMatchedUsername(username: String, currentUser: String): MutableList<String> {
    dbLogger.debug { "Matching username: $username, currentUser: $currentUser" }
    val listOfUsers: MutableList<String> = mutableListOf()
    transaction {
        Users.selectAll().forEach {
            // Get the looked up username but not the own one
            if(it[Users.username].contains(username) && ! it[Users.username].contains(currentUser)) {
                listOfUsers.add(it[Users.username])
            }
        }
    }
    return listOfUsers
}

/**
 * @param username
 * @return returns the name
 */
fun dbFindNameByUsername(username: String): String {
    dbLogger.debug { "Find name by username: $username" }

    var name = ""
    transaction {
        Users.select {
            Users.username.eq(username)
        }.forEach {
            name = it[Users.name]
        }
    }
    return name
}

/**
 * @param username
 * @return the user object
 */

/*
fun dbFindUserObjectByUsername(username: String): User {
    transaction {
        Users.select {
            Users.username.eq(username)
        }.forEach {
            return it as User
        }
    }
}
*/

/**
 * @param username
 * @param contact
 */
fun dbAddContact(username: String, contact: String): Boolean {
    dbLogger.debug { "$username is adding $contact to list" }

    // Find ID by user
    val userID = dbFindUserByUsername(username)
    var alreadyAdded = ""

    transaction {
        Contacts.select{
            Contacts.contact.eq(contact)
        }.forEach {
            dbLogger.debug { "$it is already in your contact list" }
            alreadyAdded = it[Contacts.contact]
        }

        if(alreadyAdded.isEmpty()) {
            Contacts.insert {
                it[Contacts.contact] = contact
                it[Contacts.userid] = userID
            }
        }
    }

    return alreadyAdded.isNotEmpty()
}

fun dbFindAllFriends(username: String): MutableList<String> {
    dbLogger.debug { "Find all friends by user: $username" }

    val userID = dbFindUserByUsername(username)
    val listOfFriends = mutableListOf<String>()

    transaction {
        Contacts.select {
            // Find all contacts matching to corresponding user
            Contacts.userid.eq(userID)
        }.forEach {
            // Add all contacts to the list
            listOfFriends.add(it[Contacts.contact])
        }
    }

    return listOfFriends
}