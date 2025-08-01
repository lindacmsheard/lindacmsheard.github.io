/**
 * Interactive Map Demo - Bounding Box Tool
 * 
 * This application provides an interactive map where users can draw bounding boxes
 * and view their coordinates. Built with Leaflet.js for cross-platform compatibility.
 * 
 * Future Database Integration:
 * The coordinate data can be stored in a database by sending the bounds object
 * to a backend API. Example:
 * 
 * fetch('/api/bounding-boxes', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     bounds: currentBounds,
 *     timestamp: new Date().toISOString(),
 *     userId: getCurrentUserId()
 *   })
 * });
 */

class InteractiveMapDemo {
    constructor() {
        this.map = null;
        this.currentRectangle = null;
        this.drawnRectangles = [];
        this.isDrawingMode = false;
        this.startPoint = null;
        this.tempRectangle = null;
        
        this.init();
    }
    
    init() {
        // Check if Leaflet is available
        if (typeof L === 'undefined') {
            this.initFallbackMode();
            return;
        }
        
        this.initMap();
        this.initControls();
        this.initDrawingEvents();
    }
    
    initFallbackMode() {
        // Initialize fallback mode when Leaflet is not available
        const mapElement = document.getElementById('map');
        mapElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; border: 2px dashed #ccc; text-align: center; padding: 20px;">
                <div>
                    <h3 style="color: #666; margin-bottom: 10px;">🗺️ Interactive Map</h3>
                    <p style="color: #888; margin-bottom: 15px;">This demo requires an internet connection to load Leaflet.js from CDN.</p>
                    <p style="color: #888;"><strong>When deployed to GitHub Pages or a web server with internet access, this will show a fully interactive map.</strong></p>
                    <div style="margin-top: 20px; padding: 15px; background: #fff; border: 1px solid #ddd; border-radius: 4px;">
                        <p style="color: #333; margin: 0;"><strong>Features when online:</strong></p>
                        <ul style="color: #666; text-align: left; margin: 10px 0 0 0; padding-left: 20px;">
                            <li>Interactive map with zoom and pan</li>
                            <li>Draw bounding boxes with touch support</li>
                            <li>Mobile-optimized interactions</li>
                            <li>Coordinate display and export</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize controls for fallback mode
        this.initControlsOnly();
    }
    
    initControlsOnly() {
        const drawButton = document.getElementById('drawButton');
        const clearButton = document.getElementById('clearButton');
        
        drawButton.addEventListener('click', () => {
            alert('This feature requires an internet connection to load the map library. When deployed online, you will be able to draw bounding boxes on an interactive map.');
        });
        
        clearButton.addEventListener('click', () => {
            alert('This feature requires an internet connection to load the map library.');
        });
    }
    
