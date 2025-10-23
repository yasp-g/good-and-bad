# Project Roadmap: Archive Grid Display

## Project Overview

An archival display system for fashion brand imagery, featuring a full-screen interactive grid interface. The system dynamically loads item configurations and displays images in overlays based on mouse position over a generated grid.

## Core Objectives

1.  **Optimize Full-Screen Image Display:** Ensure images are presented compellingly, utilizing the available screen space effectively.
2.  **Maintain Visual Integrity:** Preserve the intended look and feel of images across different viewport sizes and aspect ratios.
3.  **Preserve Important Image Content:** Minimize undesirable cropping and ensure key visual elements remain visible.
4.  **Ensure Consistent User Experience:** Provide a smooth, intuitive, and performant interaction.

## Current Implementation Highlights

- **Dynamic Data Generation:** The project's item data and grid configuration are dynamically generated at build time by Eleventy.
- **Client-Side Rendering:** The front-end (`script.js`) consumes data injected by Eleventy at build time to generate the interactive grid areas.
- **Overlay-Based Display:**
  - A base overlay displays a logo (`logo.jpg`).
  - A top overlay displays the main item image (`fullscreen.jpg` from the corresponding item) when a grid quadrant is hovered.
  - Images in overlays currently use `object-fit: cover`.
- **Focal Point System (Initial):** `script.js` loads `focal_point` data from individual `metadata.json` files and applies it via CSS custom properties (`--focal-x`, `--focal-y`) to the `object-position` of images in the top overlay.
- **Mobile Handling:** A message is displayed to mobile users, and desktop-specific functionality is hidden.
- **Cursorless Interface:** The mouse cursor is hidden on desktop for an immersive experience.
- **State Handling:** The logo is shown by default, when the mouse leaves the window, or when the tab is inactive.

## Key Development Area: Optimizing Image Presentation in Overlays

The primary focus is to refine how images are displayed within the full-screen `#top-overlay` to best meet the project's core objectives.

### Current Approach for Overlay Images

- `<img>` tag within `#top-overlay`.
- CSS `object-fit: cover;` to ensure the image fills the overlay.
- CSS `object-position: var(--focal-x, 50%) var(--focal-y, 50%);` to center the image based on focal points from `metadata.json`.

### Evaluation of Alternatives/Refinements for Overlay Images

1.  **`object-fit: contain` Approach**
    - **Implementation:** Change `object-fit` to `contain` for the `<img>` in `#top-overlay`.
    - **Key Features:** Shows the complete image without cropping. Introduces letterboxing or pillarboxing if the image's aspect ratio doesn't match the viewport.
    - **Pros:** Guarantees full image visibility.
    - **Cons:** May not fully utilize screen space; letterboxing might be visually undesirable for the brand.
    - **Status:** [ ] To be prototyped and evaluated.
    - **Priority:** High

2.  **Enhanced Dynamic Focusing / Cropping Logic (Refinement of Current `object-fit: cover`)**
    - **Implementation:** Further investigate and refine the existing focal point system with `object-fit: cover`. This could involve more sophisticated client-side calculations for `object-position` or exploring advanced techniques if simple focal points are insufficient for diverse imagery.
    - **Key Features:** Aims to maximize screen fill while intelligently cropping to preserve the most important parts of the image.
    - **Pros:** Immersive, full-screen feel.
    - **Cons:** Risk of cropping important details if focal points aren't precise or if image compositions are challenging.
    - **Status:** [ ] Current system to be critically evaluated; enhancements to be investigated.
    - **Priority:** High
    - **Complexity:** Medium to High

3.  **Padding/Centering Solution within Overlays**
    - **Implementation:** Ensure overlay images have consistent margins from viewport edges, effectively "framing" them within the full-screen overlay. This could be achieved by adjusting image dimensions or using an inner wrapper with padding.
    - **Key Features:** Maintains aspect ratio, provides uniform spacing, prevents content from touching screen edges.
    - **Pros:** Consistent presentation, can prevent edge cutoff.
    - **Cons:** Images won't be strictly "full-screen"; reduces immersive feel.
    - **Status:** [ ] To be prototyped and evaluated.
    - **Priority:** Medium
    - **Complexity:** Low to Medium

### Next Steps for Image Presentation Optimization

- [ ] **Prototype:** Implement prototypes for solution #1 (`object-fit: contain`) and #3 (Padding/Centering).
- [ ] **Test & Evaluate:** Test all three approaches (current `cover` with focal points, `contain`, and padding/centering) with a diverse range of test images (different aspect ratios, subjects, and compositions).
- [ ] **Assess:** Evaluate visual impact, performance implications, and ease of content creation (e.g., defining focal points).
- [ ] **Document:** Record findings, pros, and cons for each approach.
- [ ] **Select & Implement:** Make a final decision and implement the chosen solution for image presentation in overlays.

## Performance & UX Enhancements

### 1. Remove Dead Code

