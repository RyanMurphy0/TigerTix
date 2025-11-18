// backend/client-service/routes/clientRoutes.js

const express = require('express');
const router = express.Router();
const { listEvents, handlePurchase } = require('../controllers/clientController');

// GET /api/events - Fetch all events
router.get('/events', listEvents);

// POST /api/events/:id/purchase - Purchase a ticket
router.post('/events/:id/purchase', handlePurchase);

module.exports = router;
