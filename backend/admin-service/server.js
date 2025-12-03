/**
 * Admin Service Server
 * Sets up the Express server and routes for admin operations.
 */

const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./setup');
const adminRoutes = require('./routes/adminRoutes');    

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://tiger-tix-flax.vercel.app',
        'https://tiger-c3e1d7opq-ryan-murphys-projects-e970bd74.vercel.app',
        /https:\/\/.*\.vercel\.app$/  // This regex allows ALL *.vercel.app domains
    ],
    credentials: true
}));

app.use(express.json());

// Initialize the database
initializeDatabase();

// mount admin routes
app.use('/api/admin', adminRoutes);

// start server
app.listen(PORT, () => {
    console.log(`Admin service running on port ${PORT}`);
});