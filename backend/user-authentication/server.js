require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { initDB } = require('./models/userModel');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors()); // cross-origin requests
app.use(express.json()); // parse JSON request bodies

// initialize database
initDB();

// routes
app.use('/api/auth', authRoutes);

// health check endpoint
app.get('/health', (req, rest) => {
    res.status(200).json({ status: 'user authentication service is OK' });
});

// start server
app.listen(PORT, () => {
    console.log(`User authentication service running on port ${PORT}`);
});