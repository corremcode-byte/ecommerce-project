// Vercel serverless function entry point
// Import the Express app from server.js
const app = require('../server.js');

// Export the app for Vercel
module.exports = app;
