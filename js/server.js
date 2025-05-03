/**
 * Simple development server for the Archive Grid website
 * 
 * Usage: node server.js
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// API endpoint to get item information
app.get('/api/items', (req, res) => {
  try {
    const configPath = path.join(__dirname, 'lager', 'config', 'items.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      res.json(config);
    } else {
      res.status(404).json({ error: 'Configuration file not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Development server running at http://localhost:${port}`);
  console.log(`Press Ctrl+C to stop`);
});