    initMap() {
        // Initialize the map centered on a default location (London)
        this.map = L.map('map').setView([51.505, -0.09], 10);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        }).addTo(this.map);
        
        // Disable default Leaflet drawing
        this.map.doubleClickZoom.disable();
        
        // Add touch event prevention for better mobile support
        this.setupMobileOptimization();
    }
    
    initControls() {
        const drawButton = document.getElementById('drawButton');
        const clearButton = document.getElementById('clearButton');
        
        drawButton.addEventListener('click', () => this.toggleDrawingMode());
        clearButton.addEventListener('click', () => this.clearAllRectangles());
        
        // Update button state
        this.updateDrawButtonState();
    }
    
    initDrawingEvents() {
        let isMouseDown = false;
        
        // Mouse events for desktop
        this.map.on('mousedown', (e) => {
            if (!this.isDrawingMode) return;
            
            isMouseDown = true;
            this.startDrawing(e.latlng);
            e.originalEvent.preventDefault();
        });
        
        this.map.on('mousemove', (e) => {
            if (!this.isDrawingMode || !isMouseDown) return;
            
            this.updateDrawing(e.latlng);
        });
        
        this.map.on('mouseup', (e) => {
            if (!this.isDrawingMode || !isMouseDown) return;
            
            isMouseDown = false;
            this.finishDrawing(e.latlng);
        });
        
        // Touch events for mobile
        this.map.on('touchstart', (e) => {
            if (!this.isDrawingMode) return;
            
            const touch = e.originalEvent.touches[0];
            const latlng = this.map.mouseEventToLatLng(touch);
            this.startDrawing(latlng);
            e.originalEvent.preventDefault();
        });
        
        this.map.on('touchmove', (e) => {
            if (!this.isDrawingMode || !this.startPoint) return;
            
            const touch = e.originalEvent.touches[0];
            const latlng = this.map.mouseEventToLatLng(touch);
            this.updateDrawing(latlng);
            e.originalEvent.preventDefault();
        });
        
        this.map.on('touchend', (e) => {
            if (!this.isDrawingMode || !this.startPoint) return;
            
            const touch = e.originalEvent.changedTouches[0];
            const latlng = this.map.mouseEventToLatLng(touch);
            this.finishDrawing(latlng);
            e.originalEvent.preventDefault();
        });
    }
    
    startDrawing(latlng) {
        this.startPoint = latlng;
        
        // Remove temporary rectangle if it exists
        if (this.tempRectangle) {
            this.map.removeLayer(this.tempRectangle);
        }
        
        // Create initial rectangle (will be a point initially)
        const bounds = L.latLngBounds([latlng, latlng]);
        this.tempRectangle = L.rectangle(bounds, {
            color: '#e74c3c',
            weight: 2,
            opacity: 1,
            fillColor: '#e74c3c',
            fillOpacity: 0.1,
            className: 'drawing-rectangle'
        }).addTo(this.map);
    }
    
    updateDrawing(latlng) {
        if (!this.startPoint || !this.tempRectangle) return;
        
        // Update the rectangle bounds
        const bounds = L.latLngBounds([this.startPoint, latlng]);
        this.tempRectangle.setBounds(bounds);
    }
    
    finishDrawing(latlng) {
        if (!this.startPoint || !this.tempRectangle) return;
        
        const bounds = L.latLngBounds([this.startPoint, latlng]);
        
        // Check if the rectangle has a minimum size
        const minDistance = 0.001; // Minimum distance in degrees
        if (Math.abs(bounds.getNorthEast().lat - bounds.getSouthWest().lat) < minDistance ||
            Math.abs(bounds.getNorthEast().lng - bounds.getSouthWest().lng) < minDistance) {
            // Rectangle too small, remove it
            this.map.removeLayer(this.tempRectangle);
            this.tempRectangle = null;
            this.startPoint = null;
            return;
        }
        
        // Finalize the rectangle
        this.map.removeLayer(this.tempRectangle);
        
        // Create final rectangle with click handler
        const finalRectangle = L.rectangle(bounds, {
            color: '#e74c3c',
            weight: 2,
            opacity: 1,
            fillColor: '#e74c3c',
            fillOpacity: 0.1
        }).addTo(this.map);
        
        // Add click handler to show coordinates
        finalRectangle.on('click', () => {
            this.displayCoordinates(bounds);
        });
        
        this.drawnRectangles.push(finalRectangle);
        this.currentRectangle = finalRectangle;
        
        // Display coordinates for the new rectangle
        this.displayCoordinates(bounds);
        
        // Reset drawing state
        this.tempRectangle = null;
        this.startPoint = null;
        
        // Exit drawing mode after creating a rectangle
        this.toggleDrawingMode();
    }
    
    toggleDrawingMode() {
        this.isDrawingMode = !this.isDrawingMode;
        
        if (this.isDrawingMode) {
            this.map.getContainer().style.cursor = 'crosshair';
            this.map.dragging.disable();
            this.map.touchZoom.disable();
            this.map.doubleClickZoom.disable();
            this.map.scrollWheelZoom.disable();
            this.map.boxZoom.disable();
            this.map.keyboard.disable();
        } else {
            this.map.getContainer().style.cursor = '';
            this.map.dragging.enable();
            this.map.touchZoom.enable();
            this.map.doubleClickZoom.disable(); // Keep this disabled
            this.map.scrollWheelZoom.enable();
            this.map.boxZoom.enable();
            this.map.keyboard.enable();
            
            // Clean up any temporary rectangle
            if (this.tempRectangle) {
                this.map.removeLayer(this.tempRectangle);
                this.tempRectangle = null;
            }
            this.startPoint = null;
        }
        
        this.updateDrawButtonState();
    }
    
    setupMobileOptimization() {
        // Add event listeners to prevent default touch behaviors during drawing
        if (!this.map) return; // Exit if map is not available
        
        const mapContainer = this.map.getContainer();
        
        mapContainer.addEventListener('touchmove', (e) => {
            if (this.isDrawingMode) {
                e.preventDefault();
            }
        }, { passive: false });
        
        mapContainer.addEventListener('touchstart', (e) => {
            if (this.isDrawingMode) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Prevent context menu on mobile during drawing
        mapContainer.addEventListener('contextmenu', (e) => {
            if (this.isDrawingMode) {
                e.preventDefault();
            }
        });
    }
    
    updateDrawButtonState() {
        const drawButton = document.getElementById('drawButton');
        
        if (this.isDrawingMode) {
            drawButton.textContent = 'Cancel Drawing';
            drawButton.classList.remove('btn-primary');
            drawButton.classList.add('btn-secondary');
        } else {
            drawButton.textContent = 'Draw Bounding Box';
            drawButton.classList.remove('btn-secondary');
            drawButton.classList.add('btn-primary');
        }
    }
    
    clearAllRectangles() {
        // Remove all drawn rectangles
        this.drawnRectangles.forEach(rectangle => {
            this.map.removeLayer(rectangle);
        });
        
        // Remove temporary rectangle if exists
        if (this.tempRectangle) {
            this.map.removeLayer(this.tempRectangle);
            this.tempRectangle = null;
        }
        
        // Reset state
        this.drawnRectangles = [];
        this.currentRectangle = null;
        this.startPoint = null;
        
        // Clear coordinates display
        this.clearCoordinatesDisplay();
        
        // Exit drawing mode if active
        if (this.isDrawingMode) {
            this.toggleDrawingMode();
        }
    }
    
    displayCoordinates(bounds) {
        const coordinatesDiv = document.getElementById('coordinatesDisplay');
        
        const north = bounds.getNorth().toFixed(6);
        const south = bounds.getSouth().toFixed(6);
        const east = bounds.getEast().toFixed(6);
        const west = bounds.getWest().toFixed(6);
        
        // Calculate center point
        const center = bounds.getCenter();
        const centerLat = center.lat.toFixed(6);
        const centerLng = center.lng.toFixed(6);
        
        // Calculate dimensions (approximate)
        const width = (bounds.getEast() - bounds.getWest()) * 111.32; // km (rough approximation)
        const height = (bounds.getNorth() - bounds.getSouth()) * 110.54; // km (rough approximation)
        
        coordinatesDiv.innerHTML = `
            <div class="coords-data">
                <div><strong>Bounding Box Coordinates:</strong></div>
                <div>North: ${north}°</div>
                <div>South: ${south}°</div>
                <div>East: ${east}°</div>
                <div>West: ${west}°</div>
                <div style="margin-top: 10px;"><strong>Center Point:</strong></div>
                <div>Latitude: ${centerLat}°</div>
                <div>Longitude: ${centerLng}°</div>
                <div style="margin-top: 10px;"><strong>Approximate Dimensions:</strong></div>
                <div>Width: ${width.toFixed(2)} km</div>
                <div>Height: ${height.toFixed(2)} km</div>
            </div>
        `;
    }
    
    clearCoordinatesDisplay() {
        const coordinatesDiv = document.getElementById('coordinatesDisplay');
        coordinatesDiv.innerHTML = '<p class="placeholder">Draw a bounding box to see coordinates</p>';
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveMapDemo();
});

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractiveMapDemo;
}