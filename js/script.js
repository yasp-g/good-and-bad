let config;

async function loadConfiguration() {
    try {
        const response = await fetch('/lager/config/items.json');
        config = await response.json();
        
        // Generate maps dynamically
        const imageMap = {};
        const linkMap = {};
        
        config.items.forEach(item => {
            const quadrant = item.gridPosition.quadrant;
            imageMap[quadrant] = `${item.path}${item.thumbnail}`;
            linkMap[quadrant] = item.path;
        });
        
        return { imageMap, linkMap };
    } catch (error) {
        console.error('Error loading configuration:', error);
        return { imageMap: {}, linkMap: {} };
    }
}

function generateGrid() {
    if (!config || !config.items) {
        console.error('Configuration not loaded');
        return;
    }

    // Find desktop content container
    const desktopContent = document.querySelector('.desktop-content');
    if (!desktopContent) {
        console.error('Desktop content container not found');
        return;
    }

    // Find or create the grid container
    let container = document.querySelector('.grid-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'grid-container';
        desktopContent.appendChild(container);
    }

    // Clear existing content
    container.innerHTML = '';
    
    // Create grid items based on config
    config.items.forEach(item => {
        // Create the grid item link
        const gridItem = document.createElement('a');
        gridItem.href = item.path;
        gridItem.className = 'grid-link';
        gridItem.dataset.quadrant = item.gridPosition.quadrant;
        
        // Create and add the image
        const img = document.createElement('img');
        img.src = `${item.path}${item.thumbnail}`;
        img.alt = item.title;
        img.onerror = () => img.classList.add('error');
        
        gridItem.appendChild(img);
        container.appendChild(gridItem);
    });
}


document.addEventListener('DOMContentLoaded', async function() {
    // --- Mobile Detection ---
    function isMobileDevice() {
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
        
        return hasTouchScreen || isMobileUA;
    }

    if (isMobileDevice()) {
        document.documentElement.classList.add('is-mobile');
        return; // Stop script execution for mobile
    }

    // --- Desktop Overlay Logic ---
    const logoImage = 'logo.jpg';
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
        const gridLinks = document.querySelectorAll('.grid-link');
        
        // Convert grid links to array with their bounding rectangles
        const items = Array.from(gridLinks).map(link => ({
            element: link,
            rect: link.getBoundingClientRect(),
            quadrant: link.dataset.quadrant
        }));
        
        // Find the item that contains these coordinates
        const activeItem = items.find(item => 
            clientX >= item.rect.left &&
            clientX <= item.rect.right &&
            clientY >= item.rect.top &&
            clientY <= item.rect.bottom
        );
        
        return activeItem ? activeItem.quadrant : null;
    }

    const { imageMap, linkMap } = await loadConfiguration();
    
    // Update CSS Grid variables
    document.documentElement.style.setProperty('--grid-columns', config.grid.columns);
    document.documentElement.style.setProperty('--grid-rows', config.grid.rows);

    // Create overlays
    function createOverlays() {
        try {
            baseOverlay = document.createElement('div');
            baseOverlay.id = 'base-overlay';
            baseOverlay.innerHTML = `<img src="${logoImage}" alt="Logo">`;
            document.body.appendChild(baseOverlay);
    
            topOverlay = document.createElement('div');
            topOverlay.id = 'top-overlay';
            topOverlay.innerHTML = `<img alt="Hover Image">`;
            document.body.appendChild(topOverlay);
        } catch (error) {
            console.error('Error creating overlays:', error);
        }
    }

    // Preload images
    function preloadImages() {
        const images = [...Object.values(imageMap), logoImage];
        images.forEach(src => {
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
        return function(...args) {
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
    document.querySelectorAll('.grid-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Stop navigation
            console.log('Navigation disabled for demo');
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
    document.addEventListener('mousemove', throttle(async (e) => {
        const quadrantKey = getActiveGridItem(e.clientX, e.clientY);
        if (!quadrantKey) {
            if (topOverlay) {
                topOverlay.style.opacity = '0';
            }
            return;
        }
        
        const imageUrl = imageMap[quadrantKey];
        if (imageUrl && topOverlay) {
            const metadata = await loadMetadata(quadrantKey);
            if (metadata && metadata.focal_point) {
                topOverlay.style.setProperty('--focal-x', `${metadata.focal_point.x}%`);
                topOverlay.style.setProperty('--focal-y', `${metadata.focal_point.y}%`);
            }

            const img = topOverlay.querySelector('img');
            if (img.src !== imageUrl) {
                img.src = imageUrl;
            }
            topOverlay.style.opacity = '1';
        }
    }, 10)); // 10ms throttle for smooth experience

    // Safari-compatible Mouse Leave: Show logo
    document.addEventListener('mouseout', (e) => {
        // Check if mouse has left the document
        if (!e.relatedTarget && topOverlay) {
            topOverlay.style.opacity = '0';
        }
    });

    // Additional check for mouse leaving the window
    window.addEventListener('mouseleave', () => {
        if (topOverlay) {
            topOverlay.style.opacity = '0';
        }
    });

    // Page Visibility / Focus: Show logo when tab inactive/blurred
    function handleActivityChange() {
        if (document.hidden || !document.hasFocus()) {
            if (topOverlay) {
                topOverlay.style.opacity = '0';
            }
        }
    }
    
    document.addEventListener('visibilitychange', handleActivityChange);
    window.addEventListener('blur', handleActivityChange);

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