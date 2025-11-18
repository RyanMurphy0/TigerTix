const Database = require('better-sqlite3');
const path = require('path');

// initialize the database connection
const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

// create users table
const initDB = () => {
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;
    db.exec(createTableSQL);
    console.log('Users table initialized');
};

// create new user
const createUser = (email, hashedPassword) => {
    const stmt = db.prepare(`INSERT INTO users (email, password) VALUES (?, ?)`);
    try{
        const info = stmt.run(email, hashedPassword);
        return {id: info.lastInsertRowid, email};
    } catch (error) {
        if(error.code === 'SQLITE_CONSTRAINT'){
            throw new Error('Email already exists');
        }
        throw error;
    }
};

// find user by email
const findUserByEmail = (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
};

const findUserById = (id) => {
    const stmt = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?');
    return stmt.get(id);
};

module.exports = {
    initDB,
    createUser,
    findUserByEmail,
    findUserById
};