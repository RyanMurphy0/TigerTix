const {callLLM, parseWithFallback} = require('../services/llmService');
const axios = require('axios');

const CLIENT_SERVICE_URL = process.env.CLIENT_SERVICE_URL || 'http://localhost:6001';

/**
 * Parse natural language booking request using LLM
 */
const parseBookingRequest = async (req, res) => {
    const {message} = req.body;

    if(!message || message.trim() === ''){
        return res.status(400).json({
            error: 'Message is required',
            success: false
        });
    }

    try{
        console.log(`Parsing message: "${message}"`);  

        // get available events from client service
        const eventsResponse = await axios.get(`${CLIENT_SERVICE_URL}/api/events`);
        const availableEvents = eventsResponse.data;

        // call LLM to parse user message
        const parsed = await callLLM(message, availableEvents);

        //return parsed data but no booking execution
        res.json({
            success: true,
            parsed: parsed,
            message: `I found "${parsed.eventName}". You want to book ${parsed.tickets} ticket(s). Please confirm to proceed.`  // ← BACKTICKS
        });

    }catch(error){
        console.error('Error parsing booking request:', error.message);  

        try{
            const fallbackParsed = parseWithFallback(message);
            res.json({
                success: true,
                parsed: fallbackParsed,
                message: `I think you want to book ${fallbackParsed.tickets} ticket(s) for "${fallbackParsed.eventName}". Please confirm to proceed.`,  // ← BACKTICKS
                usedFallback: true
            });
        }catch(fallbackError){
            res.status(500).json({
                error: 'Could not parse booking request. Please try: "Book [number] tickets for [event name]"',
                success: false
            });
        }
    }
};

/**
 * Confirm and execute booking after confirmation
 */
const confirmBooking = async (req, res) => {
    const {eventId, tickets, eventName} = req.body;  

    if(!eventId || !tickets){
        return res.status(400).json({
            error: 'Event ID and ticket count are required',
            success: false
        });
    }

    try{
        console.log(`Confirming booking: ${tickets} tickets for event ID: ${eventId}`);  

        // call client service to create booking
        const bookingResponse = await axios.post(
            `${CLIENT_SERVICE_URL}/api/events/${eventId}/purchase`,  
            {tickets: parseInt(tickets)}
        );

        res.json({
            success: true,
            message: `Successfully booked ${tickets} ticket(s) for "${eventName}".`,  
            booking: bookingResponse.data
        });
    }catch(error){
        console.error('Booking failed:', error.response?.data || error.message);
        
        res.status(error.response?.status || 500).json({ 
            error: error.response?.data?.error || 'Booking failed. The event may be sold out or unavailable.',
            success: false 
        });
    }
};

/**
 * Get available events (helper endpoint for frontend)
 */
const getAvailableEvents = async (req, res) => {
    try {
        const eventsResponse = await axios.get(`${CLIENT_SERVICE_URL}/api/events`);
        res.json(eventsResponse.data);
    } catch (error) {
        console.error('Error fetching events:', error.message);
        res.status(500).json({ 
            error: 'Could not fetch events',
            success: false 
        });
    }
};

module.exports = { 
    parseBookingRequest, 
    confirmBooking,
    getAvailableEvents
};