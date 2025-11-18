const axios = require('axios');

/**
 * Call Ollama LLM to parse user booking request
 * @param {string} userMessage - user's natural language message
 * @param {Array} availableEvents - list of available events
 * @returns {Object} parsed booking details
 */
const callLLM = async (userMessage, availableEvents) => {
    const eventList = availableEvents.map(e => `"${e.name}" (ID: ${e.id})`).join(', ');

    const systemPrompt = `You are a ticketing booking assistant for TigerTix. 
Available events: ${eventList}

Extract booking information from user messages. Return ONLY valid JSON in this exact format:
{
  "eventName": "exact event name",
  "eventId": event_id_number,
  "tickets": number_of_tickets,
  "intent": "booking"
}

Rules:
- Match event names closely (case-insensitive, handle typos)
- If no ticket count specified, default to 1
- If the user is just greeting or asking questions, set intent to "inquiry"
- Always return valid JSON, nothing else`;

    try {
        // Call local Ollama instead of OpenAI
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'llama3',
            prompt: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`,
            stream: false,
            format: 'json'  // Tell Ollama to return JSON
        });

        console.log('Ollama Response:', response.data.response);

        const parsed = JSON.parse(response.data.response);
        
        // Validate the parsed response
        if (!parsed.eventName || !parsed.tickets || !parsed.intent) {
            throw new Error('Incomplete LLM response');
        }

        return parsed;

    } catch (error) {
        console.error('LLM API Error:', error.message);
        throw new Error('LLM parsing failed');
    }
};

/**
 * Fallback keyword-based parsing for common booking phrases
 * @param {string} message - User's message
 * @returns {Object} - Parsed booking information
 */
const parseWithFallback = (message) => {
    const lowerMessage = message.toLowerCase();

    // Extract ticket count
    let tickets = 1;
    const numberMatch = lowerMessage.match(/(\d+)\s*(ticket|tix)/);
    if (numberMatch) {
        tickets = parseInt(numberMatch[1]);
    } else {
        // Check for word numbers
        const wordNumbers = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
        };
        for (const [word, num] of Object.entries(wordNumbers)) {
            if (lowerMessage.includes(word)) {
                tickets = num;
                break;
            }
        }
    }

    // Try to extract event name
    const forMatch = lowerMessage.match(/for\s+(.+?)(?:\s+on|\s+at|$)/);
    let eventName = forMatch ? forMatch[1].trim() : '';

    if (!eventName) {
        throw new Error('Could not extract event name');
    }

    // Clean up event name
    eventName = eventName
        .replace(/\b(the|a|an)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Capitalize first letter of each word
    eventName = eventName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return {
        eventName: eventName,
        eventId: null,
        tickets: tickets,
        intent: 'booking'
    };
};

// ← THIS WAS MISSING! Export both functions
module.exports = { 
    callLLM, 
    parseWithFallback 
};