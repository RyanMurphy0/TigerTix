/**
 * Admin Routes
 * Defines routes for admin-related operations.
 */

const express = require('express');
const router = express.Router();
const { addEvent } = require('../controllers/adminController');

// POST /admin/events - Create a new event
router.post('/events', addEvent);

module.exports = router;