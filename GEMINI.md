# Gemini Agent Project Context

This document provides context for the Gemini AI agent to understand and assist with the "Archive Grid Display" project.

## Project Overview

This project is an archival display system for a fashion brand, featuring a full-screen interactive grid interface. The system dynamically loads item configurations from a JSON file and displays images in overlays based on the user's mouse position over a generated grid. The primary goal is to create a visually compelling and immersive experience while preserving the integrity of the brand's imagery.

For a detailed project plan, including current status, planned features, and technical considerations, please refer to [roadmap.md](roadmap.md).

## Key Files

- `index.njk`: The main Nunjucks template that injects item data as JSON.
- `style.css`: Handles all styling, including the grid, overlays, and mobile responsiveness.
- `js/script.js`: The core client-side logic for grid generation, interactivity, overlay handling, and mobile detection.
- `.eleventy.js`: The configuration file for the Eleventy build process, including passthrough copy rules.
- `_data/items.js`: A global data file for Eleventy that scans `lager/` and generates the item collection with grid positions.
- `lager/item-*/`: Directories containing individual archive items, each with images and `metadata.json`.

## Development Workflow

1.  **Run Eleventy:** Use `npx @11ty/eleventy --serve` to start the local development server with live reloading.
2.  **View Changes:** Open the local server URL provided by Eleventy in your browser (typically `http://localhost:8080`).
3.  **Build for Production:** Run `npx @11ty/eleventy` to generate the static site to the `_site/` directory.

## Deployment

The project is deployed using **Cloudflare Pages** with automatic GitHub integration:

- **Live Site:** `https://goodandbad.jasper.computer`
- **Repository:** `yasp-g/good-and-bad`
- **Build Command:** `npx @11ty/eleventy`
- **Output Directory:** `_site`
- **Deployment Trigger:** Automatic on push to main branch

When you push changes to the GitHub repository, Cloudflare Pages automatically:

1.  Detects the push via webhook
2.  Runs the Eleventy build command
3.  Deploys the generated `_site/` directory to their global CDN
4.  Makes the site live at the custom subdomain

Preview deployments are also generated for pull requests, allowing you to test changes before merging.

## Agent Instructions

- **DOCUMENTATION FIRST:** Before implementing any new feature or change, first update `roadmap.md` to reflect the plan and goals. Confirm this with the user before writing code.
- The project uses the Eleventy static site generator. The custom `js/build.js` script has been replaced.
- The primary development focus is on optimizing the full-screen image presentation as outlined in the roadmap.
- Maintain the existing coding style and conventions.
- All changes pushed to main are automatically deployed to production via Cloudflare Pages.
