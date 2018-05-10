package de.ginoatlas.chatty

import mu.KotlinLogging
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SchemaUtils.create
import java.nio.file.Paths

/*
    TODO draw UML model
 */
val dbLogger = KotlinLogging.logger {}
object UsersTable : Table() {
    val id = integer("id").autoIncrement().primaryKey()
    val username = varchar("username", user_maxLength)
    val name = varchar("name", user_maxLength)
    val password = varchar("password", password_hash_length)
}

object ContactsTable : Table() {
    val id = integer("id").autoIncrement().primaryKey()
    val contact = varchar("contact", user_maxLength)
    val userid = (integer("user_id") references UsersTable.id)
}

object MessagesTable : Table() {
    val id = integer("id").autoIncrement().primaryKey()
    val text = varchar("text", message_content_maxLength)
    val sender = (integer("sender") references UsersTable.id)
    val recipient = (integer("recipient") references UsersTable.id)
}

object ChatsTable : Table() {
    val chatID = (integer("chat_id").autoIncrement().primaryKey())
    val msgID = (integer("msg_id") references MessagesTable.id)
}

fun initDB() {
    val homeDir = System.getProperty("user.home")
    val pathToDb = Paths.get(homeDir, ".chatty", "storage")
    val db = "jdbc:h2:$pathToDb"

    // Customize path to database
    dbLogger.info { "Initialize database." }
    dbLogger.debug { "Database path: $db" }
    Database.connect(db, driver = "org.h2.Driver")
}

fun setupDB() {
    dbLogger.info { "Set up tables." }
    transaction {
        create(UsersTable, ContactsTable, MessagesTable, ChatsTable)
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
        userID = UsersTable.insert {
            it[UsersTable.username] = username
            it[UsersTable.name] = name
            it[UsersTable.password] = password
        } get UsersTable.id
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
        UsersTable.select {
            UsersTable.username.eq(username)
        }.forEach {
            if(it[UsersTable.password] == password) {
                userID = it[UsersTable.id]
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
        UsersTable.select {
            UsersTable.username.eq(username)
        }.forEach {
            userID = it[UsersTable.id]
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
        UsersTable.selectAll().forEach {
            // Get the looked up username but not the own one
            if(it[UsersTable.username].contains(username) && ! it[UsersTable.username].contains(currentUser)) {
                listOfUsers.add(it[UsersTable.username])
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
        UsersTable.select {
            UsersTable.username.eq(username)
        }.forEach {
            name = it[UsersTable.name]
        }
    }
    return name
}

/**
 * @param username
 * @return the user object
 */

fun dbFindUserObjectByUsername(username: String): User {
    val user = User()

    transaction {
        UsersTable.select {
            UsersTable.username.eq(username)
        }.forEach {
            user.username = it[UsersTable.username]
            user.name = it[UsersTable.name]
        }
    }

    return user
}

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
        ContactsTable.select{
            ContactsTable.contact.eq(contact)
        }.forEach {
            dbLogger.debug { "$it is already in your contact list" }
            alreadyAdded = it[ContactsTable.contact]
        }

        if(alreadyAdded.isEmpty()) {
            ContactsTable.insert {
                it[ContactsTable.contact] = contact
                it[ContactsTable.userid] = userID
            }
        }
    }

    return alreadyAdded.isNotEmpty()
}

fun dbFindAllFriends(username: String): ArrayList<String> {
    dbLogger.debug { "Find all friends by user: $username" }

    val userID = dbFindUserByUsername(username)
    val listOfFriends = arrayListOf<String>()

    transaction {
        ContactsTable.select {
            // Find all contacts matching to corresponding user
            ContactsTable.userid.eq(userID)
        }.forEach {
            // Add all contacts to the list
            listOfFriends.add(it[ContactsTable.contact])
        }
    }

    return listOfFriends
}