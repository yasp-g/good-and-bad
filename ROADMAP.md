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
- **Status:** [ ] Pending
- **Tasks:**
    - [ ] Create `_includes/layouts/base.njk`.
    - [ ] Define Nunjucks blocks (`{% block head %}`, `{% block scripts %}`) in the base layout to allow pages to inject custom CSS/JS.

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

### 1. Placeholder Content
- **Description:** Populate the Work List with representative placeholder text.
- **Status:** [ ] Pending

### 2. Archive Enhancements (Carried Over)
- **Description:** Planned improvements for the grid view.
- **Status:** [ ] Pending
- **Tasks:**
    - [ ] Item Detail Pages.
    - [ ] Transparent Logo replacement.

---

## Completed Milestones

*   [x] **Roadmap Archival:** Legacy roadmap moved to `legacy_roadmaps/archive_grid_roadmap.md`.
