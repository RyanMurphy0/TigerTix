const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { getAllEvents, purchaseTicket } = require('./models/clientModel');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// GET all events
app.get('/api/events', async (req, res) => {
    try {
        const events = await getAllEvents();
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST purchase ticket
app.post('/api/events/:id/purchase', async (req, res) => {
    const eventId = req.params.id;
    try {
        const result = await purchaseTicket(eventId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => console.log(`Client service running on port ${PORT}`));
