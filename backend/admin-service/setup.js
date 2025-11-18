/**
 * Initializes the shared database and creates tables if they don't exist
 */

const sqlite3 = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

function initializeDatabase() {
    try{
        // connect to DB
        const dbPath = path.join(__dirname, '../shared-db/database.sqlite');
        const db = new sqlite3(dbPath);

        // read SQL file
        const schemaPath = path.join(__dirname, '../shared-db/init.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        db.exec(schema);

        console.log('Database initialized successfully.');
        db.close();
    }catch(error){
        console.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = { initializeDatabase };