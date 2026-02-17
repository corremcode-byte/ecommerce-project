// Vercel serverless function entry point
// Import the Express app from server.js
const app = require('../server.js');

// Export the app directly - Vercel will handle it
module.exports = app;
