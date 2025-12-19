const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  sourceDir: "lager",
  requiredFiles: ["index.html", "fullscreen.jpg", "image.jpg", "metadata.json"],
  defaultGrid: {
    rows: 2,
    columns: 2,
  },
};

// Metadata validation schema
const METADATA_SCHEMA = {
  required: ["id", "title", "focal_point"],
  optional: ["path", "thumbnail", "fullscreen", "details", "metadata"],
  focalPoint: {
    required: ["x", "y"],
    range: { min: 0, max: 100 },
  },
};

/**
 * Validates metadata.json structure and values
 * @param {Object} metadata - The parsed metadata object
 * @param {string} itemId - The item directory name for error reporting
 * @returns {Object} { isValid: boolean, errors: string[], warnings: string[] }
 */
function validateMetadata(metadata, itemId) {
  const errors = [];
  const warnings = [];

  // Check required fields
  METADATA_SCHEMA.required.forEach((field) => {
    if (!metadata.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate focal_point structure and values
  if (metadata.focal_point) {
    if (typeof metadata.focal_point !== "object") {
      errors.push("focal_point must be an object");
    } else {
      // Check required focal_point fields
      METADATA_SCHEMA.focalPoint.required.forEach((field) => {
        if (!metadata.focal_point.hasOwnProperty(field)) {
          errors.push(`focal_point missing required field: ${field}`);
        }
      });

      // Validate focal_point ranges
      ["x", "y"].forEach((axis) => {
        const value = metadata.focal_point[axis];
        if (value !== undefined) {
          if (typeof value !== "number") {
            errors.push(
              `focal_point.${axis} must be a number, got ${typeof value}`,
            );
          } else if (
            value < METADATA_SCHEMA.focalPoint.range.min ||
            value > METADATA_SCHEMA.focalPoint.range.max
          ) {
            errors.push(
              `focal_point.${axis} must be between ${METADATA_SCHEMA.focalPoint.range.min} and ${METADATA_SCHEMA.focalPoint.range.max}, got ${value}`,
            );
          }
        }
      });
    }
  }

  // Validate title is non-empty string
  if (metadata.title !== undefined && typeof metadata.title !== "string") {
    errors.push(`title must be a string, got ${typeof metadata.title}`);
  } else if (
    metadata.title !== undefined &&
    metadata.title.trim().length === 0
  ) {
    warnings.push("title is empty");
  }

  // Validate id matches directory name
  if (metadata.id && metadata.id !== itemId) {
    warnings.push(
      `id "${metadata.id}" does not match directory name "${itemId}"`,
    );
  }

  // Warn about unexpected fields
  const allKnownFields = [
    ...METADATA_SCHEMA.required,
    ...METADATA_SCHEMA.optional,
  ];
  Object.keys(metadata).forEach((field) => {
    if (!allKnownFields.includes(field)) {
      warnings.push(`Unexpected field: ${field}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function scanItems() {
  const items = [];
  const baseDir = path.resolve(CONFIG.sourceDir);

  if (!fs.existsSync(baseDir)) {
    return [];
  }

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  const itemDirs = entries.filter(
    (entry) => entry.isDirectory() && entry.name.startsWith("item-"),
  );

  itemDirs.forEach((dir) => {
    const itemPath = path.join(baseDir, dir.name);
    const files = fs.readdirSync(itemPath);
    const missingFiles = CONFIG.requiredFiles.filter(
      (file) => !files.includes(file),
    );
    if (missingFiles.length > 0) {
      console.warn(
        `[11ty] Warning: ${dir.name} is missing required files: ${missingFiles.join(", ")}`,
      );
    }

    let metadata = {};
    try {
      const metadataPath = path.join(itemPath, "metadata.json");
      const metadataContent = fs.readFileSync(metadataPath, "utf8");
      metadata = JSON.parse(metadataContent);

      // Validate metadata structure and values
      const validation = validateMetadata(metadata, dir.name);

      if (!validation.isValid) {
        console.error(`[11ty] ❌ ERROR in ${dir.name}/metadata.json:`);
        validation.errors.forEach((error) => {
          console.error(`[11ty]    - ${error}`);
        });
        // Optionally fail the build on validation errors
        // throw new Error(`Invalid metadata in ${dir.name}`);
      }

      if (validation.warnings.length > 0) {
        console.warn(`[11ty] ⚠️  Warning in ${dir.name}/metadata.json:`);
        validation.warnings.forEach((warning) => {
          console.warn(`[11ty]    - ${warning}`);
        });
      }

      if (validation.isValid && validation.warnings.length === 0) {
        console.log(
          `[11ty] ✅ ${dir.name}/metadata.json validated successfully`,
        );
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        console.error(
          `[11ty] ❌ ERROR: Invalid JSON in ${dir.name}/metadata.json - ${err.message}`,
        );
      } else {
        console.warn(
          `[11ty] ⚠️  Warning: Could not read metadata.json for ${dir.name} - ${err.message}`,
        );
      }
    }

    const itemId = dir.name;
    const itemIndex = parseInt(itemId.replace("item-", "")) - 1;

    const item = {
      id: itemId,
      title: metadata.title || `Item ${itemIndex + 1}`,
      path: `/${CONFIG.sourceDir}/${itemId}/`, // Absolute path
      thumbnail: "fullscreen.jpg",
      index: itemIndex,
    };
    items.push(item);
  });

  return items.sort((a, b) => a.index - b.index);
}

function calculateGridDimensions(itemCount) {
  if (itemCount <= 4) {
    return {
      rows: CONFIG.defaultGrid.rows,
      columns: CONFIG.defaultGrid.columns,
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
      quadrant: `${column}-${row}`,
    };
    delete item.index;
  });

  const config = {
    lastUpdated: new Date().toISOString(),
    grid: grid,
    items: items,
  };

  return config;
};
