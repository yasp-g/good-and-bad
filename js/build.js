/**
 * Build Script for Archive Grid Website
 * 
 * This script:
 * 1. Scans the lager directory for items
 * 2. Generates a items.json configuration file
 * 3. Validates images and provides warnings for missing files
 * 
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // For image processing (optional)

// Configuration
const CONFIG = {
  sourceDir: 'lager',
  configPath: 'lager/config',
  configFile: 'items.json',
  requiredFiles: ['index.html', 'fullscreen.jpg', 'image.jpg', 'metadata.json'],
  imageSize: {
    thumbnail: { width: 800, height: null },
    fullscreen: { width: 1920, height: null }
  },
  defaultGrid: {
    rows: 2,
    columns: 2
  }
};

// Ensure config directory exists
if (!fs.existsSync(CONFIG.configPath)) {
  fs.mkdirSync(CONFIG.configPath, { recursive: true });
  console.log(`Created config directory: ${CONFIG.configPath}`);
}

/**
 * Scans the lager directory and returns an array of item directories
 */
function scanItems() {
  const items = [];
  const baseDir = path.resolve(CONFIG.sourceDir);
  
  // Read the base directory
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  
  // Filter for directories that start with 'item-'
  const itemDirs = entries.filter(entry => 
    entry.isDirectory() && entry.name.startsWith('item-')
  );
  
  // Process each item directory
  itemDirs.forEach(dir => {
    const itemPath = path.join(baseDir, dir.name);
    const files = fs.readdirSync(itemPath);
    
    // Validate required files
    const missingFiles = CONFIG.requiredFiles.filter(file => !files.includes(file));
    if (missingFiles.length > 0) {
      console.warn(`Warning: ${dir.name} is missing required files: ${missingFiles.join(', ')}`);
    }
    
    // Extract item ID and numeric index
    const itemId = dir.name;
    const itemIndex = parseInt(itemId.replace('item-', '')) - 1; // 0-indexed
    
    // Check for any additional images
    const additionalImages = files.filter(file => 
      file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
    ).filter(file => file !== 'fullscreen.jpg' && file !== 'image.jpg');
    
    // Create item object
    const item = {
      id: itemId,
      title: `Item ${itemIndex + 1}`, // Default title
      path: `/${CONFIG.sourceDir}/${itemId}/`,
      thumbnail: 'fullscreen.jpg',
      additionalImages: additionalImages,
      index: itemIndex // Used for sorting
    };
    
    items.push(item);
  });
  
  // Sort items by their index
  return items.sort((a, b) => a.index - b.index);
}

/**
 * Calculate optimal grid dimensions based on item count
 */
function calculateGridDimensions(itemCount) {
  // For small collections, use default grid
  if (itemCount <= 4) {
    return {
      rows: CONFIG.defaultGrid.rows,
      columns: CONFIG.defaultGrid.columns
    };
  }
  
  // Calculate a roughly square grid
  const columns = Math.ceil(Math.sqrt(itemCount));
  const rows = Math.ceil(itemCount / columns);
  
  return { rows, columns };
}

/**
 * Generate the configuration file
 */
function generateConfig(items) {
  const grid = calculateGridDimensions(items.length);
  
  // Create mapping from index to grid position
  items.forEach((item, index) => {
    const column = index % grid.columns;
    const row = Math.floor(index / grid.columns);
    item.gridPosition = {
      x: column,
      y: row,
      quadrant: `${column}-${row}`
    };
    
    // Remove temporary index property
    delete item.index;
  });
  
  // Build the configuration object
  const config = {
    lastUpdated: new Date().toISOString(),
    grid: grid,
    items: items
  };
  
  // Write the configuration file
  const configFilePath = path.join(CONFIG.configPath, CONFIG.configFile);
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
  console.log(`Generated configuration file: ${configFilePath}`);
  
  return config;
}

/**
 * Main execution function
 */
async function main() {
  console.log('Scanning for items...');
  const items = scanItems();
  console.log(`Found ${items.length} items`);
  
  console.log('Generating configuration...');
  const config = generateConfig(items);
  
  console.log('Build completed successfully!');
  console.log(`Grid dimensions: ${config.grid.columns}x${config.grid.rows}`);
}

// Run the script
main().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});