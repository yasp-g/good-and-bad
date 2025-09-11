# Gemini Agent Project Context

This document provides context for the Gemini AI agent to understand and assist with the "Archive Grid Display" project.

## Project Overview

This project is an archival display system for a fashion brand, featuring a full-screen interactive grid interface. The system dynamically loads item configurations from a JSON file and displays images in overlays based on the user's mouse position over a generated grid. The primary goal is to create a visually compelling and immersive experience while preserving the integrity of the brand's imagery.

For a detailed project plan, including current status, planned features, and technical considerations, please refer to [roadmap.md](roadmap.md).

## Key Files

*   `index.html`: The main entry point of the website.
*   `style.css`: Handles all styling, including the grid, overlays, and mobile responsiveness.
*   `js/script.js`: The core client-side logic for grid generation, interactivity, overlay handling, and mobile detection.
*   `.eleventy.js`: The configuration file for the Eleventy build process. (To be created)
*   `_data/items.js`: A global data file for Eleventy that will generate the item collection. (To be created)
*   `lager/item-*/`: Directories containing individual archive items, each with images and `metadata.json`.

## Development Workflow

1.  **Run Eleventy:** Use `npx @11ty/eleventy --serve` to start the local development server with live reloading.
2.  **View Changes:** Open the local server URL provided by Eleventy in your browser.

## Agent Instructions

*   **DOCUMENTATION FIRST:** Before implementing any new feature or change, first update `roadmap.md` to reflect the plan and goals. Confirm this with the user before writing code.
*   The project is being migrated to the Eleventy static site generator. The custom `js/build.js` script is being replaced.
*   The primary development focus is on optimizing the full-screen image presentation as outlined in the roadmap.
*   Maintain the existing coding style and conventions.
