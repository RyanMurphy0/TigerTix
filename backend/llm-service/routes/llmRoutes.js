const express = require('express');
const router = express.Router();
const {parseBookingRequest, confirmBooking, getAvailableEvents} = require('../controllers/llmController');

// POST /api/llm/parse
router.post('/parse', parseBookingRequest);

// POST /api/llm/confirm
router.post('/confirm', confirmBooking);

// GET /api/llm/events
router.get('/events', getAvailableEvents);

module.exports = router;