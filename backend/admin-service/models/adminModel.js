/**
 * Admin Model
 * Handles database operations related to admin users.
 */

const sqlite3 = require('better-sqlite3');
const path = require('path');

//connect to db
const dbPath = path.join(__dirname, '../../shared-db/database.sqlite');
const db = new sqlite3(dbPath);

/**
 * Create a new event in the database
 * @param {string} name - Event name
 * @param {string} date - Event date (YYYY-MM-DD format)
 * @param {number} ticketsAvailable - Number of available tickets
 * @returns {object} The created event with its ID
 */
function createEvent(name, date, ticketsAvailable) {
    try{
        const stmt = db.prepare('INSERT INTO events (name, date, tickets_available) VALUES (?, ?, ?)');

        const info = stmt.run(name, date, ticketsAvailable);

        return{
            id: info.lastInsertRowid,
            name: name,
            date: date,
            tickets_available: ticketsAvailable
        };
    }catch(error){
        console.error('Error creating event:', error);
        throw error;
    }
}

module.exports = { createEvent };