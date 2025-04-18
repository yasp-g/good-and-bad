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
- **Mobile Blocking:** Detects mobile devices and displays an alternative message, hiding the gallery[cite: 1, 6, 43]


## Roadmap
1. Generate grid dynamically by the number of items in `lager/`
2. Build out dedicated webpages for each item/image
    - Clicking within a quadrant navigates the user to a corresponding item page