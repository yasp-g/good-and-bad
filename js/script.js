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

    // --- Debug Mode Handler ---
    const debugMode = params.get("debug");
    if (debugMode === "grid") {
      document.body.classList.add("debug-grid");
    }
    if (debugMode === "perf") {
      document.body.classList.add("debug-perf");
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

    // Check cache first
    if (metadataCache.has(quadrantKey)) {
      console.log(`💾 Cache hit for ${quadrantKey}`);
      if (debugMode === "perf") {
        perfStats.cacheHits++;
        window.updateDebugStats();
      }
      return metadataCache.get(quadrantKey);
    }

    console.log(`🌐 Cache miss for ${quadrantKey} - fetching...`);
    if (debugMode === "perf") {
      perfStats.cacheMisses++;
      window.updateDebugStats();
    }
    try {
      const response = await fetch(`${path}metadata.json`);
      const metadata = await response.json();

      // Store in cache
      metadataCache.set(quadrantKey, metadata);

      return metadata;
    } catch (error) {
      console.error(`Error loading metadata for ${path}:`, error);
      return null;
    }
  }

  // --- Event Listeners (Desktop Only) ---

  // Track current state to prevent race conditions
  let currentQuadrant = null;
  let targetQuadrant = null; // Track what we're loading
  let isUpdating = false;

  // Metadata cache to avoid redundant fetches
  const metadataCache = new Map();

  // --- Development Mode Improvements ---
  const debugParams = new URLSearchParams(window.location.search);
  const debugMode = debugParams.get("debug");
  let debugOverlay = null;
  let fpsCounter = null;
  let quadrantDisplay = null;
  let perfStats = {
    cacheHits: 0,
    cacheMisses: 0,
    totalImageLoads: 0,
    avgLoadTime: 0,
    loadTimes: [],
  };

  // Create debug overlay if perf mode is enabled
  if (debugMode === "perf") {
    debugOverlay = document.createElement("div");
    debugOverlay.id = "debug-overlay";
    debugOverlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.85);
      color: #0f0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 15px;
      border-radius: 8px;
      z-index: 10000;
      min-width: 250px;
      pointer-events: none;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    `;

    // FPS Counter
    fpsCounter = document.createElement("div");
    fpsCounter.innerHTML = "<strong>FPS:</strong> <span>--</span>";
    debugOverlay.appendChild(fpsCounter);

    // Current Quadrant Display
    quadrantDisplay = document.createElement("div");
    quadrantDisplay.innerHTML = "<strong>Quadrant:</strong> <span>none</span>";
    quadrantDisplay.style.marginTop = "8px";
    debugOverlay.appendChild(quadrantDisplay);

    // Cache Stats
    const cacheStats = document.createElement("div");
    cacheStats.id = "cache-stats";
    cacheStats.style.marginTop = "8px";
    cacheStats.innerHTML = `
      <strong>Cache Stats:</strong><br>
      <span style="margin-left: 10px;">Hits: <span id="cache-hits">0</span></span><br>
      <span style="margin-left: 10px;">Misses: <span id="cache-misses">0</span></span><br>
      <span style="margin-left: 10px;">Hit Rate: <span id="cache-rate">0%</span></span>
    `;
    debugOverlay.appendChild(cacheStats);

    // Performance Stats
    const perfDisplay = document.createElement("div");
    perfDisplay.id = "perf-stats";
    perfDisplay.style.marginTop = "8px";
    perfDisplay.innerHTML = `
      <strong>Performance:</strong><br>
      <span style="margin-left: 10px;">Images: <span id="img-count">0</span></span><br>
      <span style="margin-left: 10px;">Avg Load: <span id="avg-load">0ms</span></span>
    `;
    debugOverlay.appendChild(perfDisplay);

    document.body.appendChild(debugOverlay);

    // FPS Counter Logic
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;

    function updateFPS() {
      frameCount++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime;

      if (delta >= 1000) {
        fps = Math.round((frameCount * 1000) / delta);
        fpsCounter.querySelector("span").textContent = fps;
        frameCount = 0;
        lastTime = currentTime;

        // Color code FPS
        const fpsSpan = fpsCounter.querySelector("span");
        if (fps >= 55) {
          fpsSpan.style.color = "#0f0"; // Green
        } else if (fps >= 30) {
          fpsSpan.style.color = "#ff0"; // Yellow
        } else {
          fpsSpan.style.color = "#f00"; // Red
        }
      }

      requestAnimationFrame(updateFPS);
    }

    updateFPS();

    // Helper function to update debug stats
    window.updateDebugStats = function () {
      const total = perfStats.cacheHits + perfStats.cacheMisses;
      const hitRate =
        total > 0 ? Math.round((perfStats.cacheHits / total) * 100) : 0;

      document.getElementById("cache-hits").textContent = perfStats.cacheHits;
      document.getElementById("cache-misses").textContent =
        perfStats.cacheMisses;
      document.getElementById("cache-rate").textContent = `${hitRate}%`;
      document.getElementById("img-count").textContent =
        perfStats.totalImageLoads;

      if (perfStats.loadTimes.length > 0) {
        const avg =
          perfStats.loadTimes.reduce((a, b) => a + b, 0) /
          perfStats.loadTimes.length;
        document.getElementById("avg-load").textContent =
          `${Math.round(avg)}ms`;
      }
    };
  }

  // Mouse Move: Show quadrant image (throttled)
  document.addEventListener(
    "mousemove",
    throttle(async (e) => {
      const eventTimestamp = Date.now();
      const quadrantKey = getActiveGridItem(e.clientX, e.clientY);

      // Only log when quadrant changes
      if (quadrantKey !== currentQuadrant) {
        console.log(
          `[${eventTimestamp}] ⚡ QUADRANT CHANGED: ${currentQuadrant} → ${quadrantKey}`,
        );
      }

      if (!quadrantKey) {
        if (topOverlay) {
          topOverlay.style.opacity = "0";
        }
        currentQuadrant = null;
        targetQuadrant = null;

        // Update debug display
        if (debugMode === "perf" && quadrantDisplay) {
          quadrantDisplay.querySelector("span").textContent = "none";
        }
        return;
      }

      // Update debug quadrant display
      if (
        debugMode === "perf" &&
        quadrantDisplay &&
        quadrantKey !== currentQuadrant
      ) {
        quadrantDisplay.querySelector("span").textContent = quadrantKey;
      }

      const imageUrl = imageMap[quadrantKey];
      if (imageUrl && topOverlay) {
        const img = topOverlay.querySelector("img");

        // Check if we need to update the image
        const needsUpdate = !img.src.endsWith(imageUrl);

        if (needsUpdate) {
          // Ignore if we're already loading this quadrant
          if (targetQuadrant === quadrantKey) {
            console.log(
              `[${eventTimestamp}] ⏭️  SKIPPING - already loading ${quadrantKey}`,
            );
            return;
          }

          targetQuadrant = quadrantKey;
          isUpdating = true;

          console.log(
            `[${eventTimestamp}] 🖼️  IMAGE UPDATE NEEDED for ${quadrantKey}`,
          );
          console.log(`[${eventTimestamp}]   Current: ${img.src}`);
          console.log(`[${eventTimestamp}]   Target:  ${imageUrl}`);

          const metadata = await loadMetadata(quadrantKey);

          // Check if quadrant changed while we were loading
          if (targetQuadrant !== quadrantKey) {
            console.log(
              `[${eventTimestamp}] ❌ STALE - quadrant changed during load, ignoring`,
            );
            return;
          }

          console.log(
            `[${eventTimestamp}] 📍 Metadata loaded (after ${Date.now() - eventTimestamp}ms)`,
          );

          if (metadata && metadata.focal_point) {
            topOverlay.style.setProperty(
              "--focal-x",
              `${metadata.focal_point.x}%`,
            );
            topOverlay.style.setProperty(
              "--focal-y",
              `${metadata.focal_point.y}%`,
            );
          }

          console.log(
            `[${eventTimestamp}] 🔄 Changing src and showing overlay`,
          );

          // Track image load time for performance monitoring
          const imageLoadStart = Date.now();
          img.src = imageUrl;

          // Track when image finishes loading
          if (debugMode === "perf") {
            img.onload = function () {
              const loadTime = Date.now() - imageLoadStart;
              perfStats.totalImageLoads++;
              perfStats.loadTimes.push(loadTime);

              // Keep only last 10 load times for rolling average
              if (perfStats.loadTimes.length > 10) {
                perfStats.loadTimes.shift();
              }

              window.updateDebugStats();
              console.log(`[perf] Image loaded in ${loadTime}ms`);
            };
          }

          // Set background image for ambient blur effect (contain/padding modes)
          topOverlay.style.setProperty("--bg-image", `url(${imageUrl})`);

          currentQuadrant = quadrantKey;
          isUpdating = false;
        }

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
});
