const config = JSON.parse(document.getElementById("site-data").textContent);

function loadConfiguration() {
  // Generate maps dynamically
  const imageMap = {};
  const linkMap = {};

  config.items.forEach((item) => {
    const quadrant = item.gridPosition.quadrant;
    imageMap[quadrant] = `${item.path}${item.thumbnail}`;
    linkMap[quadrant] = item.path;
  });

  return { imageMap, linkMap };
}

function generateGrid() {
  if (!config || !config.items) {
    console.error("Configuration not loaded");
    return;
  }

  // Find desktop content container
  const desktopContent = document.querySelector(".desktop-content");
  if (!desktopContent) {
    console.error("Desktop content container not found");
    return;
  }

  // Find or create the grid container
  let container = document.querySelector(".grid-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "grid-container";
    desktopContent.appendChild(container);
  }

  // Clear existing content
  container.innerHTML = "";

  // Create grid items based on config
  config.items.forEach((item) => {
    // Create the grid item link
    const gridItem = document.createElement("a");
    gridItem.href = item.path;
    gridItem.className = "grid-link";
    gridItem.dataset.quadrant = item.gridPosition.quadrant;

    // Create and add the image
    const img = document.createElement("img");
    img.src = `${item.path}${item.thumbnail}`;
    img.alt = item.title;
    img.onerror = () => img.classList.add("error");

    gridItem.appendChild(img);
    container.appendChild(gridItem);
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  // --- Display Mode Switcher ---
  try {
    const params = new URLSearchParams(window.location.search);
    const displayMode = params.get("display");
    if (displayMode) {
      document.body.classList.add(`display-${displayMode}`);
    }

    // --- Debug Grid Overlay ---
    const debugGrid = params.get("debug");
    if (debugGrid === "grid") {
      // Check for specific value 'grid'
      document.body.classList.add("debug-grid");
    }
  } catch (error) {
    console.error("Error applying display mode:", error);
  }

  // --- Mobile Detection ---
  function isMobileDevice() {
    console.log("--- Checking for mobile device ---");

    // 1. Screen size check
    const isSmallScreen = window.innerWidth < 768;
    console.log("Window innerWidth:", window.innerWidth);
    console.log("Is small screen (< 768px)?", isSmallScreen);

    // 2. User Agent check
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      "android",
      "webos",
      "iphone",
      "ipad",
      "ipod",
      "blackberry",
      "windows phone",
    ];
    const isMobileUA = mobileKeywords.some((keyword) =>
      userAgent.includes(keyword),
    );
    console.log("User Agent:", userAgent);
    console.log("Is mobile User Agent?", isMobileUA);

    // 3. Touch capability check
    const hasTouchScreen =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    console.log("Has touch capability?", hasTouchScreen);

    // New combined logic
    const result = isSmallScreen || (isMobileUA && hasTouchScreen);
    console.log(
      "Final result (isSmallScreen OR (isMobileUA AND hasTouchScreen)):",
      result,
    );
    console.log("------------------------------------");

    return result;
  }

  if (isMobileDevice()) {
    document.documentElement.classList.add("is-mobile");
    return; // Stop script execution for mobile
  }

  // --- Desktop Overlay Logic ---
  const logoImage = "logo.jpg";
  let baseOverlay, topOverlay;

  // // Map for image sources on hover
  // const imageMap = {
  //     '0-0': 'lager/item-1/fullscreen.jpg',
  //     '1-0': 'lager/item-2/fullscreen.jpg',
  //     '0-1': 'lager/item-3/fullscreen.jpg',
  //     '1-1': 'lager/item-4/fullscreen.jpg'
  // };

  // // Map for link destinations (kept for future implementation)
  // const linkMap = {
  //     '0-0': 'lager/item-1/',
  //     '1-0': 'lager/item-2/',
  //     '0-1': 'lager/item-3/',
  //     '1-1': 'lager/item-4/'
  // };

  function getActiveGridItem(clientX, clientY) {
    const gridLinks = document.querySelectorAll(".grid-link");

    // Convert grid links to array with their bounding rectangles
    const items = Array.from(gridLinks).map((link) => ({
      element: link,
      rect: link.getBoundingClientRect(),
      quadrant: link.dataset.quadrant,
    }));

    // Find the item that contains these coordinates
    const activeItem = items.find(
      (item) =>
        clientX >= item.rect.left &&
        clientX <= item.rect.right &&
        clientY >= item.rect.top &&
        clientY <= item.rect.bottom,
    );

    return activeItem ? activeItem.quadrant : null;
  }

  const { imageMap, linkMap } = await loadConfiguration();

  // Update CSS Grid variables
  document.documentElement.style.setProperty(
    "--grid-columns",
    config.grid.columns,
  );
  document.documentElement.style.setProperty("--grid-rows", config.grid.rows);

  // Create overlays
  function createOverlays() {
    try {
      baseOverlay = document.createElement("div");
      baseOverlay.id = "base-overlay";
      baseOverlay.innerHTML = `<img src="${logoImage}" alt="Logo">`;
      document.body.appendChild(baseOverlay);

      topOverlay = document.createElement("div");
      topOverlay.id = "top-overlay";
      topOverlay.innerHTML = `<img alt="Hover Image">`;
      document.body.appendChild(topOverlay);
    } catch (error) {
      console.error("Error creating overlays:", error);
    }
  }

  // Preload images
  function preloadImages() {
    const images = [...Object.values(imageMap), logoImage];
    images.forEach((src) => {
      if (src) {
        const img = new Image();
        img.src = src;
        img.onerror = () => console.warn(`Failed to preload image: ${src}`);
      }
    });
  }

  // Simple throttle function for performance optimization
  function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  // Generate the grid structure
  generateGrid();

  // Create overlays and preload images
  createOverlays();
  preloadImages();

  // Prevent default link behavior for all grid links
  document.querySelectorAll(".grid-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault(); // Stop navigation
      console.log("Navigation disabled for demo");
    });
  });

  // --- Load Metadata ---
  async function loadMetadata(quadrantKey) {
    const path = linkMap[quadrantKey];
    if (!path) return null;

    try {
      const response = await fetch(`${path}metadata.json`);
      return await response.json();
    } catch (error) {
      console.error(`Error loading metadata for ${path}:`, error);
      return null;
    }
  }

  // --- Event Listeners (Desktop Only) ---

  // Mouse Move: Show quadrant image (throttled)
  document.addEventListener(
    "mousemove",
    throttle(async (e) => {
      const eventTimestamp = Date.now();
      const quadrantKey = getActiveGridItem(e.clientX, e.clientY);

      console.log(
        `[${eventTimestamp}] mousemove fired, quadrant:`,
        quadrantKey,
      );

      if (!quadrantKey) {
        if (topOverlay) {
          console.log(`[${eventTimestamp}] No quadrant, hiding overlay`);
          topOverlay.style.opacity = "0";
        }
        return;
      }

      const imageUrl = imageMap[quadrantKey];
      if (imageUrl && topOverlay) {
        const img = topOverlay.querySelector("img");

        console.log(`[${eventTimestamp}] Current img.src:`, img.src);
        console.log(`[${eventTimestamp}] Target imageUrl:`, imageUrl);
        console.log(`[${eventTimestamp}] URLs match?:`, img.src === imageUrl);
        console.log(
          `[${eventTimestamp}] Current opacity:`,
          topOverlay.style.opacity,
        );

        // Check if we need to update the image
        const needsUpdate = !img.src.endsWith(imageUrl);
        console.log(`[${eventTimestamp}] Needs update?:`, needsUpdate);

        if (needsUpdate) {
          console.log(
            `[${eventTimestamp}] Starting metadata load for`,
            quadrantKey,
          );
          const metadata = await loadMetadata(quadrantKey);
          console.log(`[${eventTimestamp}] Metadata loaded:`, metadata);

          if (metadata && metadata.focal_point) {
            topOverlay.style.setProperty(
              "--focal-x",
              `${metadata.focal_point.x}%`,
            );
            topOverlay.style.setProperty(
              "--focal-y",
              `${metadata.focal_point.y}%`,
            );
            console.log(
              `[${eventTimestamp}] Set focal point:`,
              metadata.focal_point,
            );
          }

          console.log(`[${eventTimestamp}] Changing src to:`, imageUrl);
          img.src = imageUrl;
        }

        console.log(`[${eventTimestamp}] Setting opacity to 1`);
        topOverlay.style.opacity = "1";
      }
    }, 10),
  ); // 10ms throttle for smooth experience

  // Safari-compatible Mouse Leave: Show logo
  document.addEventListener("mouseout", (e) => {
    // Check if mouse has left the document
    if (!e.relatedTarget && topOverlay) {
      topOverlay.style.opacity = "0";
    }
  });

  // Additional check for mouse leaving the window
  window.addEventListener("mouseleave", () => {
    if (topOverlay) {
      topOverlay.style.opacity = "0";
    }
  });

  // Page Visibility / Focus: Show logo when tab inactive/blurred
  function handleActivityChange() {
    if (document.hidden || !document.hasFocus()) {
      if (topOverlay) {
        topOverlay.style.opacity = "0";
      }
    }
  }

  document.addEventListener("visibilitychange", handleActivityChange);
  window.addEventListener("blur", handleActivityChange);

  // NAVIGATION DISABLED FOR DEMO
  // // Click: Navigate to item page
  // document.addEventListener('click', (e) => {
  //     // Don't process clicks if we're on mobile
  //     if (document.documentElement.classList.contains('is-mobile')) return;

  //     const quadrantKey = getQuadrant(e.clientX, e.clientY);
  //     const destinationUrl = linkMap[quadrantKey];

  //     if (destinationUrl) {
  //         window.location.href = destinationUrl;
  //     }
  // });
});
