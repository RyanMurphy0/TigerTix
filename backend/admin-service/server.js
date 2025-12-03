/**
 * Admin Service Server
 * Sets up the Express server and routes for admin operations.
 */

const express = require('express');
const { initializeDatabase } = require('./setup');
const adminRoutes = require('./routes/adminRoutes');    

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// Initialize the database
initializeDatabase();

// mount admin routes
app.use('/api/admin', adminRoutes);

// start server
app.listen(PORT, () => {
    console.log(`Admin service running on port ${PORT}`);
});