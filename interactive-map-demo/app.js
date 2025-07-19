// Interactive Map Demo - Bounding Box Drawing App
class InteractiveMapApp {
    constructor() {
        this.map = null;
        this.currentBounds = null;
        this.isDrawingMode = false;
        this.leafletLoaded = false;
        
        this.initializeElements();
        this.checkLeafletAvailability();
        this.setupEventListeners();
        this.showLoadingAnimation();
    }
    
    initializeElements() {
        this.drawBtn = document.getElementById('drawBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.coordinatePanel = document.getElementById('coordinatePanel');
        this.closePanelBtn = document.getElementById('closePanelBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.exportBtn = document.getElementById('exportBtn');
        
        // Coordinate display elements
        this.northCoord = document.getElementById('northCoord');
        this.southCoord = document.getElementById('southCoord');
        this.eastCoord = document.getElementById('eastCoord');
        this.westCoord = document.getElementById('westCoord');
        this.centerCoord = document.getElementById('centerCoord');
        this.areaInfo = document.getElementById('areaInfo');
        
        // Fallback elements
        this.drawingArea = document.getElementById('drawingArea');
        this.boundingBox = document.getElementById('boundingBox');
    }
    
    checkLeafletAvailability() {
        // Check if Leaflet.js is available
        if (typeof L !== 'undefined') {
            this.leafletLoaded = true;
            this.initializeLeafletMap();
        } else {
            // Use fallback functionality
            this.leafletLoaded = false;
            this.initializeFallbackMap();
        }
    }
    
    initializeLeafletMap() {
        // Initialize the real Leaflet map
        this.map = L.map('map').setView([40.7128, -74.0060], 10); // New York City
        
        // Add high-contrast base tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        // Initialize the FeatureGroup to store editable layers
        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);
        
        // Set up Leaflet-specific drawing functionality
        this.setupLeafletDrawing();
    }
    
    initializeFallbackMap() {
        // Hide the fallback message and show drawing area
        console.log('Using fallback map functionality - Leaflet.js not available');
        this.setupFallbackDrawing();
    }
    
    setupLeafletDrawing() {
        // Custom bounding box drawing for Leaflet
        let isDrawing = false;
        let startPoint = null;
        let currentRectangle = null;
        
        this.map.on('mousedown touchstart', (e) => {
            if (!this.isDrawingMode) return;
            
            isDrawing = true;
            startPoint = e.latlng;
            
            // Prevent default map interactions during drawing
            this.map.dragging.disable();
            this.map.touchZoom.disable();
            this.map.doubleClickZoom.disable();
            this.map.scrollWheelZoom.disable();
        });
        
        this.map.on('mousemove touchmove', (e) => {
            if (!isDrawing || !startPoint) return;
            
            const currentPoint = e.latlng;
            
            // Remove previous preview rectangle
            if (currentRectangle) {
                this.map.removeLayer(currentRectangle);
            }
            
            // Create preview rectangle
            const bounds = L.latLngBounds([startPoint, currentPoint]);
            currentRectangle = L.rectangle(bounds, {
                color: '#e74c3c',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.1,
                fillColor: '#e74c3c',
                dashArray: '5, 5'
            }).addTo(this.map);
        });
        
        this.map.on('mouseup touchend', (e) => {
            if (!isDrawing || !startPoint) return;
            
            isDrawing = false;
            
            // Re-enable map interactions
            this.map.dragging.enable();
            this.map.touchZoom.enable();
            this.map.doubleClickZoom.enable();
            this.map.scrollWheelZoom.enable();
            
            if (currentRectangle) {
                this.map.removeLayer(currentRectangle);
                
                // Create final rectangle
                const endPoint = e.latlng;
                const bounds = L.latLngBounds([startPoint, endPoint]);
                
                // Only create if the rectangle has a meaningful size
                if (this.calculateDistance(startPoint, endPoint) > 50) { // 50 meters minimum
                    this.createLeafletBoundingBox(bounds);
                    this.toggleDrawMode(); // Exit drawing mode
                }
            }
            
            startPoint = null;
            currentRectangle = null;
        });
    }
    
    setupFallbackDrawing() {
        if (!this.drawingArea) return;
        
        let isDrawing = false;
        let startX, startY;
        
        // Mouse/touch event handlers for fallback drawing
        const startDrawing = (e) => {
            if (!this.isDrawingMode) return;
            
            isDrawing = true;
            const rect = this.drawingArea.getBoundingClientRect();
            startX = (e.clientX || e.touches[0].clientX) - rect.left;
            startY = (e.clientY || e.touches[0].clientY) - rect.top;
            
            this.boundingBox.style.left = startX + 'px';
            this.boundingBox.style.top = startY + 'px';
            this.boundingBox.style.width = '0px';
            this.boundingBox.style.height = '0px';
            this.boundingBox.classList.remove('hidden');
        };
        
        const updateDrawing = (e) => {
            if (!isDrawing) return;
            
            const rect = this.drawingArea.getBoundingClientRect();
            const currentX = (e.clientX || e.touches[0].clientX) - rect.left;
            const currentY = (e.clientY || e.touches[0].clientY) - rect.top;
            
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            
            this.boundingBox.style.left = left + 'px';
            this.boundingBox.style.top = top + 'px';
            this.boundingBox.style.width = width + 'px';
            this.boundingBox.style.height = height + 'px';
        };
        
        const finishDrawing = (e) => {
            if (!isDrawing) return;
            
            isDrawing = false;
            
            // Convert pixel coordinates to simulated lat/lng
            const rect = this.drawingArea.getBoundingClientRect();
            const bounds = this.pixelToBounds(
                startX, startY,
                parseInt(this.boundingBox.style.width),
                parseInt(this.boundingBox.style.height),
                this.drawingArea.offsetWidth,
                this.drawingArea.offsetHeight
            );
            
            this.createFallbackBoundingBox(bounds);
            this.toggleDrawMode();
        };
        
        // Add event listeners
        this.drawingArea.addEventListener('mousedown', startDrawing);
        this.drawingArea.addEventListener('mousemove', updateDrawing);
        this.drawingArea.addEventListener('mouseup', finishDrawing);
        
        // Touch events
        this.drawingArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDrawing(e);
        });
        this.drawingArea.addEventListener('touchmove', (e) => {
            e.preventDefault();
            updateDrawing(e);
        });
        this.drawingArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            finishDrawing(e);
        });
    }
    
    pixelToBounds(startX, startY, width, height, containerWidth, containerHeight) {
        // Convert pixel coordinates to lat/lng (simulated for demo)
        // This simulates a map view of New York City area
        const baseNorth = 40.8;
        const baseSouth = 40.6;
        const baseEast = -73.7;
        const baseWest = -74.3;
        
        const latRange = baseNorth - baseSouth;
        const lngRange = baseEast - baseWest;
        
        const north = baseNorth - (startY / containerHeight) * latRange;
        const south = baseNorth - ((startY + height) / containerHeight) * latRange;
        const west = baseWest + (startX / containerWidth) * lngRange;
        const east = baseWest + ((startX + width) / containerWidth) * lngRange;
        
        return { north, south, east, west };
    }
    
    createLeafletBoundingBox(bounds) {
        // Clear existing shapes
        this.drawnItems.clearLayers();
        
        // Create the rectangle
        const rectangle = L.rectangle(bounds, {
            color: '#e74c3c',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.1,
            fillColor: '#e74c3c'
        });
        
        this.drawnItems.addLayer(rectangle);
        this.currentBounds = bounds;
        
        // Update coordinate display
        this.updateCoordinateDisplay(bounds);
        this.showCoordinatePanel();
        
        // Show success feedback
        this.showTooltip(this.clearBtn, 'Bounding box created successfully!');
    }
    
    createFallbackBoundingBox(bounds) {
        this.currentBounds = bounds;
        this.updateCoordinateDisplay(bounds);
        this.showCoordinatePanel();
        this.showTooltip(this.clearBtn, 'Bounding box created successfully!');
    }
    
    setupEventListeners() {
        // Button event listeners
        this.drawBtn.addEventListener('click', () => this.toggleDrawMode());
        this.clearBtn.addEventListener('click', () => this.clearAllShapes());
        this.closePanelBtn.addEventListener('click', () => this.hideCoordinatePanel());
        this.copyBtn.addEventListener('click', () => this.copyCoordinates());
        this.exportBtn.addEventListener('click', () => this.exportData());
        
        // Mobile-friendly event handling
        this.setupMobileOptimization();
    }
    
    setupMobileOptimization() {
        // Prevent context menu on mobile
        document.addEventListener('contextmenu', (e) => {
            if (this.isDrawingMode) {
                e.preventDefault();
            }
        });
    }
    
    showLoadingAnimation() {
        // Add subtle loading animation
        const container = document.querySelector('.container');
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.6s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
    
    toggleDrawMode() {
        this.isDrawingMode = !this.isDrawingMode;
        
        if (this.isDrawingMode) {
            this.drawBtn.innerHTML = '✏️ Drawing Mode (Click to Cancel)';
            this.drawBtn.classList.add('active');
            this.showTooltip(this.drawBtn, this.leafletLoaded ? 
                'Click and drag on the map to draw a bounding box' :
                'Click and drag in the demo area to draw a bounding box');
            
            if (this.leafletLoaded && this.map) {
                this.map.getContainer().style.cursor = 'crosshair';
            } else if (this.drawingArea) {
                this.drawingArea.style.cursor = 'crosshair';
            }
        } else {
            this.drawBtn.innerHTML = '<span class="btn-icon">📐</span>Draw Bounding Box';
            this.drawBtn.classList.remove('active');
            
            if (this.leafletLoaded && this.map) {
                this.map.getContainer().style.cursor = '';
            } else if (this.drawingArea) {
                this.drawingArea.style.cursor = 'crosshair';
            }
        }
    }
    
    clearAllShapes() {
        if (this.leafletLoaded && this.drawnItems) {
            this.drawnItems.clearLayers();
        }
        
        if (this.boundingBox) {
            this.boundingBox.classList.add('hidden');
        }
        
        this.currentBounds = null;
        this.hideCoordinatePanel();
        this.showTooltip(this.clearBtn, 'All shapes cleared');
    }
    
    updateCoordinateDisplay(bounds) {
        const north = this.leafletLoaded ? bounds.getNorth() : bounds.north;
        const south = this.leafletLoaded ? bounds.getSouth() : bounds.south;
        const east = this.leafletLoaded ? bounds.getEast() : bounds.east;
        const west = this.leafletLoaded ? bounds.getWest() : bounds.west;
        
        let centerLat, centerLng;
        if (this.leafletLoaded) {
            const center = bounds.getCenter();
            centerLat = center.lat;
            centerLng = center.lng;
        } else {
            centerLat = (north + south) / 2;
            centerLng = (east + west) / 2;
        }
        
        // Format coordinates to 6 decimal places
        this.northCoord.textContent = north.toFixed(6);
        this.southCoord.textContent = south.toFixed(6);
        this.eastCoord.textContent = east.toFixed(6);
        this.westCoord.textContent = west.toFixed(6);
        this.centerCoord.textContent = `${centerLat.toFixed(6)}, ${centerLng.toFixed(6)}`;
        
        // Calculate and display area
        const area = this.calculateAreaFromBounds(north, south, east, west);
        this.areaInfo.textContent = `${area.toFixed(2)} km²`;
    }
    
    calculateAreaFromBounds(north, south, east, west) {
        // Approximate area calculation using coordinate differences
        const latDiff = Math.abs(north - south);
        const lngDiff = Math.abs(east - west);
        
        // Convert to approximate kilometers (rough calculation)
        const latKm = latDiff * 111; // 1 degree latitude ≈ 111 km
        const lngKm = lngDiff * 111 * Math.cos((north + south) / 2 * Math.PI / 180); // Adjust for longitude
        
        return latKm * lngKm;
    }
    
    calculateDistance(point1, point2) {
        const R = 6371000; // Earth's radius in meters
        const lat1Rad = point1.lat * Math.PI / 180;
        const lat2Rad = point2.lat * Math.PI / 180;
        const deltaLatRad = (point2.lat - point1.lat) * Math.PI / 180;
        const deltaLngRad = (point2.lng - point1.lng) * Math.PI / 180;
        
        const a = Math.sin(deltaLatRad/2) * Math.sin(deltaLatRad/2) +
                  Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                  Math.sin(deltaLngRad/2) * Math.sin(deltaLngRad/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
    
    showCoordinatePanel() {
        this.coordinatePanel.classList.remove('hidden');
    }
    
    hideCoordinatePanel() {
        this.coordinatePanel.classList.add('hidden');
    }
    
    copyCoordinates() {
        if (!this.currentBounds) return;
        
        const coordinates = this.getCoordinatesObject();
        const text = JSON.stringify(coordinates, null, 2);
        
        navigator.clipboard.writeText(text).then(() => {
            this.showTooltip(this.copyBtn, 'Coordinates copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showTooltip(this.copyBtn, 'Coordinates copied!');
        });
    }
    
    exportData() {
        if (!this.currentBounds) return;
        
        const data = {
            id: `bbox_${Date.now()}`,
            name: `Bounding Box ${new Date().toLocaleDateString()}`,
            ...this.getCoordinatesObject(),
            created_at: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bounding_box_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showTooltip(this.exportBtn, 'Data exported as JSON!');
    }
    
    getCoordinatesObject() {
        if (!this.currentBounds) return null;
        
        let bounds, centerLat, centerLng, area;
        
        if (this.leafletLoaded) {
            bounds = {
                north: this.currentBounds.getNorth(),
                south: this.currentBounds.getSouth(),
                east: this.currentBounds.getEast(),
                west: this.currentBounds.getWest()
            };
            const center = this.currentBounds.getCenter();
            centerLat = center.lat;
            centerLng = center.lng;
        } else {
            bounds = {
                north: this.currentBounds.north,
                south: this.currentBounds.south,
                east: this.currentBounds.east,
                west: this.currentBounds.west
            };
            centerLat = (bounds.north + bounds.south) / 2;
            centerLng = (bounds.east + bounds.west) / 2;
        }
        
        area = this.calculateAreaFromBounds(bounds.north, bounds.south, bounds.east, bounds.west);
        
        return {
            bounds: bounds,
            center: {
                lat: centerLat,
                lng: centerLng
            },
            area_km2: area
        };
    }
    
    showTooltip(element, message) {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = message;
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.bottom + 10 + 'px';
        
        // Show tooltip
        setTimeout(() => tooltip.classList.add('show'), 10);
        
        // Hide and remove tooltip
        setTimeout(() => {
            tooltip.classList.remove('show');
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
        }, 2000);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveMapApp();
});

// Add keyboard shortcuts for improved accessibility
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'd':
                e.preventDefault();
                document.getElementById('drawBtn').click();
                break;
            case 'x':
                e.preventDefault();
                document.getElementById('clearBtn').click();
                break;
            case 'c':
                if (e.shiftKey) {
                    e.preventDefault();
                    document.getElementById('copyBtn').click();
                }
                break;
        }
    }
    
    // Escape key to exit drawing mode
    if (e.key === 'Escape') {
        const drawBtn = document.getElementById('drawBtn');
        if (drawBtn.classList.contains('active')) {
            drawBtn.click();
        }
    }
});

