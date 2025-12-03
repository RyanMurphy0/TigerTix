require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const llmRoutes = require('./routes/llmRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://tiger-tix-flax.vercel.app'
    ],
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/llm', llmRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'LLM Service is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

app.listen(PORT, () => {
    console.log(`LLM Service running on port ${PORT}`);
});

module.exports = app;