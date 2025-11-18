// backend/client-service/models/clientModel.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the shared database
const dbPath = path.join(__dirname, '../../shared-db/database.sqlite');
const db = new sqlite3.Database(dbPath);

/**
 * Get all events from the database
 * @returns {Promise} Resolves with array of event objects
 */
const getAllEvents = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM events';
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * Purchase a ticket for an event (decrements available tickets)
 * @param {number} eventId - The ID of the event
 * @returns {Promise} Resolves with success message or rejects with error
 */
const purchaseTicket = (eventId) => {
    return new Promise((resolve, reject) => {
        // Start a transaction to ensure atomicity
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // First, check current ticket count
            const selectQuery = 'SELECT tickets_available FROM events WHERE id = ?';
            db.get(selectQuery, [eventId], (err, row) => {
                if (err) {
                    db.run('ROLLBACK');
                    return reject(err);
                }
                
                if (!row) {
                    db.run('ROLLBACK');
                    return reject(new Error('Event not found'));
                }

                if (row.tickets_available <= 0) {
                    db.run('ROLLBACK');
                    return reject(new Error('No tickets available'));
                }

                // Decrement ticket count
                const updateQuery = 'UPDATE events SET tickets_available = tickets_available - 1 WHERE id = ?';
                db.run(updateQuery, [eventId], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }

                    db.run('COMMIT');
                    resolve({ 
                        message: 'Ticket purchased successfully',
                        remainingTickets: row.tickets_available - 1
                    });
                });
            });
        });
    });
};

module.exports = { getAllEvents, purchaseTicket };
