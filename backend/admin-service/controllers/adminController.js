/**
 * Admin Controller
 * Handles admin-related HTTP requests.
 */

const { createEvent } = require('../models/adminModel');

/**
 * Handle POST request to create a new event
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function addEvent(req, res) {
    try{
        const { name, date, tickets_available } = req.body;

        //validate input
        if(!name || !date || tickets_available === undefined){
            return res.status(400).json({ error: 'Missing required fields: name, date, ticketsAvailable' });
        }

        //validate tickets_available is a non-negative integer
        if(typeof tickets_available !== 'number' || tickets_available < 0){
            return res.status(400).json({ error: 'ticketsAvailable must be a non-negative integer' });
        }

        // validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if(!dateRegex.test(date)){
            return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
        }

        // call model to create event
        const newEvent = createEvent(name, date, tickets_available);

        res.status(201).json({
            message: 'Event created successfully',
            event: newEvent
        });
    }catch(error){
        console.error('Error in addEvent controller:', error);
        res.status(500).json({ error: 'Internal server error' });
        }
    }

    module.exports = { addEvent };