- **Description:** Clean up deprecated build script and unused code from the codebase.
- **Status:** [x] Completed
- **Priority:** High
- **Estimated Time:** 15 minutes
- **Tasks:**
  - [x] Delete `js/build.js` script (no longer needed after Eleventy migration)
  - [x] Delete `js/server.js` script (replaced by Eleventy dev server)
  - [x] Remove commented-out code in `script.js` (old hardcoded maps and navigation)
  - [x] Remove unused dependencies `express` and `sharp` from `package.json`

### 2. Metadata Caching

- **Description:** Cache metadata.json responses to eliminate redundant network requests when hovering over previously visited quadrants.
- **Status:** [x] Completed
- **Priority:** High
- **Estimated Time:** 30 minutes
- **Performance Impact:** Eliminates 30-50ms delay on subsequent hovers to the same quadrant
- **Tasks:**
  - [x] Add `metadataCache` Map to store loaded metadata by quadrant key
  - [x] Modify `loadMetadata()` function to check cache before fetching
  - [x] Add debug logging for cache hits/misses (💾 for hits, 🌐 for misses)
  - [ ] Add cache invalidation strategy (optional: consider cache size limits)

### 3. Preconnect Hints

- **Description:** Add resource hints to `<head>` to establish early connections for faster metadata fetching.
- **Status:** [x] Not Needed - Removed after testing
- **Priority:** High
- **Estimated Time:** 5 minutes
- **Performance Impact:** N/A - All resources are same-origin, browser already has connection established
- **Tasks:**
  - [x] Add `<link rel="preconnect">` to `index.njk`
  - [x] Add `<link rel="dns-prefetch">` as fallback for older browsers
  - [x] Testing revealed no benefit for same-origin resources
  - [x] Removed hints to reduce unnecessary markup
- **Notes:** Preconnect hints are most beneficial for cross-origin resources. Since all metadata and images are served from the same origin (`goodandbad.jasper.computer`), the browser already maintains the connection. Testing showed no measurable improvement in initial connection times (86ms TLS handshake is normal).

### 4. Ambient Background Blur

- **Description:** In `contain` and `padding` display modes, show a blurred version of the current image as the background instead of solid color for a more polished look.
- **Status:** [x] Completed and verified
- **Priority:** Medium
- **Estimated Time:** 1-2 hours
- **Tasks:**
  - [x] Modify overlay structure to include background layer (using `::before` pseudo-element)
  - [x] Apply CSS `filter: blur(40px)` and `scale(1.1)` to background image
  - [x] Set background via CSS custom property `--bg-image` from JavaScript
  - [x] Ensure it only applies in `display-contain` and `display-padding` modes
  - [x] Add opacity/fade for smooth transitions (0.6 opacity, 0.3s transition)
- **Verification:** Test with `?display=contain` or `?display=padding` URL parameters. Background should show a blurred version of the current image instead of solid letterboxing colors, respecting dark/light mode preferences.

### 5. Validate Metadata on Build

- **Description:** Add Eleventy build-time validation to ensure all metadata.json files have required fields and valid values.
- **Status:** [ ] To be implemented
- **Priority:** Medium
- **Estimated Time:** 45 minutes
- **Tasks:**
  - [ ] Create validation schema for metadata.json (required fields, focal point ranges 0-100%, etc.)
  - [ ] Add validation logic to `_data/items.js`
  - [ ] Log warnings for missing or invalid metadata
  - [ ] Optionally fail build on critical validation errors
  - [ ] Document required metadata structure in README

### 6. Development Mode Improvements

- **Description:** Enhance debug mode with additional developer tools and diagnostics.
- **Status:** [ ] To be implemented
- **Priority:** Low
- **Estimated Time:** 1 hour
- **Tasks:**
  - [ ] Add FPS counter overlay in debug mode
  - [ ] Show current quadrant coordinates on screen
  - [ ] Log metadata cache hit/miss statistics
  - [ ] Add performance timing logs for image loads
  - [ ] Create `?debug=perf` mode for performance monitoring

### 7. Reduced Motion Support

- **Description:** Respect user's motion preferences for accessibility by disabling or reducing animations.
- **Status:** [ ] To be implemented
- **Priority:** Medium
- **Estimated Time:** 15 minutes
- **Tasks:**
  - [ ] Add `@media (prefers-reduced-motion: reduce)` media query to `style.css`
  - [ ] Set transition durations to near-instant (0.01ms) for reduced motion
  - [ ] Test with browser/OS reduced motion settings enabled

### 8. Image Load Progress

- **Description:** Show subtle loading indicator when images are being fetched, especially beneficial on slower connections.
- **Status:** [ ] To be implemented
- **Priority:** Low
- **Estimated Time:** 1 hour
- **Tasks:**
  - [ ] Design subtle loading indicator (spinner, pulse, etc.)
  - [ ] Track image load state in `script.js`
  - [ ] Show indicator only when load takes >100ms (avoid flash for fast loads)
  - [ ] Hide indicator once image is ready
  - [ ] Test on throttled network connection

## Planned Features & Enhancements

