// backend/client-service/controllers/clientController.js

const { getAllEvents, purchaseTicket } = require('../models/clientModel');

/**
 * Controller function to list all events
 * Handles GET /api/events
 */
const listEvents = async (req, res) => {
    try {
        const events = await getAllEvents();
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve events',
            details: error.message 
        });
    }
};

/**
 * Controller function to handle ticket purchase
 * Handles POST /api/events/:id/purchase
 */
const handlePurchase = async (req, res) => {
    const eventId = req.params.id;

    // Validate event ID
    if (!eventId || isNaN(eventId)) {
        return res.status(400).json({ 
            error: 'Invalid event ID' 
        });
    }

    try {
        const result = await purchaseTicket(parseInt(eventId));
        res.status(200).json(result);
    } catch (error) {
        console.error('Error purchasing ticket:', error);
        
        // Handle specific error cases
        if (error.message === 'Event not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'No tickets available') {
            return res.status(400).json({ error: error.message });
        }
        
        // Generic server error
        res.status(500).json({ 
            error: 'Failed to purchase ticket',
            details: error.message 
        });
    }
};

module.exports = { listEvents, handlePurchase };
