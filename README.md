# Good & Bad Image Gallery

A simple, full-screen interactive image gallery concept for a fashion brand.

## Description

This webpage provides a minimalist, desktop-only viewing experience. It hides the mouse cursor and displays a full-screen image that changes based on which quadrant of the screen the invisible cursor hovers over (for now, a 2x2 grid). A default logo is shown when the cursor is outside the window or the tab is inactive. Mobile users are shown a message prompting them to use a desktop device.

## Features

- **Full-Screen Image Display:** Utilizes the entire viewport for imagery
- **Cursorless Interface:** Hides the default mouse cursor for an immersive experience
- **Quadrant Interaction (2x2):** Changes the displayed background image based on mouse position within four screen quadrants (top-left, top-right, bottom-left, bottom-right)
- **Click Navigation:** Clicking a quadrant redirects the browser to the associated item's page (located in the `/lager/` directory)
- **Default Logo State:** Shows `logo.jpg` when the mouse leaves the window or the page becomes inactive
- **Mobile Blocking:** Detects mobile devices and displays an alternative message, hiding the gallery

## Content Structure

### Item Directory Structure

Each item in the `lager/` directory should follow this structure:

```
lager/
├── item-1/
│   ├── index.html
│   ├── fullscreen.jpg
│   ├── image.jpg
│   └── metadata.json
├── item-2/
│   └── ...
```

### Metadata Schema

Each item must include a `metadata.json` file with the following structure:

#### Required Fields

- **`id`** (string): Unique identifier, should match the directory name (e.g., `"item-1"`)
- **`title`** (string): Display title for the item
- **`focal_point`** (object): Defines the image's focal point for smart cropping
  - **`x`** (number): Horizontal focal point, 0-100 (percentage from left)
  - **`y`** (number): Vertical focal point, 0-100 (percentage from top)

#### Optional Fields

- **`path`** (string): Relative path to the item directory
- **`thumbnail`** (string): Filename of the thumbnail image
- **`fullscreen`** (string): Filename of the full-screen image
- **`details`** (array): Additional detail image filenames
- **`metadata`** (object): Additional metadata like season, designer, materials, etc.

#### Example metadata.json

```json
{
  "id": "item-1",
  "title": "Spring Collection 2024",
  "focal_point": {
    "x": 50,
    "y": 40
  },
  "path": "/lager/item-1/",
  "thumbnail": "thumbnail.jpg",
  "fullscreen": "fullscreen.jpg",
  "details": ["detail-1.jpg", "detail-2.jpg"],
  "metadata": {
    "season": "Spring 2024",
    "designer": "Designer Name",
    "materials": ["Cotton", "Linen"]
  }
}
```

#### Build-Time Validation

The Eleventy build process automatically validates all `metadata.json` files and will:

- ✅ Report successful validation with green checkmarks
- ❌ Report errors for missing required fields or invalid values
- ⚠️ Report warnings for unexpected fields or mismatches

The build will complete even with validation errors, but issues should be fixed to ensure proper functionality.

## Archive Grid URL Parameters

These parameters can be used on the `/archive/` page to customize the viewing experience or debug the grid.

### Display Modes (`?display=...`)
Controls how the image fits within the fullscreen overlay.
- **(default)**: Fullscreen cover (uses focal points defined in `metadata.json`).
- **`contain`**: Fits the whole image on screen (introducing letterboxing).
- **`padding`**: Fits the image with a 10% visual margin/frame.

### Background Style (`?bg=...`)
Controls the background aesthetics in `contain` or `padding` modes.
- **`blur`** (default): A blurred, zoomed version of the current image.
- **`white`**: Solid white.
- **`black`**: Solid black.
- **`none`**: Transparent (shows the underlying logo).

### Debugging & Utilities (`?debug=...` and `?showload=...`)
- **`?debug=grid`**: Visualizes the invisible interaction grid with red outlines.
- **`?debug=perf`**: Shows an overlay with FPS, cache hits/misses, and image load times.
- **`?showload=true`**: Enables a subtle loading spinner for images (appears after 100ms delay).

## Roadmap

1. Generate grid dynamically by the number of items in `lager/`
2. Build out dedicated webpages for each item/image
   - Clicking within a quadrant navigates the user to a corresponding item page
