package de.ginoatlas.chatty

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SchemaUtils.create
import org.jetbrains.exposed.sql.SchemaUtils.drop

/*
object Users : Table() {
    val id: varchar("id", 0).primaryKey()
}
*/