// Load environment variables (if .env file exists)
require('dotenv').config();

// Import dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize app
const app = express();

// --- DATABASE CONNECTION ---
// Ensure MONGO_URI is set in your .env or Render Environment Variables
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ Fatal Error: MONGO_URI is not defined.");
  process.exit(1); // Stop the app if DB string is missing
}

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// --- CORS CONFIGURATION (Crucial for Deployment) ---
const allowedOrigins = [
  'http://localhost:3000', // Local React
  'http://localhost:3001', // Local React alternate
  // TODO: Add your Vercel URL here once you deploy frontend
  // Example: 'https://sparkchat.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // OPTIONAL: Log blocked origins to help debug deployment issues
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json()); // Parse incoming JSON

// --- ROUTES ---

// Health Check Route (Used by Render to check if app is alive)
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// Import and use routes
// Ensure these files exist in your 'routes' folder
const authRoutes = require('./routes/auth'); 
const messageRoutes = require('./routes/messages');

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});