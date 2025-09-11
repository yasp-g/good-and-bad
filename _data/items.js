const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  sourceDir: 'lager',
  requiredFiles: ['index.html', 'fullscreen.jpg', 'image.jpg', 'metadata.json'],
  defaultGrid: {
    rows: 2,
    columns: 2
  }
};

function scanItems() {
  const items = [];
  const baseDir = path.resolve(CONFIG.sourceDir);

  if (!fs.existsSync(baseDir)) {
    return [];
  }

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  const itemDirs = entries.filter(entry =>
    entry.isDirectory() && entry.name.startsWith('item-')
  );

  itemDirs.forEach(dir => {
    const itemPath = path.join(baseDir, dir.name);
    const files = fs.readdirSync(itemPath);
    const missingFiles = CONFIG.requiredFiles.filter(file => !files.includes(file));
    if (missingFiles.length > 0) {
      console.warn(`[11ty] Warning: ${dir.name} is missing required files: ${missingFiles.join(', ')}`);
    }

    let metadata = {};
    try {
      metadata = JSON.parse(fs.readFileSync(path.join(itemPath, 'metadata.json'), 'utf8'));
    } catch (err) {
      console.warn(`[11ty] Warning: Could not read metadata.json for ${dir.name}`);
    }

    const itemId = dir.name;
    const itemIndex = parseInt(itemId.replace('item-', '')) - 1;

    const item = {
      id: itemId,
      title: metadata.title || `Item ${itemIndex + 1}`,
      path: `${CONFIG.sourceDir}/${itemId}/`, // Relative path
      thumbnail: 'fullscreen.jpg',
      index: itemIndex
    };
    items.push(item);
  });

  return items.sort((a, b) => a.index - b.index);
}

function calculateGridDimensions(itemCount) {
  if (itemCount <= 4) {
    return {
      rows: CONFIG.defaultGrid.rows,
      columns: CONFIG.defaultGrid.columns
    };
  }
  const columns = Math.ceil(Math.sqrt(itemCount));
  const rows = Math.ceil(itemCount / columns);
  return { rows, columns };
}

module.exports = () => {
  const items = scanItems();
  const grid = calculateGridDimensions(items.length);

  items.forEach((item, index) => {
    const column = index % grid.columns;
    const row = Math.floor(index / grid.columns);
    item.gridPosition = {
      x: column,
      y: row,
      quadrant: `${column}-${row}`
    };
    delete item.index;
  });

  const config = {
    lastUpdated: new Date().toISOString(),
    grid: grid,
    items: items
  };

  return config;
};
