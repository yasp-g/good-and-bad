# Project Roadmap: Brand Website Expansion

**Last Updated:** 2025-12-18

## Project Overview

This project is expanding from a standalone archival grid display into a comprehensive 3-page brand website. The repository is being refactored to host the full site, with the original interactive grid becoming a dedicated "Archive" sub-page.

## Site Map & Flow

1.  **Landing Page (`/`):** A minimalist splash page. Any user interaction (click/touch) navigates to the Work List.
2.  **Work List (`/work/`):** A clean, text-based directory of works. Contains a link to the Archive.
3.  **Archive Grid (`/archive/`):** The existing full-screen interactive grid visualization.

## Core Objectives

1.  **Performant Architecture:** Ensure "heavy" assets (Grid JS/CSS) only load on the Archive page, keeping the Landing and Work pages lightweight.
2.  **Unified Design:** Establish a shared `base.njk` layout for consistent meta tags, fonts, and global styles.
3.  **Seamless Navigation:** Implement the "Click-to-Enter" flow from Landing to Work.

---

## Phase 1: Architectural Foundation

This phase implements the structural changes required to support the multi-page website.

### 1. Layout System Implementation

- **Description:** Abstract the common HTML structure into a reusable Nunjucks layout with support for page-specific assets.
- **Status:** [x] Completed
- **Tasks:**
  - [x] Create `_includes/layouts/base.njk`.
  - [x] Define Nunjucks blocks (`{% block head %}`, `{% block scripts %}`) in the base layout to allow pages to inject custom CSS/JS.

### 2. Page Creation & Migration

- **Description:** Create the three core pages and migrate existing content.
- **Status:** [x] Completed
- **Tasks:**
  - [x] **Archive (`archive.njk`):** Move current `index.njk` content here. Configure it to inject `script.js` only on this page.
  - [x] **Landing (`index.njk`):** Create new entry point with full-screen video background (`landing_video.mp4`) and unmute logic.
  - [x] **Work (`work.njk`):** Create placeholder list page. Add link to `/archive/`.

### 3. Asset Reorganization

- **Description:** Split the monolithic `style.css` to optimize loading.
- **Status:** [x] Completed
- **Tasks:**
  - [x] Extract global styles (Reset, Fonts) into `css/global.css`.
  - [x] Extract grid-specific styles into `css/archive.css` (loaded only on Archive page).
  - [x] Ensure `script.js` is only requested on the Archive page.

---

## Phase 2: Content & Polish

### 1. Work Page Enhancement

- **Description:** Replace the current Work List page with the systematic work page exploration to showcase different styling options.
- **Status:** [x] Completed
- **Tasks:**
  - [x] Replace `work.njk` content with the systematic exploration from `sandbox/work-page-systematic-v2.html`
  - [x] Ensure the page maintains proper layout and links in the Eleventy build context
  - [x] Review the page for mobile responsiveness and adjust if needed
  - [ ] Select a preferred design variation for potential future implementation

### 2. Global Viewing System

- **Description:** Implement a site-wide system for `?display` and `?bg` parameters by abstracting logic into the base layout.
- **Status:** [x] Completed
- **Tasks:**
  - [x] **Base Layout:** Add script to `base.njk` to parse URL parameters and apply global classes (`display-*`, `bg-*`) to `<html>` and `<body>`.
  - [x] **Global CSS:** Define `bg-white` and `bg-black` in `global.css`.
  - [x] **Landing Page:** Update `index.njk` to respond to these classes (setting video object-fit).

---

## Future Investigations

1.  **Ambient Video Blur:**
    - Investigate performant solutions for applying the ambient blur effect to the landing page video (e.g., dual streams or canvas manipulation).

---

## Completed Milestones

- [x] **Roadmap Archival:** Legacy roadmap moved to `legacy_roadmaps/archive_grid_roadmap.md`.
