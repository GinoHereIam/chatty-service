package de.ginoatlas.chatty

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SchemaUtils.create
import org.jetbrains.exposed.sql.SchemaUtils.drop

/*
    TODO draw UML model
 */

object Users : Table() {
    val id = integer("id").autoIncrement().primaryKey()
    val username = varchar("username", user_maxLength)
    val name = varchar("name", user_maxLength)
    val password = varchar("password", password_hash_length)
}

object Contacts : Table() {
    val id = integer("id").autoIncrement().primaryKey()
    val username = varchar("username", user_maxLength)
    val contactname = (integer("user_id") references Users.id)
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
    // Customize path to database
    Database.connect("jdbc:h2:~/.chatty/storage", driver = "org.h2.Driver")
}

fun setupDB() {
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
    val listOfUsers: MutableList<String> = mutableListOf()
    transaction {
        Users.selectAll().forEach {
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