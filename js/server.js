/**
 * Simple development server for the Archive Grid website
 * 
 * Usage: node server.js
 */

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Start the server
app.listen(port, () => {
  console.log(`Development server running at http://localhost:${port}`);
  console.log(`Press Ctrl+C to stop`);
});