// Add utility functions for future database integration
const DatabaseUtils = {
    /**
     * Format bounding box data for database storage
     * @param {Object} boundingBoxData - The bounding box data
     * @returns {Object} Formatted data ready for database insertion
     */
    formatForDatabase(boundingBoxData) {
        return {
            id: boundingBoxData.id || `bbox_${Date.now()}`,
            name: boundingBoxData.name || 'Unnamed Bounding Box',
            bounds: boundingBoxData.bounds,
            center: boundingBoxData.center,
            area_km2: boundingBoxData.area_km2,
            created_at: boundingBoxData.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    },
    
    /**
     * Validate bounding box data before database insertion
     * @param {Object} data - The data to validate
     * @returns {boolean} True if valid, false otherwise
     */
    validateBoundingBoxData(data) {
        const required = ['bounds', 'center', 'area_km2'];
        const boundsRequired = ['north', 'south', 'east', 'west'];
        const centerRequired = ['lat', 'lng'];
        
        // Check required fields
        for (const field of required) {
            if (!data[field]) return false;
        }
        
        // Check bounds structure
        for (const field of boundsRequired) {
            if (typeof data.bounds[field] !== 'number') return false;
        }
        
        // Check center structure
        for (const field of centerRequired) {
            if (typeof data.center[field] !== 'number') return false;
        }
        
        // Validate coordinate ranges
        if (data.bounds.north < -90 || data.bounds.north > 90) return false;
        if (data.bounds.south < -90 || data.bounds.south > 90) return false;
        if (data.bounds.east < -180 || data.bounds.east > 180) return false;
        if (data.bounds.west < -180 || data.bounds.west > 180) return false;
        
        return true;
    }
};