1.  **Client-Facing Display Mode Switcher**
    - **Description:** Implement a system to switch between the three image display prototypes (`cover`, `contain`, `padding`) using a URL query parameter (`?display=...`). This will allow the client to easily compare the options from a single deployment without requiring branch changes or backend configuration.
    - **Status:** [x] Completed
    - **Priority:** High
    - **Tasks:**
      - [x] **JS:** Add logic to `script.js` to read the `display` query parameter on page load.
      - [x] **JS:** Add a class to the `<body>` element corresponding to the parameter's value.
      - [x] **CSS:** Add scoped CSS rules in `style.css` for the `contain` and `padding` display modes, triggered by the body class.

2.  **Debug Grid Overlay**
    - **Description:** Implement a toggleable visual overlay for the underlying CSS grid structure, activated via a URL query parameter (e.g., `?debug=grid`). This will aid in debugging and demonstrating the grid layout.
    - **Status:** [ ] In progress.
    - **Priority:** Medium
    - **Tasks:**
      - [x] **JS:** Extend query parameter logic in `script.js` to check for `debug=grid`.
      - [x] **JS:** Add `debug-grid` class to `<body>` when parameter is present.
      - [ ] **CSS:** Add styles to `style.css` to visualize grid cells (e.g., borders).

## Infrastructure & Build Process

1.  **Migrate to Eleventy and Configure Deployment**
    - **Description:** Replace the custom `js/build.js` script with Eleventy to streamline the build process. Configure the project for automated deployments via GitHub and Cloudflare Pages.
    - **Status:** [x] Completed
    - **Priority:** High
    - **Tasks (Eleventy Migration):**
      - [x] Install and configure Eleventy.
      - [x] Create a global data file to replace the logic from `js/build.js`.
      - [x] Set up passthrough copy for all static assets (CSS, JS, images).
      - [x] Modify `js/script.js` to consume data injected by Eleventy at build time.
      - [ ] Decommission the `js/build.js` script.
    - **Tasks (Deployment Configuration):**
      - [x] Connect GitHub repository to Cloudflare Pages.
      - [x] Configure Cloudflare Pages build settings (e.g., build command `npx @11ty/eleventy`, output directory `_site`).
      - [x] Set up custom subdomain on Cloudflare.

1.  **Item Detail Pages & Navigation**
    - **Description:** Develop dedicated HTML pages for each item listed in `lager/`. Enable click navigation: clicking a grid quadrant should navigate the user to the corresponding item's detail page.
    - **Status:** [ ] To be implemented.
    - **Priority:** High
    - **Tasks:**
      - [ ] Define the structure and content for item detail pages (e.g., using `image.jpg`, `metadata.json` content).
      - [ ] Create a template for these pages.
      - [ ] Implement the click-to-navigate functionality in `script.js` (currently disabled).
      - [ ] Ensure each item in `items.json` has a valid link to its detail page.

1.  **Replace `logo.jpg` with Transparent PNG**
    - **Description:** Switch from `logo.jpg` (which has a white background) to a `logo.png` with a transparent background. This will allow more flexibility if background colors or treatments are ever used behind the logo overlay.
    - **Files to update:**
      - `js/script.js` (update `logoImage` constant).
      - Replace the `logo.jpg` file with the new transparent PNG.
    - **Status:** [ ] To be implemented.
    - **Priority:** Low
    - **Dependencies:** None.

## Completed Milestones\

- [x] **Proof of Concept:** Initial version with quadrant-based image switching.
- [x] **Cursorless UI:** Mouse cursor hidden on desktop.
- [x] **Overlay Image Display:** Implemented base (logo) and top (item image) overlays.
- [x] **Default State Handling:** Logo overlay shown on mouse out / tab inactive.
- [x] **Mobile Detection:** Implemented logic to show an alternative message on mobile devices.
- [x] **Basic Focal Point System:** Implemented reading of `focal_point` from `metadata.json` and applying it via `object-position` to images in the top overlay using `object-fit: cover`.
- [x] **Dynamic Grid Configuration:** `build.js` scans `lager/` items and generates `items.json` with grid dimensions and item details.
- [x] **Client-Side Grid Rendering:** `script.js` dynamically creates interactive grid regions based on `items.json`.
- [x] **Migrated to Eleventy:** Replaced custom `js/build.js` script with a more robust Eleventy build process, including data generation and a reliable local development workflow.
- [x] **Fixed Image Transition Flashing:** Resolved race condition where multiple async metadata loads caused image src to be set multiple times during quadrant changes, resulting in choppy visual transitions. Implemented state tracking to prevent duplicate updates and ignore stale async operations.

## Technical Considerations

- Browser compatibility (especially for CSS `object-fit`, `object-position`, custom properties).
- Performance optimization (image loading, rendering, JS execution, especially `mousemove` events).
- Race condition prevention: Async operations are tracked to prevent stale updates when user moves between quadrants rapidly.
- Image loading strategies (preloading is in place, can be reviewed).
- Transition smoothness for opacity changes.
- Accessibility (though the current design is highly visual, considerations for keyboard navigation or future ARIA attributes if applicable).

## Timeline

TBD based on solution selection for image presentation and resource availability.

---

_Last Updated: 2025-01-17_
