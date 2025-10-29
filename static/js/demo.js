/**
 * QuantaRoute Demo JavaScript
 * Interactive routing demonstration with performance comparison
 * 
 * API FIELD MAPPING (QuantaRoute Backend):
 * ==========================================
 * Instructions from backend use these field names:
 * - "name" → street/road name (NOT "street_name")
 * - "distance" → distance in meters (NOT "distance_m")
 * - "duration" → duration in seconds (NOT "duration_s")
 * - "geometry" → GeoJSON geometry with coordinates as [lon, lat]
 * - "maneuver" → object with type, modifier, location
 * 
 * Frontend normalizes these to internal format for consistency.
 */

class QuantaRouteDemo {
    constructor() {
        this.map = null;
        this.startMarker = null;
        this.endMarker = null;
        this.routeLayer = null;
        this.ssspRouteLayer = null;
        this.dijkstraRouteLayer = null;
        this.explorationVisualizer = null;
        this.clickCount = 0;
        // Use configurable API URL (supports both local and remote)
        this.config = window.demoConfig || new DemoConfig();
        this.apiBaseUrl = this.config.config.apiBaseUrl;
        this.isMobile = window.innerWidth <= 768;
        this.sidebarOpen = false;
        
        // Debug mode flag - set to true for verbose logging
        this.DEBUG_MODE = false;
        
        // Enhanced navigation features
        this.currentProfile = 'car';
        this.waypoints = [];
        this.waypointMarkers = [];
        this.elevationChart = null;
        this.searchTimeout = null;
        this.bengaluruPOIs = [];
        this.connectorLayers = [];
        this.distanceMarkers = [];
        
        // Route segment highlighting
        this.currentHighlightedSegment = null;
        this.selectedInstructionIndex = -1;
        
        this.init();
    }

    /**
     * Debug logging helper - only logs when DEBUG_MODE is true
     */
    log(...args) {
        if (this.DEBUG_MODE) {
            console.log(...args);
        }
    }

    /**
     * Format duration for display
     * - Minutes only for < 60 min: "45 min"
     * - Hours and minutes for >= 60 min: "1h 46m"
     */
    formatDuration(minutes) {
        if (!minutes || minutes < 0) return '0 min';
        
        if (minutes < 60) {
            return `${Math.round(minutes)} min`;
        }
        
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        
        if (mins === 0) {
            return `${hours}h`;
        }
        
        return `${hours}h ${mins}m`;
    }

    async init() {
        this.initializeMap();
        this.setupEventListeners();
        this.setupMobileHandlers();
        await this.checkServerStatus();
        
        // Initialize exploration visualizer
        if (window.ExplorationVisualizer) {
            this.explorationVisualizer = new ExplorationVisualizer(this.map);
        }
        
        // Display current mode
        this.showModeIndicator();
    }

    /**
     * Helper method to make API calls with proper authentication
     */
    async apiCall(endpoint, options = {}) {
        const url = this.config.getApiUrl(endpoint);
        
        // Handle custom demo endpoints client-side (they don't exist in QuantaRoute API)
        if (url === null) {
            if (endpoint === 'bengaluru-bounds') {
                return this.getMockBengaluruBounds();
            } else if (endpoint === 'search?q=') {
                return this.getMockSearchResults();
            }
        }
        
        const headers = {
            ...this.config.getHeaders(),
            ...(options.headers || {})
        };

        this.log(`📡 API Call to: ${endpoint}`, {url, mode: this.config.mode});

        const response = await fetch(url, {
            ...options,
            headers
        });

        return response;
    }
    
    /**
     * Mock Bengaluru bounds (client-side data)
     */
    getMockBengaluruBounds() {
        return {
            ok: true,
            json: async () => ({
                north: 13.1986,
                south: 12.7342,
                east: 77.8803,
                west: 77.3691,
                center: [12.9716, 77.5946]
            })
        };
    }
    
    /**
     * Mock search results (client-side data)
     */
    getMockSearchResults() {
        return {
            ok: true,
            json: async () => ({
                results: [
                    {"name": "Kempegowda International Airport", "address": "KIAL Road", "lat": 13.1986, "lng": 77.7066},
                    {"name": "MG Road", "address": "MG Road, Bengaluru", "lat": 12.9716, "lng": 77.5946},
                    {"name": "Electronic City", "address": "Electronic City, Bengaluru", "lat": 12.8456, "lng": 77.6603},
                    {"name": "Whitefield", "address": "Whitefield, Bengaluru", "lat": 12.9698, "lng": 77.7500},
                    {"name": "Koramangala", "address": "Koramangala, Bengaluru", "lat": 12.9352, "lng": 77.6245},
                    {"name": "Indiranagar", "address": "Indiranagar, Bengaluru", "lat": 12.9784, "lng": 77.6408},
                    {"name": "Jayanagar", "address": "Jayanagar, Bengaluru", "lat": 12.9250, "lng": 77.5838},
                    {"name": "Malleswaram", "address": "Malleswaram, Bengaluru", "lat": 13.0060, "lng": 77.5707}
                ]
            })
        };
    }

    /**
     * Show mode indicator in the UI
     * Hidden in production (GitHub Pages) for cleaner appearance
     */
    showModeIndicator() {
        // Hide mode indicator in production (GitHub Pages)
        const isProduction = window.location.hostname !== 'localhost' && 
                            window.location.hostname !== '127.0.0.1' &&
                            !window.location.hostname.includes('local');
        
        if (isProduction) {
            console.log('🎯 Production mode: Mode indicator hidden');
            return; // Don't show indicator in production
        }
        
        // Only show in development (localhost)
        const info = this.config.getDisplayInfo();
        const indicator = document.createElement('div');
        indicator.className = 'fixed top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[10000] text-sm';
        indicator.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-lg">${info.mode === 'local' ? '🏠' : '🌐'}</span>
                <div>
                    <div class="font-semibold">${info.displayName}</div>
                    <div class="text-xs text-gray-600">${info.description}</div>
                    ${info.mode === 'remote' ? '<div class="text-xs text-blue-600 mt-1">🔐 API Key: Active</div>' : ''}
                </div>
                <button onclick="window.demoConfig.setMode('${info.mode === 'local' ? 'remote' : 'local'}')" 
                        class="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                    Switch to ${info.mode === 'local' ? 'Remote' : 'Local'}
                </button>
            </div>
        `;
        document.body.appendChild(indicator);
    }

    initializeMap() {
        // Bengaluru center coordinates (MG Road area)
        const bengaluruCenter = [12.9716, 77.5946];
        
        // Initialize Leaflet map
        this.map = L.map('map', {
            center: bengaluruCenter,
            zoom: 12,
            zoomControl: true,
            attributionControl: true
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add click handler for setting start/end points
        this.map.on('click', (e) => this.handleMapClick(e));
        
        // Add Bengaluru bounds rectangle for visual reference
        this.addBengaluruBounds();
        
        // Show welcome message
        setTimeout(() => {
            this.showStatusMessage('🎯 Click anywhere on the map to set your start point!', 'info');
        }, 1000);
    }

    async addBengaluruBounds() {
        // Define fallback Bengaluru bounds
        const DEFAULT_BENGALURU_BOUNDS = {
            north: 13.1729,
            south: 12.7342,
            east: 77.8826,
            west: 77.3755
        };
        
        let bounds = DEFAULT_BENGALURU_BOUNDS;
        
        try {
            const response = await this.apiCall('bengaluru-bounds');
            if (response.ok) {
                const apiBounds = await response.json();
                // Validate bounds before using
                if (apiBounds && apiBounds.north && apiBounds.south && apiBounds.east && apiBounds.west) {
                    bounds = apiBounds;
                    this.log('✅ Loaded Bengaluru bounds from API:', bounds);
                }
            }
        } catch (error) {
            this.log('⚠️ Could not load bounds from API, using default:', error);
        }
        
        try {
            const rectangle = L.rectangle([
                [bounds.south, bounds.west],
                [bounds.north, bounds.east]
            ], {
                color: '#667eea',
                weight: 2,
                opacity: 0.6,
                fillColor: '#667eea',
                fillOpacity: 0.1,
                dashArray: '5, 5'
            }).addTo(this.map);
            
            // Don't bind popup to rectangle to avoid blocking clicks
            // rectangle.bindPopup('Bengaluru Routing Area - Click anywhere to test routing!');
            
        } catch (error) {
            console.warn('Could not load Bengaluru bounds:', error);
        }
    }

    setupEventListeners() {
        // Clear route button
        document.getElementById('clearRoute').addEventListener('click', () => {
            this.clearRoute();
        });

        // Enhanced navigation event listeners
        this.setupNavigationEventListeners();
        
        // Window resize handler for responsive behavior
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                this.handleMobileToggle();
            }
            
            // Invalidate map size
            if (this.map) {
                setTimeout(() => this.map.invalidateSize(), 100);
            }
        });
    }
    
    setupMobileHandlers() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileFab = document.getElementById('mobileFab');
        const sidebar = document.getElementById('sidebar');
        
        // Mobile menu toggle
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSidebar();
            });
        }
        
        // Mobile FAB
        if (mobileFab) {
            mobileFab.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSidebar();
            });
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (this.isMobile && this.sidebarOpen && sidebar) {
                if (!sidebar.contains(e.target) && 
                    !mobileMenuToggle?.contains(e.target) && 
                    !mobileFab?.contains(e.target)) {
                    this.toggleSidebar();
                }
            }
        });
    }
    
    toggleSidebar() {
        if (!this.isMobile) return;
        
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        this.sidebarOpen = !this.sidebarOpen;
        
        if (this.sidebarOpen) {
            sidebar.classList.add('open');
        } else {
            sidebar.classList.remove('open');
        }
    }
    
    handleMobileToggle() {
        const sidebar = document.getElementById('sidebar');
        if (!this.isMobile && sidebar) {
            sidebar.classList.remove('open');
            this.sidebarOpen = false;
        }
    }

    async checkServerStatus() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const statusDot = statusIndicator.querySelector('.status-dot');

        try {
            // Health endpoint is at /health (NOT /v1/health)
            const baseUrl = this.config.config.apiBaseUrl.replace('/v1', '');
            const healthUrl = `${baseUrl}/health`;
            
            const headers = this.config.getHeaders();
            this.log('🏥 Health check:', {url: healthUrl, mode: this.config.mode});
            
            const response = await fetch(healthUrl, {
                headers: headers
            });
            
            const status = await response.json();
            
            // API returns status: "ok" for QuantaRoute API, or status: "healthy" for demo backend
            if (status.status === 'ok' || status.status === 'healthy') {
                statusText.textContent = status.quantaroute_available 
                    ? 'QuantaRoute Ready' 
                    : 'QuantaRoute API Connected';
                statusDot.classList.add('ready');
                this.log('✅ Server ready:', status);
            } else {
                statusText.textContent = 'Server Error';
                console.error('❌ Server not healthy:', status);
            }
        } catch (error) {
            statusText.textContent = 'Server Offline';
            console.error('❌ Cannot connect to server:', error);
        }
    }

    handleMapClick(e) {
        const latlng = e.latlng;
        console.log('🗺️ Map clicked at:', latlng);
        
        // Check if we're setting a waypoint
        const waitingForWaypoint = this.waypoints.findIndex(wp => wp === null);
        console.log('🔍 Checking for waiting waypoint. Index:', waitingForWaypoint);
        console.log('🔍 Current waypoints array:', this.waypoints);
        
        if (waitingForWaypoint !== -1) {
            console.log(`✅ Setting waypoint ${waitingForWaypoint + 1} at:`, latlng);
            this.waypoints[waitingForWaypoint] = latlng;
            console.log('🔍 Waypoints array after setting:', this.waypoints);
            
            // Create waypoint marker
            const waypointMarker = L.marker([latlng.lat, latlng.lng], {
                icon: this.createWaypointMarker(waitingForWaypoint)
            }).addTo(this.map);
            
            this.waypointMarkers[waitingForWaypoint] = waypointMarker;
            this.updateWaypointsList();
            
            // Show message to remind user to click "Direction" button
            if (this.startMarker && this.endMarker) {
                this.showStatusMessage(`Waypoint ${waitingForWaypoint + 1} set! Click "Direction" button to recalculate route.`, 'success');
            } else {
                this.showStatusMessage(`Waypoint ${waitingForWaypoint + 1} set!`, 'success');
            }
            
            return;
        }
        
        if (this.clickCount === 0) {
            // Set start point
            this.setStartPoint(latlng);
            this.clickCount = 1;
        } else if (this.clickCount === 1) {
            // Set end point
            this.setEndPoint(latlng);
            this.clickCount = 2;
            // Prompt user to click Direction button instead of auto-calculating
            this.showStatusMessage('✅ End point set! Click "Direction" button to calculate route.', 'success');
        } else {
            // If route already exists, suggest using Clear Route button or add as waypoint
            this.showStatusMessage('Route already exists! Use "Clear Route" button to reset, or click "Add Stop" to add waypoints.', 'info');
        }
    }




    showError(message) {
        // Create error popup
        L.popup()
            .setLatLng(this.map.getCenter())
            .setContent(`
                <div style="color: #dc3545; text-align: center;">
                    <strong>⚠️ Error</strong><br/>
                    ${message}
                </div>
            `)
            .openOn(this.map);
    }

    showStatusMessage(message, type = 'info') {
        // Create temporary status message overlay
        const statusOverlay = document.createElement('div');
        statusOverlay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 500;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        statusOverlay.textContent = message;
        
        // Add CSS animation
        if (!document.querySelector('#statusAnimation')) {
            const style = document.createElement('style');
            style.id = 'statusAnimation';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(statusOverlay);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            statusOverlay.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (statusOverlay.parentNode) {
                    statusOverlay.parentNode.removeChild(statusOverlay);
                }
            }, 300);
        }, 3000);
    }




    // Enhanced marker creation methods
    createStartMarker(latlng) {
        return L.divIcon({
            html: `<div class="custom-marker start-marker">
                     <div class="marker-content">A</div>
                   </div>`,
            className: 'custom-marker-container',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
    }

    createEndMarker(latlng) {
        return L.divIcon({
            html: `<div class="custom-marker end-marker">
                     <div class="marker-content">B</div>
                   </div>`,
            className: 'custom-marker-container',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
    }

    createWaypointMarker(index) {
        return L.divIcon({
            html: `<div class="custom-marker waypoint-marker">
                     <div class="marker-content">${index + 1}</div>
                   </div>`,
            className: 'custom-marker-container',
            iconSize: [28, 28],
            iconAnchor: [14, 28]
        });
    }

    setStartPoint(latlng) {
        // Remove existing start marker
        if (this.startMarker) {
            this.map.removeLayer(this.startMarker);
        }

        // Create new draggable start marker with custom styling
        this.startMarker = L.marker([latlng.lat, latlng.lng], {
            icon: this.createStartMarker(latlng),
            draggable: true,  // ✅ Make marker draggable
            autoPan: true     // Auto-pan map when dragging near edge
        }).addTo(this.map);

        // Add drag event listeners for visual feedback
        this.startMarker.on('dragstart', () => {
            this.startMarker.setOpacity(0.6);
            console.log('🔄 Start marker drag started');
        });

        this.startMarker.on('dragend', (e) => {
            this.startMarker.setOpacity(1.0);
            const newLatLng = e.target.getLatLng();
            console.log('✅ Start marker dragged to:', newLatLng);
            this.handleMarkerDrag('start', newLatLng);
        });

        // Update input field
        const fromInput = document.getElementById('fromInput');
        if (fromInput) {
            fromInput.value = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
        }

        // Show individual clear button for start point
        const clearFromBtn = document.getElementById('clearFromInput');
        if (clearFromBtn) clearFromBtn.style.display = 'flex';

        this.showStatusMessage('✅ Start point set! Now set your destination.', 'success');
        
        // Show clear route button once we have a start point
        const clearButton = document.getElementById('clearRoute');
        if (clearButton) clearButton.style.display = 'block';
        
        // Update route points display
        this.updateRoutePointsDisplay();
    }

    setEndPoint(latlng) {
        // Remove existing end marker
        if (this.endMarker) {
            this.map.removeLayer(this.endMarker);
        }

        // Create new draggable end marker with custom styling
        this.endMarker = L.marker([latlng.lat, latlng.lng], {
            icon: this.createEndMarker(latlng),
            draggable: true,  // ✅ Make marker draggable
            autoPan: true     // Auto-pan map when dragging near edge
        }).addTo(this.map);

        // Add drag event listeners for visual feedback
        this.endMarker.on('dragstart', () => {
            this.endMarker.setOpacity(0.6);
            console.log('🔄 End marker drag started');
        });

        this.endMarker.on('dragend', (e) => {
            this.endMarker.setOpacity(1.0);
            const newLatLng = e.target.getLatLng();
            console.log('✅ End marker dragged to:', newLatLng);
            this.handleMarkerDrag('end', newLatLng);
        });

        // Update input field
        const toInput = document.getElementById('toInput');
        if (toInput) {
            toInput.value = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
        }

        // Show individual clear button for end point
        const clearToBtn = document.getElementById('clearToInput');
        if (clearToBtn) clearToBtn.style.display = 'flex';

        this.showStatusMessage('✅ Destination set! Click "Calculate Route" to navigate.', 'success');
        
        // Update route points display
        this.updateRoutePointsDisplay();
    }

    // Enhanced navigation methods
    setupNavigationEventListeners() {
        // Profile selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Clear existing route when switching profiles
                this.clearAlternativeRoutes();
                if (this.routeLayer) {
                    this.map.removeLayer(this.routeLayer);
                    this.routeLayer = null;
                }
                
                // Clear elevation panel
                this.hideElevationProfile();
                
                // Update profile selection
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentProfile = btn.dataset.profile;
                this.log(`🔄 Switched to ${this.currentProfile} profile`);
                
                // Show helpful tips for different modes
                if (this.currentProfile === 'bicycle') {
                    this.showStatusMessage(
                        '🚲 Cycling mode: Works best with cycling-friendly locations like East Coast Park, Marina Bay Gardens, Park Connectors (PCN), and Tampines cycling town. May not find routes on busy roads without cycling infrastructure.', 
                        'info'
                    );
                } else if (this.currentProfile === 'foot') {
                    this.showStatusMessage(
                        '🚶 Walking mode: Uses footpaths, walkways, and pedestrian areas. Avoids highways and major roads.', 
                        'info'
                    );
                } else if (this.currentProfile === 'car') {
                    this.showStatusMessage(
                        '🚗 Driving mode: Uses roads and highways accessible to cars. Avoids footpaths and cycling-only areas.', 
                        'info'
                    );
                } else if (this.currentProfile === 'motorcycle') {
                    this.showStatusMessage(
                        '🏍️ Motorcycle mode: Similar to car routing but may use lanes not accessible to larger vehicles.', 
                        'info'
                    );
                }
            });
        });

        // Search inputs
        const fromInput = document.getElementById('fromInput');
        const toInput = document.getElementById('toInput');
        
        if (fromInput) {
            // Handle POI search (existing functionality)
            fromInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value, 'from');
            });
            
            // Handle manual coordinate input (new functionality)
            // Listen for Enter key or blur event to parse coordinates
            fromInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.target.value.trim();
                    // Try to parse as coordinates
                    if (this.parseCoordinateInput(value)) {
                        this.handleManualCoordinateInput('start', value);
                        // Hide search results if they were showing
                        const fromResults = document.getElementById('fromResults');
                        if (fromResults) fromResults.style.display = 'none';
                    }
                }
            });
            
            fromInput.addEventListener('blur', (e) => {
                const value = e.target.value.trim();
                // Only try coordinate parsing if value looks like coordinates (contains comma)
                if (value.includes(',') && this.parseCoordinateInput(value)) {
                    this.handleManualCoordinateInput('start', value);
                }
            });
        }
        
        if (toInput) {
            // Handle POI search (existing functionality)
            toInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value, 'to');
            });
            
            // Handle manual coordinate input (new functionality)
            toInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.target.value.trim();
                    // Try to parse as coordinates
                    if (this.parseCoordinateInput(value)) {
                        this.handleManualCoordinateInput('end', value);
                        // Hide search results if they were showing
                        const toResults = document.getElementById('toResults');
                        if (toResults) toResults.style.display = 'none';
                    }
                }
            });
            
            toInput.addEventListener('blur', (e) => {
                const value = e.target.value.trim();
                // Only try coordinate parsing if value looks like coordinates (contains comma)
                if (value.includes(',') && this.parseCoordinateInput(value)) {
                    this.handleManualCoordinateInput('end', value);
                }
            });
        }

        // Swap locations
        const swapBtn = document.getElementById('swapLocations');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => {
                this.swapLocations();
            });
        }

        // Add waypoint
        const addWaypointBtn = document.getElementById('addWaypoint');
        if (addWaypointBtn) {
            addWaypointBtn.addEventListener('click', () => {
                this.addWaypoint();
            });
        }

        // Clear individual start point button
        const clearFromBtn = document.getElementById('clearFromInput');
        if (clearFromBtn) {
            clearFromBtn.addEventListener('click', () => {
                this.clearStartPoint();
            });
        }

        // Clear individual end point button
        const clearToBtn = document.getElementById('clearToInput');
        if (clearToBtn) {
            clearToBtn.addEventListener('click', () => {
                this.clearEndPoint();
            });
        }

        // Calculate route button
        const calculateBtn = document.getElementById('calculateRoute');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.calculateRoute();
            });
        }

        // Alternative routes toggle - clear previous routes when toggled
        const alternativesToggle = document.getElementById('alternativesToggle');
        const algorithmSelection = document.getElementById('algorithmSelection');
        
        if (alternativesToggle) {
            alternativesToggle.addEventListener('change', () => {
                // Show/hide algorithm selection based on toggle
                if (algorithmSelection) {
                    algorithmSelection.style.display = alternativesToggle.checked ? 'block' : 'none';
                }
                
                // Clear any existing routes for better user experience
                this.clearAlternativeRoutes();
                
                // Clear route info and UI elements
                const routeInfo = document.getElementById('routeInfo');
                if (routeInfo) routeInfo.style.display = 'none';
                
                const alternativeRoutes = document.getElementById('alternativeRoutes');
                if (alternativeRoutes) alternativeRoutes.style.display = 'none';
                
                const performanceIndicator = document.getElementById('performanceIndicator');
                if (performanceIndicator) performanceIndicator.style.display = 'none';
                
                // Hide floating directions panel
                this.hideFloatingDirections();
                
                // Hide elevation profile
                this.hideElevationProfile();
                
                // Show status message about the change
                const toggleStatus = alternativesToggle.checked ? 'enabled' : 'disabled';
                this.showStatusMessage(
                    `🛣️ Alternative routes ${toggleStatus}. Click "Calculate Route" to see the difference!`, 
                    'info'
                );
            });
            
            // Initialize visibility on load
            if (algorithmSelection) {
                algorithmSelection.style.display = alternativesToggle.checked ? 'block' : 'none';
            }
        }
        
        // Algorithm dropdown change handler - show helpful descriptions
        const algorithmDropdown = document.getElementById('algorithmDropdown');
        const algorithmHelp = document.getElementById('algorithmHelp');
        
        if (algorithmDropdown && algorithmHelp) {
            const algorithmDescriptions = {
                'plateau': '🎯 <strong>Plateau A*:</strong> Finds routes with similar total cost using A* heuristics. <em>Best quality, profile-aware (5-10s).</em>',
                'penalty': '🎯 <strong>Penalty A*:</strong> Penalizes optimal route edges to force maximum diversity. <em>Most diverse routes (5-10s).</em>',
                'via_point': '🎯 <strong>Via Point A*:</strong> Routes through strategic intermediate waypoints. <em>Geographical diversity (5-10s).</em>',
                'corridor': '🎯 <strong>Corridor A*:</strong> Explores routes within distance corridors from optimal. <em>Controlled exploration (5-10s).</em>',
                'multi_objective': '🎯 <strong>Multi-Objective A*:</strong> Balances time, distance, scenery, and safety. <em>Best overall quality (10-15s).</em>',
                'quantaroute': '⚡ <strong>Fast Exclusion:</strong> Quick edge exclusion algorithm. <em>Simplest and fastest (~1s).</em>'
            };
            
            algorithmDropdown.addEventListener('change', () => {
                const selectedAlgorithm = algorithmDropdown.value;
                const description = algorithmDescriptions[selectedAlgorithm] || 'Select an algorithm to see details.';
                algorithmHelp.innerHTML = description;
                
                // Visual warning for A* algorithms
                const isAstar = ['plateau', 'penalty', 'via_point', 'corridor', 'multi_objective'].includes(selectedAlgorithm);
                if (isAstar) {
                    algorithmHelp.style.borderLeftColor = '#e67e22'; // Orange warning
                    algorithmHelp.style.background = '#fff3e0';
                } else {
                    algorithmHelp.style.borderLeftColor = '#3498db'; // Blue info
                    algorithmHelp.style.background = '#f8f9fa';
                }
            });
        }

        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                document.querySelectorAll('.search-results').forEach(results => {
                    results.style.display = 'none';
                });
            }
        });

        // Load POI data
        this.loadPOIData();
        
        // Setup collapsible instructions after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.setupCollapsibleInstructions();
        }, 100);
    }

    async loadPOIData() {
        try {
            const response = await this.apiCall('search?q=');
            if (response.ok) {
                const data = await response.json();
                this.bengaluruPOIs = data.results || [];
            }
        } catch (error) {
            // Use fallback Bengaluru POI data
            this.bengaluruPOIs = [
                {"name": "Kempegowda International Airport", "address": "KIAL Road", "lat": 13.1986, "lng": 77.7066},
                {"name": "MG Road", "address": "MG Road", "lat": 12.9716, "lng": 77.5946},
                {"name": "Electronic City", "address": "Electronic City", "lat": 12.8456, "lng": 77.6603},
                {"name": "Whitefield", "address": "Whitefield", "lat": 12.9698, "lng": 77.7500},
                {"name": "Koramangala", "address": "Koramangala", "lat": 12.9279, "lng": 77.6271},
                {"name": "Indiranagar", "address": "Indiranagar", "lat": 12.9719, "lng": 77.6412},
                {"name": "JP Nagar", "address": "JP Nagar", "lat": 12.9081, "lng": 77.5831},
                {"name": "Marathahalli", "address": "Marathahalli", "lat": 12.9591, "lng": 77.6974}
            ];
        }
    }

    handleSearch(query, type) {
        clearTimeout(this.searchTimeout);
        
        const resultsContainer = document.getElementById(`${type}Results`);
        
        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }

        this.searchTimeout = setTimeout(() => {
            this.performSearch(query, type, resultsContainer);
        }, 300);
    }

    performSearch(query, type, resultsContainer) {
        let filtered = this.bengaluruPOIs.filter(poi => 
            poi.name.toLowerCase().includes(query.toLowerCase()) ||
            poi.address.toLowerCase().includes(query.toLowerCase())
        );
        
        // Prioritize cycling-friendly locations when in bicycle mode
        if (this.currentProfile === 'bicycle') {
            filtered = filtered.sort((a, b) => {
                const aIsCycling = a.cycling_friendly || a.category === 'cycling';
                const bIsCycling = b.cycling_friendly || b.category === 'cycling';
                
                if (aIsCycling && !bIsCycling) return -1;
                if (!aIsCycling && bIsCycling) return 1;
                return 0;
            });
        }
        
        filtered = filtered.slice(0, 5);

        if (filtered.length === 0) {
            resultsContainer.style.display = 'none';
            return;
        }

        const html = filtered.map(poi => {
            const isCyclingFriendly = poi.cycling_friendly || poi.category === 'cycling';
            const cyclingIndicator = (this.currentProfile === 'bicycle' && isCyclingFriendly) ? 
                ' <span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px;">🚲 BIKE-FRIENDLY</span>' : '';
            
            return `
                <div class="search-result-item" data-lat="${poi.lat}" data-lng="${poi.lng}" data-name="${poi.name}" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;">
                    <div style="font-weight: 500; color: #1e293b;">${poi.name}${cyclingIndicator}</div>
                    <div style="font-size: 12px; color: #64748b;">${poi.address}</div>
                </div>
            `;
        }).join('');

        resultsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';
        resultsContainer.style.position = 'absolute';
        resultsContainer.style.top = '100%';
        resultsContainer.style.left = '0';
        resultsContainer.style.right = '0';
        resultsContainer.style.background = 'white';
        resultsContainer.style.border = '1px solid #e2e8f0';
        resultsContainer.style.borderRadius = '6px';
        resultsContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        resultsContainer.style.maxHeight = '200px';
        resultsContainer.style.overflowY = 'auto';
        resultsContainer.style.zIndex = '100';

        // Add click handlers
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lng = parseFloat(item.dataset.lng);
                const name = item.dataset.name;
                
                document.getElementById(`${type}Input`).value = name;
                resultsContainer.style.display = 'none';

                if (type === 'from') {
                    this.setStartPoint({lat, lng});
                } else {
                    this.setEndPoint({lat, lng});
                }
            });

            item.addEventListener('mouseover', () => {
                item.style.background = '#f8fafc';
            });

            item.addEventListener('mouseout', () => {
                item.style.background = 'white';
            });
        });
    }

    swapLocations() {
        const fromInput = document.getElementById('fromInput');
        const toInput = document.getElementById('toInput');
        
        const tempValue = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = tempValue;

        // Swap markers
        if (this.startMarker && this.endMarker) {
            const startPos = this.startMarker.getLatLng();
            const endPos = this.endMarker.getLatLng();
            
            this.setStartPoint(endPos);
            this.setEndPoint(startPos);
        }
    }

    /**
     * Parse manual coordinate input
     * Supports formats:
     * - "1.3521, 103.8198"
     * - "1.3521,103.8198"
     * - "lat: 1.3521, lng: 103.8198"
     */
    parseCoordinateInput(input) {
        if (!input || typeof input !== 'string') {
            return null;
        }

        // Remove whitespace and common prefixes
        const cleaned = input.trim()
            .replace(/lat[itude]*\s*:\s*/gi, '')
            .replace(/lng|lon[gitude]*\s*:\s*/gi, '');
        
        // Try to extract two numbers (supports negative, decimals)
        const matches = cleaned.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
        
        if (!matches || matches.length < 3) {
            return null;
        }
        
        const lat = parseFloat(matches[1]);
        const lng = parseFloat(matches[2]);
        
        // Validate ranges (standard lat/lng bounds)
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return null;
        }
        
        return { lat, lng };
    }

    /**
     * Handle manual coordinate input from text fields
     */
    handleManualCoordinateInput(type, value) {
        console.log(`🔍 Manual coordinate input for ${type}:`, value);
        
        const input = type === 'start' 
            ? document.getElementById('fromInput')
            : document.getElementById('toInput');
        
        const coords = this.parseCoordinateInput(value);
        
        if (!coords) {
            // Add invalid styling
            if (input) {
                input.classList.add('invalid');
                input.classList.remove('valid');
                setTimeout(() => input.classList.remove('invalid'), 300);
            }
            this.showStatusMessage(
                '❌ Invalid coordinates. Use format: lat, lng (e.g., 1.3521, 103.8198)',
                'error'
            );
            return false;
        }
        
        // Add valid styling
        if (input) {
            input.classList.add('valid');
            input.classList.remove('invalid');
            setTimeout(() => input.classList.remove('valid'), 2000);
        }
        
        const latlng = L.latLng(coords.lat, coords.lng);
        
        if (type === 'start') {
            this.setStartPoint(latlng);
            this.clickCount = Math.max(1, this.clickCount); // Ensure clickCount is at least 1
            console.log('✅ Start point set from manual input:', coords);
            this.showStatusMessage('✅ Start point updated!', 'success');
        } else {
            this.setEndPoint(latlng);
            this.clickCount = Math.max(2, this.clickCount); // Ensure clickCount is at least 2
            console.log('✅ End point set from manual input:', coords);
            this.showStatusMessage('✅ End point set! Click "Direction" button to calculate route.', 'success');
        }
        
        return true;
    }

    /**
     * Handle marker drag and update input fields
     * Called when start or end marker is dragged to a new position
     */
    handleMarkerDrag(type, latlng) {
        console.log(`🎯 ${type} marker dragged to:`, latlng);
        
        // Update input field with new coordinates
        const input = type === 'start' 
            ? document.getElementById('fromInput')
            : document.getElementById('toInput');
        
        if (input) {
            input.value = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
            console.log(`✅ Updated ${type} input field with new coordinates`);
        }
        
        // Show feedback message
        const pointName = type === 'start' ? 'Start' : 'End';
        this.showStatusMessage(
            `📍 ${pointName} point moved! Click "Direction" to recalculate route.`,
            'info'
        );
        
        // Note: We don't auto-recalculate the route here - user must click "Direction" button
        // This gives them control to adjust multiple points before recalculating
    }

    /**
     * Clear start point marker and input
     */
    clearStartPoint() {
        console.log('🧹 Clearing start point');
        
        // Remove marker from map
        if (this.startMarker) {
            this.map.removeLayer(this.startMarker);
            this.startMarker = null;
        }
        
        // Clear input field
        const fromInput = document.getElementById('fromInput');
        if (fromInput) {
            fromInput.value = '';
            fromInput.classList.remove('valid', 'invalid');
        }
        
        // Hide clear button
        const clearFromBtn = document.getElementById('clearFromInput');
        if (clearFromBtn) clearFromBtn.style.display = 'none';
        
        // Update click count
        if (this.clickCount > 0) this.clickCount--;
        
        console.log('✅ Start point cleared');
        this.showStatusMessage('Start point cleared', 'info');
        
        // Update route points display
        this.updateRoutePointsDisplay();
    }

    /**
     * Clear end point marker and input
     */
    clearEndPoint() {
        console.log('🧹 Clearing end point');
        
        // Remove marker from map
        if (this.endMarker) {
            this.map.removeLayer(this.endMarker);
            this.endMarker = null;
        }
        
        // Clear input field
        const toInput = document.getElementById('toInput');
        if (toInput) {
            toInput.value = '';
            toInput.classList.remove('valid', 'invalid');
        }
        
        // Hide clear button
        const clearToBtn = document.getElementById('clearToInput');
        if (clearToBtn) clearToBtn.style.display = 'none';
        
        // Update click count
        if (this.clickCount > 1) this.clickCount--;
        
        console.log('✅ End point cleared');
        this.showStatusMessage('End point cleared', 'info');
        
        // Update route points display
        this.updateRoutePointsDisplay();
    }

    addWaypoint() {
        console.log('🔵 addWaypoint() called');
        console.log('🔍 Current waypoints before adding:', this.waypoints);
        
        const waypointsList = document.getElementById('waypointsList');
        if (!waypointsList) {
            console.error('❌ waypointsList element not found!');
            return;
        }
        
        const waypointIndex = this.waypoints.length;
        console.log(`➕ Adding waypoint slot #${waypointIndex + 1}`);
        
        const waypointDiv = document.createElement('div');
        waypointDiv.className = 'waypoint-item';
        waypointDiv.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 8px; background: #f8fafc; border-radius: 6px; margin-bottom: 6px;';
        
        // Create remove button with proper event listener instead of inline onclick
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.style.cssText = 'background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; font-size: 20px;';
        removeBtn.addEventListener('click', () => this.removeWaypoint(waypointIndex));
        
        // Create waypoint content
        const numberDiv = document.createElement('div');
        numberDiv.style.cssText = 'width: 20px; height: 20px; border-radius: 50%; background: #f59e0b; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 600;';
        numberDiv.textContent = waypointIndex + 1;
        
        const textDiv = document.createElement('div');
        textDiv.style.cssText = 'flex: 1; font-size: 13px; color: #475569;';
        textDiv.textContent = 'Click on map to set waypoint';
        
        // Append elements
        waypointDiv.appendChild(numberDiv);
        waypointDiv.appendChild(textDiv);
        waypointDiv.appendChild(removeBtn);
        
        waypointsList.appendChild(waypointDiv);
        this.waypoints.push(null);
        
        console.log(`✅ Waypoint #${waypointIndex + 1} added successfully. Total waypoints: ${this.waypoints.length}`);
        this.showStatusMessage(`Waypoint ${waypointIndex + 1} added! Click on the map to set its location.`, 'success');
    }

    removeWaypoint(index) {
        console.log(`🗑️ Removing waypoint #${index + 1}`);
        
        // Remove marker from map
        if (this.waypointMarkers[index]) {
            this.map.removeLayer(this.waypointMarkers[index]);
            console.log(`✅ Marker removed from map for waypoint #${index + 1}`);
        }
        
        // Remove from arrays
        this.waypoints.splice(index, 1);
        this.waypointMarkers.splice(index, 1);
        
        console.log(`✅ Waypoint #${index + 1} removed. Remaining waypoints: ${this.waypoints.length}`);
        this.showStatusMessage(`Waypoint ${index + 1} removed!`, 'success');
        
        // Rebuild waypoints list
        this.updateWaypointsList();
    }

    updateWaypointsList() {
        console.log('🔄 Updating waypoints list');
        const waypointsList = document.getElementById('waypointsList');
        if (!waypointsList) {
            console.error('❌ waypointsList element not found in updateWaypointsList!');
            return;
        }
        
        waypointsList.innerHTML = '';
        
        this.waypoints.forEach((waypoint, index) => {
            const waypointDiv = document.createElement('div');
            waypointDiv.className = 'waypoint-item';
            waypointDiv.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 8px; background: #f8fafc; border-radius: 6px; margin-bottom: 6px;';
            
            // Create remove button with proper event listener
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '×';
            removeBtn.style.cssText = 'background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; font-size: 20px;';
            removeBtn.addEventListener('click', () => this.removeWaypoint(index));
            
            // Create waypoint number indicator
            const numberDiv = document.createElement('div');
            numberDiv.style.cssText = 'width: 20px; height: 20px; border-radius: 50%; background: #f59e0b; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 600;';
            numberDiv.textContent = index + 1;
            
            // Create waypoint text content
            const textDiv = document.createElement('div');
            textDiv.style.cssText = 'flex: 1; font-size: 13px; color: #475569;';
            textDiv.textContent = waypoint ? `${waypoint.lat.toFixed(4)}, ${waypoint.lng.toFixed(4)}` : 'Click on map to set waypoint';
            
            // Append elements
            waypointDiv.appendChild(numberDiv);
            waypointDiv.appendChild(textDiv);
            waypointDiv.appendChild(removeBtn);
            
            waypointsList.appendChild(waypointDiv);
        });
        
        console.log(`✅ Waypoints list updated. Total: ${this.waypoints.length}`);
        
        // Update the route points display (A, B, C labels)
        this.updateRoutePointsDisplay();
    }

    /**
     * Update the route points display with A, B, C labeled cards (MapView.js style)
     */
    updateRoutePointsDisplay() {
        const display = document.getElementById('routePointsDisplay');
        if (!display) return;
        
        // Clear existing display
        display.innerHTML = '';
        
        // Create combined list of all points
        const allPoints = [];
        
        // Add start point
        if (this.startMarker) {
            const startLatLng = this.startMarker.getLatLng();
            allPoints.push({
                type: 'start',
                latlng: startLatLng,
                index: -1
            });
        }
        
        // Add waypoints
        this.waypoints.forEach((waypoint, index) => {
            if (waypoint) {
                allPoints.push({
                    type: 'waypoint',
                    latlng: waypoint,
                    index: index
                });
            }
        });
        
        // Add end point
        if (this.endMarker) {
            const endLatLng = this.endMarker.getLatLng();
            allPoints.push({
                type: 'end',
                latlng: endLatLng,
                index: -1
            });
        }
        
        // If no points set, hide the display
        if (allPoints.length === 0) {
            display.style.display = 'none';
            return;
        }
        
        display.style.display = 'flex';
        
        // Create compact cards for each point
        allPoints.forEach((point, displayIndex) => {
            const letter = String.fromCharCode(65 + displayIndex); // A, B, C, D...
            const isLast = displayIndex === allPoints.length - 1;
            
            const card = document.createElement('div');
            card.className = 'route-point-card';
            
            // Simple text label with color
            const label = document.createElement('span');
            label.className = `route-point-label ${point.type}`;
            label.textContent = point.type === 'start' ? 'Start' :
                                point.type === 'end' ? 'Destination' : `Stop`;
            label.style.cssText = `
                font-weight: 600;
                font-size: 11px;
                color: ${point.type === 'start' ? '#52c41a' : point.type === 'end' ? '#f5222d' : '#1890ff'};
                margin-right: 8px;
            `;
            
            // Coordinates
            const coords = document.createElement('span');
            coords.className = 'route-point-coords';
            coords.textContent = `${point.latlng.lat.toFixed(5)}, ${point.latlng.lng.toFixed(5)}`;
            coords.style.cssText = 'flex: 1; font-size: 13px; color: #333;';
            
            // Controls for waypoints
            if (point.type === 'waypoint') {
                const controls = document.createElement('div');
                controls.className = 'route-point-controls';
                controls.style.cssText = 'display: flex; gap: 4px; margin-left: 8px;';
                
                // Move up button
                if (displayIndex > 1) {
                    const upBtn = document.createElement('button');
                    upBtn.innerHTML = '↑';
                    upBtn.title = 'Move up';
                    upBtn.style.cssText = 'background: none; border: none; color: #999; cursor: pointer; padding: 0 4px; font-size: 14px;';
                    upBtn.addEventListener('click', () => this.moveWaypointUp(point.index));
                    controls.appendChild(upBtn);
                }
                
                // Move down button
                if (!isLast) {
                    const downBtn = document.createElement('button');
                    downBtn.innerHTML = '↓';
                    downBtn.title = 'Move down';
                    downBtn.style.cssText = 'background: none; border: none; color: #999; cursor: pointer; padding: 0 4px; font-size: 14px;';
                    downBtn.addEventListener('click', () => this.moveWaypointDown(point.index));
                    controls.appendChild(downBtn);
                }
                
                // Remove button
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '✕';
                removeBtn.title = 'Remove';
                removeBtn.style.cssText = 'background: none; border: none; color: #f5222d; cursor: pointer; padding: 0 4px; font-size: 16px;';
                removeBtn.addEventListener('click', () => this.removeWaypoint(point.index));
                controls.appendChild(removeBtn);
                
                card.appendChild(label);
                card.appendChild(coords);
                card.appendChild(controls);
            } else {
                // Just label and coords for start/end
                card.appendChild(label);
                card.appendChild(coords);
            }
            
            // Simple styling for cards
            card.style.cssText = `
                display: flex;
                align-items: center;
                padding: 8px 12px;
                background: #f9f9f9;
                border: 1px solid #e0e0e0;
                border-radius: 6px;
                margin-bottom: 6px;
            `;
            
            display.appendChild(card);
        });
    }
    
    /**
     * Move waypoint up in the list
     */
    moveWaypointUp(index) {
        if (index <= 0) return; // Can't move up the first waypoint
        
        // Swap with previous waypoint
        const temp = this.waypoints[index];
        this.waypoints[index] = this.waypoints[index - 1];
        this.waypoints[index - 1] = temp;
        
        // Swap markers too
        const tempMarker = this.waypointMarkers[index];
        this.waypointMarkers[index] = this.waypointMarkers[index - 1];
        this.waypointMarkers[index - 1] = tempMarker;
        
        // Update icons to reflect new order
        if (this.waypointMarkers[index]) {
            this.waypointMarkers[index].setIcon(this.createWaypointMarker(index));
        }
        if (this.waypointMarkers[index - 1]) {
            this.waypointMarkers[index - 1].setIcon(this.createWaypointMarker(index - 1));
        }
        
        this.updateWaypointsList();
        console.log(`📍 Moved waypoint ${index + 1} up to position ${index}`);
    }
    
    /**
     * Move waypoint down in the list
     */
    moveWaypointDown(index) {
        if (index >= this.waypoints.length - 1) return; // Can't move down the last waypoint
        
        // Swap with next waypoint
        const temp = this.waypoints[index];
        this.waypoints[index] = this.waypoints[index + 1];
        this.waypoints[index + 1] = temp;
        
        // Swap markers too
        const tempMarker = this.waypointMarkers[index];
        this.waypointMarkers[index] = this.waypointMarkers[index + 1];
        this.waypointMarkers[index + 1] = tempMarker;
        
        // Update icons to reflect new order
        if (this.waypointMarkers[index]) {
            this.waypointMarkers[index].setIcon(this.createWaypointMarker(index));
        }
        if (this.waypointMarkers[index + 1]) {
            this.waypointMarkers[index + 1].setIcon(this.createWaypointMarker(index + 1));
        }
        
        this.updateWaypointsList();
        console.log(`📍 Moved waypoint ${index + 1} down to position ${index + 2}`);
    }

    showElevationProfile(routeData) {
        this.log('🔍 showElevationProfile called', {
            profile: this.currentProfile,
            hasData: !!routeData.elevation_profile
        });
        
        const elevationPanel = document.getElementById('elevationPanel');
        
        if (!elevationPanel) {
            console.error('❌ Elevation panel not found in DOM!');
            return;
        }
        
        if (this.currentProfile === 'bicycle' || this.currentProfile === 'foot') {
            
            // Use REAL elevation data from backend (AWS Terrain Tiles)
            const elevationData = routeData.elevation_profile;
            
            if (!elevationData || elevationData.length === 0) {
                this.log('⚠️ No elevation data - hiding panel');
                elevationPanel.style.display = 'none';
                return;
            }
            
            this.log('📊 Elevation data:', {
                length: elevationData.length,
                hasStats: !!routeData.elevation_stats
            });
            
            if (elevationData && elevationData.length > 0) {
                
                // Update elevation statistics (pass routeData to use backend stats)
                this.updateElevationStats(elevationData, routeData);
                
                // Show the elevation panel
                elevationPanel.style.display = 'block';
                
                // Force visibility in case of CSS issues
                elevationPanel.style.visibility = 'visible';
                elevationPanel.style.opacity = '1';
                elevationPanel.style.zIndex = '1000';
                
                // Safely destroy existing chart
                if (this.elevationChart) {
                    try {
                        this.elevationChart.destroy();
                    } catch (error) {
                        console.warn('Error destroying elevation chart:', error);
                    }
                    this.elevationChart = null;
                }

                try {
                    const canvas = document.getElementById('elevationChart');
                    
                    if (!canvas) {
                        console.error('Elevation chart canvas not found!');
                        return;
                    }

                    // Force canvas to be visible and sized properly
                    canvas.style.display = 'block';
                    canvas.style.width = '100%';
                    canvas.style.height = '140px';
                    canvas.width = canvas.offsetWidth || 400;
                    canvas.height = 140;
                    
                    // Draw elevation chart
                    this.drawSimpleElevationChart(canvas, elevationData, routeData);

                } catch (error) {
                    console.error('Error drawing elevation chart:', error);
                }

                // Setup minimize button if not already done
                this.setupElevationControls();
            } else {
                elevationPanel.style.display = 'none';
            }
        } else {
            elevationPanel.style.display = 'none';
        }
    }
    


    updateElevationStats(elevationData, routeStats = null) {
        // Use backend-calculated stats if available (more accurate)
        if (routeStats && routeStats.elevation_stats) {
            const stats = routeStats.elevation_stats;
            
            this.log('📊 Using backend elevation stats');
            
            const minEl = document.getElementById('minElevation');
            const maxEl = document.getElementById('maxElevation');
            const gainEl = document.getElementById('elevationGain');
            
            if (minEl) minEl.textContent = `${Math.round(stats.min_elevation_m)}m`;
            if (maxEl) maxEl.textContent = `${Math.round(stats.max_elevation_m)}m`;
            if (gainEl) gainEl.textContent = `${Math.round(stats.total_ascent_m)}m`;
            
            return;
        }
        
        // Fallback: Calculate from elevation data if backend stats not available
        const elevations = elevationData.map(d => d.elevation_m);
        const minElevation = Math.min(...elevations);
        const maxElevation = Math.max(...elevations);
        
        // Calculate elevation gain (cumulative upward movement)
        let elevationGain = 0;
        for (let i = 1; i < elevations.length; i++) {
            const diff = elevations[i] - elevations[i - 1];
            if (diff > 0) elevationGain += diff;
        }
        
        this.log('📊 Calculated elevation stats');
        
        // Update DOM elements
        const minEl = document.getElementById('minElevation');
        const maxEl = document.getElementById('maxElevation');
        const gainEl = document.getElementById('elevationGain');
        
        if (minEl) minEl.textContent = `${Math.round(minElevation)}m`;
        if (maxEl) maxEl.textContent = `${Math.round(maxElevation)}m`;
        if (gainEl) gainEl.textContent = `${Math.round(elevationGain)}m`;
    }

    setupElevationControls() {
        const minimizeBtn = document.getElementById('elevationMinimize');
        if (minimizeBtn && !minimizeBtn.hasAttribute('data-listener-added')) {
            minimizeBtn.addEventListener('click', () => {
                this.toggleElevationPanel();
            });
            minimizeBtn.setAttribute('data-listener-added', 'true');
        }
    }

    toggleElevationPanel() {
        const elevationPanel = document.getElementById('elevationPanel');
        if (elevationPanel) {
            elevationPanel.classList.toggle('minimized');
            
            const minimizeBtn = document.getElementById('elevationMinimize');
            const svg = minimizeBtn.querySelector('svg path');
            if (elevationPanel.classList.contains('minimized')) {
                svg.setAttribute('d', 'M18 15l-6-6-6 6'); // Up arrow
            } else {
                svg.setAttribute('d', 'M6 9l6 6 6-6'); // Down arrow
            }
        }
    }

    hideElevationProfile() {
        const elevationPanel = document.getElementById('elevationPanel');
        if (elevationPanel) {
            elevationPanel.style.display = 'none';
            elevationPanel.classList.remove('minimized');
        }
        
        // Destroy chart to free memory
        if (this.elevationChart) {
            try {
                this.elevationChart.destroy();
                this.elevationChart = null;
            } catch (error) {
                console.warn('Error destroying elevation chart:', error);
            }
        }
    }

    drawSimpleElevationChart(canvas, elevationData, routeData) {
        if (!canvas || !elevationData || elevationData.length === 0) {
            this.log('⚠️ Canvas or elevation data missing');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Cannot get canvas context');
            return;
        }
        
        // Ensure canvas is properly sized and crisp
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = (rect.width || canvas.offsetWidth || 400) * dpr;
        canvas.height = 180 * dpr;  // Increased height for better readability
        canvas.style.width = (canvas.width / dpr) + 'px';
        canvas.style.height = '180px';
        
        // Scale context for high DPI
        ctx.scale(dpr, dpr);
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;
        
        // Clear canvas with gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, '#fafbfc');
        bgGradient.addColorStop(1, '#f8fafc');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Set up dimensions with better padding
        const padding = { left: 60, right: 30, top: 40, bottom: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        if (chartWidth <= 0 || chartHeight <= 0) {
            console.warn('Chart dimensions too small');
            return;
        }
        
        // Normalize elevation data like Geoapify tutorial
        const normalizedData = this.normalizeElevationData(elevationData, routeData.distance_km);
        this.log(`📊 Normalized data: ${elevationData.length} → ${normalizedData.length} points`);
        
        // Get data ranges with smart bounds
        const elevations = normalizedData.map(d => d.elevation_m);
        const distances = normalizedData.map(d => d.distance_km);
        const minElevation = Math.max(0, Math.min(...elevations) - 5);
        const maxElevation = Math.max(...elevations) + 10;
        const maxDistance = routeData.distance_km;  // Use actual route distance
        const elevationRange = maxElevation - minElevation || 1;
        
        // Profile-specific styling
        const profileConfig = this.getProfileConfig(this.currentProfile);
        
        // Draw professional grid
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines with better spacing
        const elevationSteps = 6;
        for (let i = 0; i <= elevationSteps; i++) {
            const y = padding.top + (chartHeight * i / elevationSteps);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();
        }
        
        // Vertical grid lines  
        const distanceSteps = 5;
        for (let i = 0; i <= distanceSteps; i++) {
            const x = padding.left + (chartWidth * i / distanceSteps);
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + chartHeight);
            ctx.stroke();
        }
        
        // Create smooth elevation gradient fill
        const gradientFill = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        gradientFill.addColorStop(0, profileConfig.fillTop);
        gradientFill.addColorStop(1, profileConfig.fillBottom);
        
        // Draw smooth elevation curve with area fill
        ctx.fillStyle = gradientFill;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + chartHeight);
        
        // Create smooth curve using normalized data
        const points = normalizedData.map((point, index) => ({
            x: padding.left + (chartWidth * point.distance_km / maxDistance),
            y: padding.top + chartHeight - ((point.elevation_m - minElevation) / elevationRange) * chartHeight
        }));
        
        // Draw smooth curve
        if (points.length > 2) {
            ctx.lineTo(points[0].x, points[0].y);
            
            for (let i = 1; i < points.length - 1; i++) {
                const cp1x = points[i-1].x + (points[i].x - points[i-1].x) * 0.3;
                const cp1y = points[i-1].y;
                const cp2x = points[i].x - (points[i+1].x - points[i].x) * 0.3;
                const cp2y = points[i].y;
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
            }
            
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        } else {
            points.forEach((point, index) => {
                if (index === 0) ctx.lineTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
        }
        
        ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
        ctx.closePath();
        ctx.fill();
        
        // Draw elevation line with glow effect
        ctx.shadowColor = profileConfig.shadowColor;
        ctx.shadowBlur = 4;
        ctx.strokeStyle = profileConfig.lineColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        
        points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        
        ctx.stroke();
        ctx.shadowBlur = 0;  // Reset shadow
        
        // Draw professional labels
        ctx.fillStyle = '#4a5568';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        
        // Y-axis labels (elevation) - better formatting
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= elevationSteps; i++) {
            const elevation = minElevation + (elevationRange * i / elevationSteps);
            const y = padding.top + chartHeight - (chartHeight * i / elevationSteps);
            const label = elevation >= 1000 ? `${(elevation/1000).toFixed(1)}km` : `${Math.round(elevation)}m`;
            ctx.fillText(label, padding.left - 12, y);
        }
        
        // X-axis labels (distance) - better formatting
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let i = 0; i <= distanceSteps; i++) {
            const distance = (maxDistance * i / distanceSteps);
            const x = padding.left + (chartWidth * i / distanceSteps);
            const label = distance >= 10 ? `${distance.toFixed(0)}km` : `${distance.toFixed(1)}km`;
            ctx.fillText(label, x, padding.top + chartHeight + 15);
        }
        
        // Draw axis titles
        ctx.fillStyle = '#718096';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
        
        // Y-axis title
        ctx.save();
        ctx.translate(15, padding.top + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Elevation', 0, 0);
        ctx.restore();
        
        // X-axis title
        ctx.textAlign = 'center';
        ctx.fillText('Distance', padding.left + chartWidth / 2, height - 15);
        
        // Draw enhanced title with profile icon and stats
        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const title = `${profileConfig.icon} ${routeData.distance_km.toFixed(1)}km ${profileConfig.name} Route`;
        ctx.fillText(title, padding.left, 15);
        
        // Draw comprehensive stats using normalized data
        const elevGain = elevations.reduce((gain, curr, idx) => {
            return idx > 0 && curr > elevations[idx-1] ? gain + (curr - elevations[idx-1]) : gain;
        }, 0);
        const elevLoss = elevations.reduce((loss, curr, idx) => {
            return idx > 0 && curr < elevations[idx-1] ? loss + (elevations[idx-1] - curr) : loss;
        }, 0);
        
        ctx.fillStyle = '#718096';
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'right';
        
        const stats = [
            `⬆ ${elevGain.toFixed(0)}m climb`,
            `⬇ ${elevLoss.toFixed(0)}m descent`, 
            `📐 ${minElevation.toFixed(0)}-${maxElevation.toFixed(0)}m range`
        ].join(' • ');
        
        ctx.fillText(stats, width - padding.right, 15);
        
        // Add difficulty indicator for cycling
        if (this.currentProfile === 'bicycle') {
            const avgGrade = (elevGain / (routeData.distance_km * 1000)) * 100;
            let difficulty = 'Easy';
            let difficultyColor = '#48bb78';
            
            if (avgGrade > 8) { difficulty = 'Very Hard'; difficultyColor = '#e53e3e'; }
            else if (avgGrade > 6) { difficulty = 'Hard'; difficultyColor = '#ed8936'; }
            else if (avgGrade > 4) { difficulty = 'Moderate'; difficultyColor = '#ecc94b'; }
            else if (avgGrade > 2) { difficulty = 'Easy+'; difficultyColor = '#9ae6b4'; }
            
            ctx.fillStyle = difficultyColor;
            ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${difficulty} (${avgGrade.toFixed(1)}% avg)`, width - padding.right, 32);
        }
    }
    
    getProfileConfig(profile) {
        const configs = {
            'bicycle': {
                name: 'Cycling',
                icon: '🚲',
                lineColor: '#3182ce',
                fillTop: 'rgba(49, 130, 206, 0.4)',
                fillBottom: 'rgba(49, 130, 206, 0.1)',
                shadowColor: 'rgba(49, 130, 206, 0.3)'
            },
            'foot': {
                name: 'Walking',
                icon: '🚶',
                lineColor: '#38a169',
                fillTop: 'rgba(56, 161, 105, 0.4)',
                fillBottom: 'rgba(56, 161, 105, 0.1)',
                shadowColor: 'rgba(56, 161, 105, 0.3)'
            },
            'car': {
                name: 'Driving',
                icon: '🚗',
                lineColor: '#e53e3e',
                fillTop: 'rgba(229, 62, 62, 0.4)',
                fillBottom: 'rgba(229, 62, 62, 0.1)',
                shadowColor: 'rgba(229, 62, 62, 0.3)'
            },
            'motorcycle': {
                name: 'Motorcycle',
                icon: '🏍️',
                lineColor: '#dc2626',
                fillTop: 'rgba(220, 38, 38, 0.4)',
                fillBottom: 'rgba(220, 38, 38, 0.1)',
                shadowColor: 'rgba(220, 38, 38, 0.3)'
            }
        };
        
        return configs[profile] || configs['bicycle'];
    }
    
    normalizeElevationData(elevationData, totalRouteDistance) {
        if (!elevationData || elevationData.length < 2) {
            return [];
        }
        
        this.log(`🔧 Normalizing: ${elevationData.length} points for ${totalRouteDistance}km`);
        
        // Ensure distance values are properly distributed across the full route
        const normalizedPoints = elevationData.map((point, index) => ({
            ...point,
            // Recalculate distance to ensure it spans the full route
            distance_km: (index / (elevationData.length - 1)) * totalRouteDistance
        }));
        
        // Apply Geoapify-style optimization
        const optimized = [];
        const minDistanceDiff = Math.max(0.05, totalRouteDistance / 100);  // Adaptive minimum distance (5% of route)
        const minElevationDiff = 3;  // 3m minimum elevation difference
        
        normalizedPoints.forEach((point, index) => {
            const shouldInclude = 
                index === 0 ||  // Always include first point
                index === normalizedPoints.length - 1 ||  // Always include last point
                optimized.length === 0 ||  // Include if no points yet
                (point.distance_km - optimized[optimized.length - 1].distance_km) >= minDistanceDiff ||  // Significant distance change
                Math.abs(point.elevation_m - optimized[optimized.length - 1].elevation_m) >= minElevationDiff;  // Significant elevation change
            
            if (shouldInclude) {
                optimized.push(point);
            }
        });
        
        // Ensure we have a reasonable number of points for smooth visualization
        const targetPoints = Math.max(20, Math.min(100, Math.ceil(totalRouteDistance * 10))); // 10 points per km, capped
        
        if (optimized.length > targetPoints) {
            const step = Math.ceil(optimized.length / targetPoints);
            const finalOptimized = [];
            
            for (let i = 0; i < optimized.length; i += step) {
                finalOptimized.push(optimized[i]);
            }
            
            // Always ensure last point is included
            if (finalOptimized[finalOptimized.length - 1] !== optimized[optimized.length - 1]) {
                finalOptimized.push(optimized[optimized.length - 1]);
            }
            
            this.log(`📉 Further optimized: ${optimized.length} → ${finalOptimized.length} points`);
            return finalOptimized;
        }
        
        this.log(`✅ Optimized: ${elevationData.length} → ${optimized.length} points`);
        return optimized;
    }

    haversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Helper function to calculate if connector lines are needed and draw them
    drawRouteWithConnectors(routePath, clickedStart, clickedEnd, isSelected = true, routeColor = '#3b82f6') {
        if (!routePath || routePath.length < 2) return routePath;
        
        const routeStart = { lat: routePath[0][0], lng: routePath[0][1] };
        const routeEnd = { lat: routePath[routePath.length - 1][0], lng: routePath[routePath.length - 1][1] };
        
        // Check if we need connector lines (distance threshold: 50 meters)
        const startDistance = clickedStart ? this.haversineDistance(
            clickedStart.lat, clickedStart.lng, 
            routeStart.lat, routeStart.lng
        ) * 1000 : 0;
        
        const endDistance = clickedEnd ? this.haversineDistance(
            clickedEnd.lat, clickedEnd.lng, 
            routeEnd.lat, routeEnd.lng  
        ) * 1000 : 0;
        
        const needsStartConnector = startDistance > 50;
        const needsEndConnector = endDistance > 50;
        
        // Draw connector lines if needed
        if (needsStartConnector && clickedStart) {
            this.drawConnectorLine([clickedStart.lat, clickedStart.lng], [routeStart.lat, routeStart.lng], routeColor, 'start');
        }
        
        if (needsEndConnector && clickedEnd) {
            this.drawConnectorLine([clickedEnd.lat, clickedEnd.lng], [routeEnd.lat, routeEnd.lng], routeColor, 'end');
        }
        
        // Create adjusted route path
        let adjustedPath = [...routePath];
        
        // Replace route start/end with clicked coordinates if connector lines were drawn
        if (needsStartConnector && clickedStart) {
            adjustedPath[0] = [clickedStart.lat, clickedStart.lng];
        }
        
        if (needsEndConnector && clickedEnd) {
            adjustedPath[adjustedPath.length - 1] = [clickedEnd.lat, clickedEnd.lng];
        }
        
        return adjustedPath;
    }

    // Draw a dotted connector line
    drawConnectorLine(from, to, color, type) {
        if (!this.connectorLayers) {
            this.connectorLayers = [];
        }
        
        const connectorLine = L.polyline([from, to], {
            color: color,
            weight: 3,
            opacity: 0.7,
            dashArray: '8, 8',
            lineCap: 'round',
            lineJoin: 'round',
            className: 'connector-line'
        }).addTo(this.map);
        
        // Add a subtle popup to explain what this line is
        const popupContent = type === 'start' ? 
            '📍 Connection from clicked point to route start' : 
            '🎯 Connection from route end to clicked point';
            
        connectorLine.bindPopup(popupContent, {
            closeButton: false,
            offset: L.point(0, -10),
            className: 'connector-popup'
        });
        
        // Show popup briefly on mouseover
        connectorLine.on('mouseover', function() {
            this.openPopup();
            setTimeout(() => {
                this.closePopup();
            }, 2500);
        });
        
        // Also show popup on click and make it stay longer
        connectorLine.on('click', function() {
            this.openPopup();
            setTimeout(() => {
                this.closePopup();
            }, 5000);
        });
        
        this.connectorLayers.push(connectorLine);
    }

    // Clear all connector lines
    clearConnectorLines() {
        if (this.connectorLayers) {
            this.connectorLayers.forEach(layer => {
                if (this.map.hasLayer(layer)) {
                    this.map.removeLayer(layer);
                }
            });
            this.connectorLayers = [];
        }
    }

    // Clear distance markers along route
    clearDistanceMarkers() {
        if (this.distanceMarkers) {
            this.distanceMarkers.forEach(marker => {
                this.map.removeLayer(marker);
            });
            this.distanceMarkers = [];
        }
    }

    // Add distance markers along the route at regular intervals
    addDistanceMarkersToRoute(routePath, routeDistance) {
        this.clearDistanceMarkers();
        
        if (!routePath || routePath.length < 2 || routeDistance <= 0) {
            return;
        }
        
        if (!this.distanceMarkers) {
            this.distanceMarkers = [];
        }
        
        // Calculate intervals - aim for markers every 500m for short routes, 1km for longer routes
        let markerIntervalKm = routeDistance <= 2 ? 0.5 : routeDistance <= 10 ? 1 : 2;
        let numMarkers = Math.floor(routeDistance / markerIntervalKm);
        
        // Limit markers to avoid clutter
        if (numMarkers > 10) {
            markerIntervalKm = routeDistance / 10;
            numMarkers = 10;
        }
        
        // Calculate distances along the route path
        let pathDistances = [0];
        let totalPathDistance = 0;
        
        for (let i = 1; i < routePath.length; i++) {
            const segmentDistance = this.haversineDistance(
                routePath[i-1][0], routePath[i-1][1],
                routePath[i][0], routePath[i][1]
            );
            totalPathDistance += segmentDistance;
            pathDistances.push(totalPathDistance);
        }
        
        // Place markers at calculated intervals
        for (let markerIndex = 1; markerIndex <= numMarkers; markerIndex++) {
            const targetDistanceKm = markerIndex * markerIntervalKm;
            
            if (targetDistanceKm >= routeDistance) break;
            
            // Find the position along the path for this distance
            const targetDistance = targetDistanceKm / routeDistance * totalPathDistance;
            
            let segmentIndex = 0;
            for (let i = 1; i < pathDistances.length; i++) {
                if (pathDistances[i] >= targetDistance) {
                    segmentIndex = i - 1;
                    break;
                }
            }
            
            // Interpolate position within the segment
            let markerPosition;
            if (segmentIndex < routePath.length - 1) {
                const segmentStart = pathDistances[segmentIndex];
                const segmentEnd = pathDistances[segmentIndex + 1];
                const segmentLength = segmentEnd - segmentStart;
                
                if (segmentLength > 0) {
                    const t = (targetDistance - segmentStart) / segmentLength;
                    const lat = routePath[segmentIndex][0] + t * (routePath[segmentIndex + 1][0] - routePath[segmentIndex][0]);
                    const lng = routePath[segmentIndex][1] + t * (routePath[segmentIndex + 1][1] - routePath[segmentIndex][1]);
                    markerPosition = [lat, lng];
                } else {
                    markerPosition = routePath[segmentIndex];
                }
            } else {
                markerPosition = routePath[routePath.length - 1];
            }
            
            // Create distance marker
            const distanceMarker = L.marker(markerPosition, {
                icon: this.createDistanceMarker(targetDistanceKm),
                zIndexOffset: 1000
            }).addTo(this.map);
            
            // Add tooltip with additional info
            const formattedDistance = targetDistanceKm < 1 ? 
                `${Math.round(targetDistanceKm * 1000)}m` : 
                `${Math.round(targetDistanceKm * 10) / 10}km`;
            distanceMarker.bindTooltip(
                `📏 ${formattedDistance} from start`, 
                { 
                    permanent: false, 
                    direction: 'top',
                    offset: [0, -10],
                    className: 'distance-marker-tooltip'
                }
            );
            
            this.distanceMarkers.push(distanceMarker);
        }
        
        this.log(`📏 Added ${this.distanceMarkers.length} distance markers`);
    }

    // Create custom distance marker icon
    createDistanceMarker(distanceKm) {
        // Format distance with proper rounding - no excessive decimals
        const distanceText = distanceKm < 1 ? 
            `${Math.round(distanceKm * 1000)}m` : 
            `${Math.round(distanceKm * 10) / 10}km`;  // Round to 1 decimal place
        
        return L.divIcon({
            html: `<div class="distance-marker">
                     <div class="distance-marker-dot"></div>
                     <div class="distance-marker-label">${distanceText}</div>
                   </div>`,
            className: 'distance-marker-container',
            iconSize: [60, 20],
            iconAnchor: [30, 10]
        });
    }

    setupCollapsibleInstructions() {
        const instructionsHeader = document.getElementById('instructionsHeader');
        const instructionsToggle = document.getElementById('instructionsToggle');
        const instructionsCard = document.querySelector('.instructions-card');
        
        if (instructionsHeader && instructionsToggle && instructionsCard) {
            // Add click handler to header
            instructionsHeader.addEventListener('click', () => {
                this.toggleInstructions();
            });
            
            // Add click handler to toggle button (prevent event bubbling)
            instructionsToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleInstructions();
            });
            
            // Restore saved state or default to collapsed
            const savedState = localStorage.getItem('instructionsCollapsed');
            const shouldCollapse = savedState === null ? true : savedState === 'true';
            
            // Set initial collapsed state
            if (shouldCollapse) {
                instructionsCard.classList.add('collapsed');
                
                // Apply inline styles as fallback
                const cardContent = instructionsCard.querySelector('.card-content');
                if (cardContent) {
                    cardContent.style.maxHeight = '0px';
                    cardContent.style.opacity = '0';
                    cardContent.style.overflow = 'hidden';
                    cardContent.style.paddingTop = '0px';
                    cardContent.style.paddingBottom = '0px';
                }
            }
            
            // Set initial aria-expanded state
            instructionsToggle.setAttribute('aria-expanded', !shouldCollapse);
        }
    }
    
    toggleInstructions() {
        const instructionsCard = document.querySelector('.instructions-card');
        const instructionsToggle = document.getElementById('instructionsToggle');
        
        if (instructionsCard && instructionsToggle) {
            instructionsCard.classList.toggle('collapsed');
            
            // Update aria-expanded for accessibility
            const isCollapsed = instructionsCard.classList.contains('collapsed');
            instructionsToggle.setAttribute('aria-expanded', !isCollapsed);
            
            // Apply/remove inline styles to ensure it works
            const cardContent = instructionsCard.querySelector('.card-content');
            if (cardContent) {
                if (isCollapsed) {
                    // Collapse
                    cardContent.style.maxHeight = '0px';
                    cardContent.style.opacity = '0';
                    cardContent.style.overflow = 'hidden';
                    cardContent.style.paddingTop = '0px';
                    cardContent.style.paddingBottom = '0px';
                } else {
                    // Expand
                    cardContent.style.maxHeight = '500px';
                    cardContent.style.opacity = '1';
                    cardContent.style.overflow = 'hidden';
                    cardContent.style.paddingTop = '1.25rem';
                    cardContent.style.paddingBottom = '1.25rem';
                }
            }
            
            // Save state to localStorage
            localStorage.setItem('instructionsCollapsed', isCollapsed);
        }
    }

    // Floating Directions Panel Management
    showFloatingDirections(routeData) {
        this.log('📍 Showing floating directions');
        
        const floatingDirections = document.getElementById('floatingDirections');
        const directionsContent = document.getElementById('directionsContent');
        const summaryDistance = document.getElementById('summaryDistance');
        const summaryTime = document.getElementById('summaryTime');

        if (!floatingDirections || !directionsContent) {
            console.error('❌ Floating directions elements not found');
            return;
        }

        // Update route summary
        if (summaryDistance && summaryTime) {
            summaryDistance.textContent = `${routeData.distance_km?.toFixed(1)}km`;
            summaryTime.textContent = this.formatDuration(routeData.duration_min);
        }

        // Generate enhanced turn-by-turn directions
        const enhancedInstructions = this.generateEnhancedInstructions(routeData);
        
        // Populate directions content
        directionsContent.innerHTML = '';
        
        enhancedInstructions.forEach((instruction, index) => {
            const stepElement = this.createDirectionStep(instruction, index + 1);
            directionsContent.appendChild(stepElement);
        });

        // Show the floating panel with animation
        floatingDirections.classList.add('show');
    }

    hideFloatingDirections() {
        const floatingDirections = document.getElementById('floatingDirections');
        if (floatingDirections) {
            floatingDirections.classList.remove('show');
        }
        
        // Clear any highlighted segments when hiding directions
        this.clearHighlightedSegment();
    }

    // Route segment highlighting functionality
    highlightRouteSegment(segmentCoordinates, instructionIndex) {
        if (!segmentCoordinates || segmentCoordinates.length === 0) {
            console.warn('⚠️ No coordinates provided for segment highlighting');
            return;
        }

        // Clear previous highlight
        this.clearHighlightedSegment();

        // Create highlighted segment layer with vivid styling
        this.currentHighlightedSegment = L.polyline(segmentCoordinates, {
            color: '#ffef44',
            weight: 6,
            opacity: 0.9,
            smoothFactor: 1.0,
            className: 'highlighted-route-segment'
        }).addTo(this.map);

        // Add a pulsing effect
        this.currentHighlightedSegment.setStyle({
            color: '#ff4444',
            weight: 8,
            opacity: 0.8
        });

        // Update visual state of instructions
        this.updateInstructionSelection(instructionIndex);

        // Optional: Fit map bounds to highlighted segment for better visibility
        if (segmentCoordinates.length > 1) {
            const segmentBounds = L.latLngBounds(segmentCoordinates);
            const currentBounds = this.map.getBounds();
            
            // Only fit bounds if segment is not fully visible
            if (!currentBounds.contains(segmentBounds)) {
                this.map.fitBounds(segmentBounds, { 
                    padding: [50, 50],
                    maxZoom: 16,
                    animate: true,
                    duration: 0.8
                });
            }
        }
    }

    clearHighlightedSegment() {
        if (this.currentHighlightedSegment) {
            this.map.removeLayer(this.currentHighlightedSegment);
            this.currentHighlightedSegment = null;
        }
        
        // Clear instruction selection visual state
        this.updateInstructionSelection(-1);
    }

    updateInstructionSelection(selectedIndex) {
        const instructionElements = document.querySelectorAll('.directions-step');
        
        instructionElements.forEach((element, index) => {
            element.classList.remove('selected');
            if (index === selectedIndex) {
                element.classList.add('selected');
            }
        });
        
        this.selectedInstructionIndex = selectedIndex;
    }

    // Generate enhanced turn-by-turn instructions with better street names and turn types
    generateEnhancedInstructions(routeData) {
        const instructions = [];
        
        // Use existing instructions if available, otherwise generate basic ones
        if (routeData.instructions && routeData.instructions.length > 0) {
            routeData.instructions.forEach((instruction, index) => {
                const enhanced = this.enhanceInstruction(instruction, index, routeData);
                instructions.push(enhanced);
            });
        } else {
            // Generate basic instructions from route path
            instructions.push(...this.generateBasicInstructions(routeData));
        }
        
        return instructions;
    }

    // Enhance existing instruction with better formatting and turn detection
    enhanceInstruction(instruction, index, routeData) {
        let turnType = this.detectTurnType(instruction.instruction);
        
        // ✅ FIX: Backend uses "name" field for road names (not "street_name")
        // Also normalize field names: distance (meters) → distance_m, duration (seconds) → duration_s
        let streetName = instruction.name || instruction.street_name || this.extractStreetName(instruction.instruction);
        
        this.log(`🛣️ Instruction ${index + 1}: ${streetName || 'no street name'}`);
        
        // ✅ NEW: Inject street name into instruction if backend provided it but instruction text doesn't include it
        let enhancedText = this.injectStreetNameIntoInstruction(instruction.instruction, streetName, turnType);
        
        // Convert geometry coordinates to segment_coordinates for highlighting
        let segmentCoordinates = [];
        if (instruction.geometry && instruction.geometry.coordinates) {
            if (instruction.geometry.type === "LineString") {
                // Convert [lon, lat] to [lat, lng] for Leaflet
                segmentCoordinates = instruction.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            }
        }
        
        return {
            instruction: enhancedText,
            distance_m: instruction.distance || instruction.distance_m || 0,  // Backend uses "distance" in meters
            duration_s: instruction.duration || instruction.duration_s || 0,  // Backend uses "duration" in seconds
            turn_type: turnType,
            street_name: streetName,  // ✅ Now correctly reads "name" from backend
            location: instruction.maneuver?.location || instruction.location || null,
            segment_coordinates: segmentCoordinates || instruction.segment_coordinates || []  // ✅ Convert geometry to segment coordinates
        };
    }

    // Generate enhanced instructions when backend provides basic ones
    generateBasicInstructions(routeData) {
        const instructions = [];
        const totalDistance = routeData.distance_km || 0;
        const totalDuration = routeData.duration_min || 0;
        
        // Generate smarter instructions based on route path if available
        if (routeData.path && routeData.path.length > 2) {
            const pathInstructions = this.generatePathBasedInstructions(
                routeData.path, 
                totalDistance, 
                totalDuration,
                this.currentProfile
            );
            if (pathInstructions.length > 0) {
                return pathInstructions;
            }
        }
        
        // Fallback to basic instructions with better highway classification
        const roadType = this.guessRoadTypeFromDistance(totalDistance, this.currentProfile);
        
        // Start instruction
        instructions.push({
            instruction: `Head north on ${roadType}`,
            distance_m: Math.round(totalDistance * 1000 * 0.6),
            duration_s: Math.round(totalDuration * 60 * 0.6),
            turn_type: "straight",
            street_name: roadType,
            location: null
        });
        
        // Middle instruction for longer routes
        if (totalDistance > 2) {
            const roadType2 = totalDistance > 5 ? "Major Highway" : "Primary Road";
            instructions.push({
                instruction: `Continue on ${roadType2}`,
                distance_m: Math.round(totalDistance * 1000 * 0.4),
                duration_s: Math.round(totalDuration * 60 * 0.4),
                turn_type: "continue",
                street_name: roadType2,
                location: null
            });
        }
        
        // Arrival instruction
        instructions.push({
            instruction: "Arrive at your destination",
            distance_m: 0,
            duration_s: 0,
            turn_type: "arrive",
            street_name: "destination",
            location: null
        });
        
        return instructions;
    }

    // Generate path-based instructions analyzing route geometry
    generatePathBasedInstructions(path, totalDistance, totalDuration, profile) {
        const instructions = [];
        
        try {
            // Analyze path for significant direction changes
            const segments = this.analyzeRouteSegments(path, totalDistance);
            
            segments.forEach((segment, index) => {
                const roadType = this.guessRoadTypeFromDistance(segment.distance_m / 1000, profile);
                
                let instruction_text;
                if (index === 0) {
                    instruction_text = `Head north on ${roadType}`;
                } else {
                    const turnDirection = this.detectTurnFromBearing(segment.bearing_change);
                    instruction_text = `${turnDirection} onto ${roadType}`;
                }
                
                instructions.push({
                    instruction: instruction_text,
                    distance_m: segment.distance_m,
                    duration_s: segment.duration_s,
                    turn_type: this.mapTurnDirectionToType(segment.bearing_change || 0),
                    street_name: roadType,
                    location: segment.start_point
                });
            });
            
            return instructions;
            
        } catch (error) {
            console.log("Path analysis failed, using fallback:", error);
            return []; // Return empty to use basic fallback
        }
    }

    // Analyze route path to identify meaningful segments
    analyzeRouteSegments(path, totalDistanceKm) {
        const segments = [];
        
        if (path.length < 3) {
            return [{
                start_point: path[0],
                distance_m: totalDistanceKm * 1000,
                duration_s: totalDistanceKm * 60 / 30, // ~30 km/h average
                bearing_change: 0
            }];
        }
        
        let currentSegmentStart = 0;
        
        for (let i = 2; i < path.length; i++) {
            const bearing1 = this.calculateBearing(path[i-2], path[i-1]);
            const bearing2 = this.calculateBearing(path[i-1], path[i]);
            const bearingChange = this.normalizeBearingDiff(bearing2 - bearing1);
            
            // Significant turn detected (> 30 degrees) or last point
            if (Math.abs(bearingChange) > 30 || i === path.length - 1) {
                const segmentPath = path.slice(currentSegmentStart, i);
                const distance = this.calculatePathDistance(segmentPath);
                
                segments.push({
                    start_point: path[currentSegmentStart],
                    distance_m: distance,
                    duration_s: Math.round(distance / 1000 * 60 / 25), // ~25 km/h avg
                    bearing_change: bearingChange
                });
                
                currentSegmentStart = i - 1;
            }
        }
        
        return segments;
    }

    // Calculate bearing between two points
    calculateBearing(point1, point2) {
        const lat1 = point1[0] * Math.PI / 180;
        const lat2 = point2[0] * Math.PI / 180;
        const deltaLng = (point2[1] - point1[1]) * Math.PI / 180;
        
        const y = Math.sin(deltaLng) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
        
        return Math.atan2(y, x) * 180 / Math.PI;
    }

    // Normalize bearing difference to [-180, 180]
    normalizeBearingDiff(diff) {
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        return diff;
    }

    // Calculate total distance of a path segment
    calculatePathDistance(segmentPath) {
        let totalDistance = 0;
        for (let i = 1; i < segmentPath.length; i++) {
            totalDistance += this.haversineDistance(
                segmentPath[i-1][0], segmentPath[i-1][1],
                segmentPath[i][0], segmentPath[i][1]
            ) * 1000; // Convert to meters
        }
        return totalDistance;
    }

    // Detect turn direction from bearing change
    detectTurnFromBearing(bearingChange) {
        if (!bearingChange) return "Continue straight";
        
        if (bearingChange > 90) return "Turn right";
        else if (bearingChange < -90) return "Turn left";
        else if (bearingChange > 30) return "Keep right";
        else if (bearingChange < -30) return "Keep left";
        else return "Continue straight";
    }

    // Map turn direction to turn type for icons
    mapTurnDirectionToType(bearingChange) {
        if (!bearingChange) return "straight";
        
        if (bearingChange > 90) return "right";
        else if (bearingChange < -90) return "left";
        else if (Math.abs(bearingChange) > 30) return bearingChange > 0 ? "right" : "left";
        else return "straight";
    }

    // Guess road type from segment distance and profile
    guessRoadTypeFromDistance(distanceKm, profile) {
        if (profile === 'bicycle') {
            if (distanceKm > 3) return "Cycle Path";
            else if (distanceKm > 1) return "Park Connector";
            else return "Cycling Route";
        } else if (profile === 'foot') {
            if (distanceKm > 2) return "Walking Path";
            else if (distanceKm > 0.5) return "Pedestrian Way";
            else return "Walkway";
        } else {
            if (distanceKm > 5) return "Major Highway";
            else if (distanceKm > 2) return "Primary Road";
            else if (distanceKm > 0.8) return "Secondary Road";
            else return "Local Road";
        }
    }

    // Detect turn type from instruction text
    detectTurnType(instructionText) {
        const lowerText = instructionText.toLowerCase();
        
        if (lowerText.includes('turn left') || lowerText.includes('left onto')) {
            return 'left';
        } else if (lowerText.includes('turn right') || lowerText.includes('right onto')) {
            return 'right';
        } else if (lowerText.includes('u-turn') || lowerText.includes('u turn')) {
            return 'u-turn';
        } else if (lowerText.includes('continue') || lowerText.includes('keep')) {
            return 'continue';
        } else if (lowerText.includes('arrive') || lowerText.includes('destination')) {
            return 'arrive';
        } else {
            return 'straight';
        }
    }

    // Extract street name from instruction text
    extractStreetName(instructionText) {
        // Look for street name patterns
        const streetPatterns = [
            /onto ([A-Za-z\s]+(?:Road|Street|Avenue|Drive|Lane|Way|Boulevard|Place))/i,
            /on ([A-Za-z\s]+(?:Road|Street|Avenue|Drive|Lane|Way|Boulevard|Place))/i,
            /along ([A-Za-z\s]+(?:Road|Street|Avenue|Drive|Lane|Way|Boulevard|Place))/i,
            /onto ([A-Za-z\s]+)/i
        ];
        
        for (const pattern of streetPatterns) {
            const match = instructionText.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        return null;
    }

    // ✅ NEW: Inject actual street name from backend into instruction text
    injectStreetNameIntoInstruction(instructionText, streetName, turnType) {
        if (!instructionText) return instructionText;
        
        // If no street name from backend, return original
        if (!streetName || streetName === '') {
            return instructionText;
        }
        
        // Clean up street name - remove common suffixes if they're generic
        const cleanStreetName = this.cleanStreetName(streetName);
        
        // If instruction already mentions the street name, just highlight it
        const lowerInstruction = instructionText.toLowerCase();
        const lowerStreetName = cleanStreetName.toLowerCase();
        
        if (lowerInstruction.includes(lowerStreetName)) {
            // Street name already in text, make it bold
            const regex = new RegExp(`(${cleanStreetName})`, 'gi');
            return instructionText.replace(regex, '<strong>$1</strong>');
        }
        
        // ✅ Street name NOT in instruction - inject it based on turn type
        const injectedText = this.buildInstructionWithStreetName(instructionText, cleanStreetName, turnType);
        return injectedText;
    }
    
    // Clean up street name for better display
    cleanStreetName(streetName) {
        if (!streetName) return '';
        
        // Remove "the " prefix
        let cleaned = streetName.replace(/^the\s+/i, '');
        
        // If it's just generic "route" or "road", return empty (use fallback)
        if (/^(route|road|way|path)$/i.test(cleaned.trim())) {
            return '';
        }
        
        return cleaned;
    }
    
    // Build instruction text with actual street name from backend
    buildInstructionWithStreetName(originalText, streetName, turnType) {
        if (!streetName) return originalText;
        
        const lowerText = originalText.toLowerCase();
        
        // Pattern 1: "Turn left" → "Turn left onto [Street Name]"
        if (lowerText.includes('turn left') && !lowerText.includes(' onto ')) {
            return originalText.replace(/turn left/i, `Turn left onto <strong>${streetName}</strong>`);
        }
        
        // Pattern 2: "Turn right" → "Turn right onto [Street Name]"
        if (lowerText.includes('turn right') && !lowerText.includes(' onto ')) {
            return originalText.replace(/turn right/i, `Turn right onto <strong>${streetName}</strong>`);
        }
        
        // Pattern 3: "Keep left" → "Keep left on [Street Name]"
        if (lowerText.includes('keep left') && !lowerText.includes(' on ')) {
            return originalText.replace(/keep left/i, `Keep left on <strong>${streetName}</strong>`);
        }
        
        // Pattern 4: "Keep right" → "Keep right on [Street Name]"
        if (lowerText.includes('keep right') && !lowerText.includes(' on ')) {
            return originalText.replace(/keep right/i, `Keep right on <strong>${streetName}</strong>`);
        }
        
        // Pattern 5: "Continue" → "Continue on [Street Name]"
        if (lowerText.includes('continue') && !lowerText.includes(' on ')) {
            return originalText.replace(/continue/i, `Continue on <strong>${streetName}</strong>`);
        }
        
        // Pattern 6: "Head" (start instruction) → "Head north on [Street Name]"
        if (lowerText.includes('head ') && !lowerText.includes(' on ')) {
            return originalText.replace(/head\s+(\w+)/i, `Head $1 on <strong>${streetName}</strong>`);
        }
        
        // Pattern 7: Generic instruction - append street name at the end
        return `${originalText} <span style="color: #6b7280;">on <strong>${streetName}</strong></span>`;
    }
    
    // Format instruction text for better readability (LEGACY - kept for compatibility)
    formatInstructionText(originalText, streetName) {
        if (streetName) {
            // If we have a street name, make it more prominent
            const formatted = originalText.replace(streetName, `<strong>${streetName}</strong>`);
            return formatted;
        }
        
        return originalText;
    }

    // Create a direction step HTML element with click handler for segment highlighting
    createDirectionStep(instruction, stepNumber) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'directions-step';
        
        const distanceText = instruction.distance_m > 0 ? 
            (instruction.distance_m >= 1000 ? 
                `${(instruction.distance_m / 1000).toFixed(1)}km` : 
                `${Math.round(instruction.distance_m)}m`
            ) : '';
        
        // Display street name if available and meaningful
        const hasStreetName = instruction.street_name && 
                              instruction.street_name !== '' && 
                              instruction.street_name !== 'route' && 
                              instruction.street_name !== 'destination' &&
                              instruction.street_name !== 'the road';
            
        stepDiv.innerHTML = `
            <div class="step-number">${stepNumber}</div>
            <div class="step-icon">
                <div class="turn-icon ${instruction.turn_type}"></div>
            </div>
            <div class="step-content">
                <div class="step-instruction">${instruction.instruction}</div>
                <div class="step-details">
                    ${distanceText ? `<span class="step-distance">${distanceText}</span>` : ''}
                    ${hasStreetName ? 
                        `<span style="color: #6b7280; font-weight: 500;">• ${instruction.street_name}</span>` : ''}
                    <span class="segment-hint" style="color: #9ca3af; font-size: 11px; margin-left: 8px;">click to highlight</span>
                </div>
            </div>
        `;
        
        // Add click handler for segment highlighting
        stepDiv.addEventListener('click', () => {
            // Check if instruction has segment coordinates
            if (instruction.segment_coordinates && instruction.segment_coordinates.length > 0) {
                this.highlightRouteSegment(instruction.segment_coordinates, stepNumber - 1);
                
                // Visual feedback
                stepDiv.style.backgroundColor = '#fef3f3';
                setTimeout(() => {
                    stepDiv.style.backgroundColor = '';
                }, 200);
            } else {
                this.log('⚠️ No segment coordinates for:', instruction.instruction);
                
                // Show user feedback
                const hint = stepDiv.querySelector('.segment-hint');
                if (hint) {
                    hint.textContent = 'no segment data';
                    hint.style.color = '#f87171';
                    setTimeout(() => {
                        hint.textContent = 'click to highlight';
                        hint.style.color = '#9ca3af';
                    }, 2000);
                }
            }
        });
        
        // Add hover effect
        stepDiv.addEventListener('mouseenter', () => {
            if (instruction.segment_coordinates && instruction.segment_coordinates.length > 0) {
                stepDiv.style.cursor = 'pointer';
                stepDiv.style.backgroundColor = '#f9fafb';
            }
        });
        
        stepDiv.addEventListener('mouseleave', () => {
            if (this.selectedInstructionIndex !== stepNumber - 1) {
                stepDiv.style.backgroundColor = '';
            }
        });
        
        return stepDiv;
    }

    getProfileColor(profile) {
        const colors = {
            car: '#00008B',          // Dark blue
            bicycle: '#10b981',      // Green
            foot: '#f59e0b',         // Orange
            motorcycle: '#A544EF'    // Violet
        };
        return colors[profile] || '#64748b';
    }

    /**
     * Get lighter variation of primary color for alternative routes
     */
    getAlternativeColor(index, profile) {
        const baseColor = this.getProfileColor(profile || this.currentProfile);
        
        // Generate lighter variations of the primary color
        // Convert hex to RGB, lighten, then convert back
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Lighten by adding to each channel (0.3, 0.5, 0.7 for different alternatives)
        const lightenFactors = [0.4, 0.6, 0.8];
        const factor = lightenFactors[index % lightenFactors.length];
        
        const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
        const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
        const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }

    /**
     * Calculate optimized route using TSP + QuantaRoute for multi-point routing
     * Endpoint: /v1/routing/optimized
     */
    async calculateOptimizedRoute() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }

        const startPos = this.startMarker.getLatLng();
        const endPos = this.endMarker.getLatLng();
        const validWaypoints = this.waypoints.filter(wp => wp !== null);

        try {
            // IMPORTANT: Include start and end IN the waypoints array
            // This ensures we get ALL segment routes (start→wp1, wp1→wp2, wp2→end)
            const allWaypoints = [
                [startPos.lat, startPos.lng],  // Include start
                ...validWaypoints.map(wp => [wp.lat, wp.lng]),  // Intermediate waypoints
                [endPos.lat, endPos.lng]  // Include end
            ];
            
            const routeData = {
                start: [startPos.lat, startPos.lng],
                end: [endPos.lat, endPos.lng],
                waypoints: allWaypoints,  // Send ALL points including start and end
                profile: this.currentProfile
            };

            console.log('📤 Sending request to /routing/optimized with data:', routeData);
            console.log('🔍 OPTIMIZED REQUEST SUMMARY:');
            console.log('   Endpoint:', `${this.apiBaseUrl}/routing/optimized`);
            console.log('   Start:', routeData.start);
            validWaypoints.forEach((wp, idx) => {
                console.log(`   Waypoint ${idx + 1}:`, [wp.lat, wp.lng]);
            });
            console.log('   End:', routeData.end);
            console.log('   Profile:', this.currentProfile);
            console.log('   Total waypoints sent (including start/end):', allWaypoints.length);
            console.log('   Expected trip segments:', allWaypoints.length - 1);

            const response = await this.apiCall('routing/optimized', {
                method: 'POST',
                body: JSON.stringify(routeData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Optimized routing API error:', errorText);
                
                if (response.status === 404) {
                    let errorData;
                    try {
                        errorData = JSON.parse(errorText);
                    } catch {
                        errorData = { detail: errorText };
                    }
                    
                    this.showStatusMessage(
                        `${errorData.detail || 'No optimized route found through waypoints.'}`, 
                        'error'
                    );
                    return;
                }
                
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📥 API Response from /routing/optimized:', result);
            
            // Analyze response
            console.log('🔍 OPTIMIZED RESPONSE ANALYSIS:');
            if (result.route || result.trips) {
                console.log('   ✅ Optimized route received');
                console.log('   Algorithm:', result.algorithm || 'TSP + QuantaRoute');
                console.log('   Compute time:', result.compute_time_ms?.toFixed(0), 'ms');
                console.log('   Waypoints visited:', result.waypoints?.length || 0);
                
                // Check if we have multiple trip segments (one per waypoint segment)
                if (result.trips && result.trips.length > 0) {
                    console.log('   📦 Trip segments found:', result.trips.length);
                    
                    // We might have multiple trips - need to stitch them together
                    // OR trips might be an array with a single combined trip
                    // Let's check the structure
                    
                    let allPaths = [];
                    let allInstructions = [];
                    let totalDistance = 0;
                    let totalDuration = 0;
                    
                    // Process each trip segment
                    result.trips.forEach((trip, idx) => {
                        console.log(`   🔄 Processing trip segment ${idx + 1}/${result.trips.length}`);
                        
                        // Extract geometry for this segment
                        let geometry;
                        if (trip.geometry) {
                            if (trip.geometry.geometry) {
                                geometry = trip.geometry.geometry;
                            } else {
                                geometry = trip.geometry;
                            }
                        }
                        
                        console.log(`      Geometry type: ${geometry?.type || 'unknown'}`);
                        console.log(`      Raw coordinates count: ${geometry?.coordinates?.length || 0}`);
                        if (geometry?.coordinates?.length > 0) {
                            console.log(`      First raw coord: [${geometry.coordinates[0]}]`);
                            console.log(`      Last raw coord: [${geometry.coordinates[geometry.coordinates.length - 1]}]`);
                        }
                        
                        // Extract path for this segment
                        const segmentPath = this.extractPathFromGeometry(geometry);
                        console.log(`      ✅ Extracted path points: ${segmentPath?.length || 0}`);
                        
                        if (segmentPath && segmentPath.length > 0) {
                            console.log(`      First converted point: [${segmentPath[0]}]`);
                            console.log(`      Last converted point: [${segmentPath[segmentPath.length - 1]}]`);
                            
                            // Avoid duplicating connection points between segments
                            if (allPaths.length > 0 && idx > 0) {
                                // Skip first point of subsequent segments (it's the same as last point of previous)
                                const pointsAdded = segmentPath.length - 1;
                                allPaths.push(...segmentPath.slice(1));
                                console.log(`      📌 Added ${pointsAdded} points (skipped duplicate connection point)`);
                            } else {
                                allPaths.push(...segmentPath);
                                console.log(`      📌 Added all ${segmentPath.length} points (first segment)`);
                            }
                            console.log(`      📍 Running total: ${allPaths.length} points`);
                        } else {
                            console.error(`      ❌ ERROR: No path extracted for segment ${idx + 1}!`);
                        }
                        
                        // Extract instructions from this trip segment
                        // Instructions can be in trip.legs[0].steps or trip.instructions
                        let segmentInstructions = [];
                        if (trip.legs && trip.legs.length > 0 && trip.legs[0].steps) {
                            segmentInstructions = trip.legs[0].steps;
                            console.log(`      📋 Found ${segmentInstructions.length} instructions from legs[0].steps`);
                        } else if (trip.instructions && trip.instructions.length > 0) {
                            segmentInstructions = trip.instructions;
                            console.log(`      📋 Found ${segmentInstructions.length} instructions from trip.instructions`);
                        } else {
                            console.log(`      ⚠️ No instructions found for segment ${idx + 1}`);
                        }
                        
                        // Add segment marker instruction if this is not the first segment
                        if (idx > 0 && segmentInstructions.length > 0) {
                            // Add a waypoint arrival instruction
                            allInstructions.push({
                                instruction: `🎯 Waypoint ${idx} reached - Continue to next stop`,
                                distance: 0,
                                duration: 0,
                                name: `Waypoint ${idx}`,
                                maneuver: { type: 'waypoint' }
                            });
                        }
                        
                        // Add all instructions from this segment
                        allInstructions.push(...segmentInstructions);
                        console.log(`      ✅ Total instructions so far: ${allInstructions.length}`);
                        
                        totalDistance += trip.distance || 0;
                        totalDuration += trip.duration || 0;
                    });
                    
                    console.log('   📍 Total stitched path points:', allPaths.length);
                    console.log('   📋 Total stitched instructions:', allInstructions.length);
                    console.log('   📏 Total distance:', (totalDistance / 1000).toFixed(2), 'km');
                    console.log('   ⏱️ Total duration:', (totalDuration / 60).toFixed(1), 'min');
                    
                    result.path = allPaths;
                    result.instructions = allInstructions;
                    result.distance_km = totalDistance / 1000;
                    result.duration_min = totalDuration / 60;
                    
                } else {
                    // Fallback to route data
                    console.log('   Using route data (no trips)');
                    result.path = this.extractPathFromGeometry(result.route?.geometry);
                    result.distance_km = result.route?.distance / 1000 || 0;
                    result.duration_min = result.route?.duration / 60 || 0;
                }
                
                console.log('   📍 Final path points:', result.path?.length || 0);
                console.log('   📍 First point:', result.path?.[0]);
                console.log('   📍 Last point:', result.path?.[result.path.length - 1]);
                
                if (result.path?.length < 10) {
                    console.warn('   ⚠️ WARNING: Very few path points - might be straight line!');
                }
                
                result.algorithm = result.algorithm || 'TSP + QuantaRoute';
                result.compute_time_ms = result.compute_time_ms || 0;
                result.elevation_profile = [];
                result.elevation_stats = null;
                // Note: instructions are now properly extracted from trip segments above
                if (!result.instructions) {
                    result.instructions = [];
                }
                
                this.displaySingleRoute(result);
                this.showStatusMessage(
                    `✅ Optimized route through ${validWaypoints.length} waypoint${validWaypoints.length > 1 ? 's' : ''} - ${result.distance_km.toFixed(1)}km in ${result.duration_min.toFixed(0)} min!`, 
                    'success'
                );
            } else {
                console.error('   ❌ No route found in optimized response');
                this.showStatusMessage('No optimized route found through waypoints', 'error');
            }
            
        } catch (error) {
            console.error('Optimized routing error:', error);
            this.showStatusMessage(`Optimized routing failed: ${error.message}`, 'error');
        } finally {
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        }
    }

    // Override the existing calculateRoute method to support profiles
    async calculateRoute() {
        if (!this.startMarker || !this.endMarker) {
            this.showStatusMessage('Please set both start and destination points', 'error');
            return;
        }
        
        // Check if we have waypoints - use optimized routing endpoint (requires 2+ waypoints)
        const validWaypoints = this.waypoints.filter(wp => wp !== null);
        if (validWaypoints.length >= 2) {
            console.log('🔄 Optimized routing activated:', validWaypoints.length, 'waypoints');
            this.showStatusMessage(
                `🎯 Calculating optimized route through ${validWaypoints.length} waypoints (TSP optimization)...`, 
                'info'
            );
            return await this.calculateOptimizedRoute();
        } else if (validWaypoints.length === 1) {
            console.log('⚠️ Single waypoint detected - using regular routing with waypoint');
            this.showStatusMessage(
                `🎯 Calculating route through 1 waypoint...`, 
                'info'
            );
            // Fall through to regular routing which supports single waypoint
        }
        
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }

        // Define positions outside try block so they're available in catch
        const startPos = this.startMarker.getLatLng();
        const endPos = this.endMarker.getLatLng();

        try {
            // Check if alternative routes are requested
            const alternativesToggle = document.getElementById('alternativesToggle');
            const wantAlternatives = alternativesToggle ? alternativesToggle.checked : true;

            if (wantAlternatives) {
                // Get selected algorithm from dropdown
                const algorithmDropdown = document.getElementById('algorithmDropdown');
                const selectedAlgorithm = algorithmDropdown ? algorithmDropdown.value : 'quantaroute';
                
                this.log(`📊 Using algorithm: ${selectedAlgorithm}`);
                
                // Use the enhanced alternative routes API
                const routeData = {
                    start: [startPos.lat, startPos.lng],
                    end: [endPos.lat, endPos.lng],
                    profile: this.currentProfile,
                    method: selectedAlgorithm,  // Use user-selected algorithm
                    num_alternatives: 3,
                    diversity_preference: 0.7
                };

                // Add waypoints if any
                console.log('🔍 DEBUG: Waypoints array before processing:', this.waypoints);
                console.log('🔍 DEBUG: Waypoints array length:', this.waypoints.length);
                
                if (this.waypoints.length > 0) {
                    const filteredWaypoints = this.waypoints.filter(wp => wp !== null);
                    console.log('🔍 DEBUG: Filtered waypoints (non-null):', filteredWaypoints);
                    
                    routeData.waypoints = filteredWaypoints.map(wp => [wp.lat, wp.lng]);
                    console.log('✅ Added waypoints to route calculation:', routeData.waypoints);
                    
                    this.log(`📍 Added ${routeData.waypoints.length} waypoints to route calculation`);
                    this.showStatusMessage(
                        `🎯 Calculating route with ${routeData.waypoints.length} waypoint${routeData.waypoints.length > 1 ? 's' : ''}...`, 
                        'info'
                    );
                }

                console.log('📤 Sending request to /routing/alternatives with data:', routeData);
                console.log('🔍 REQUEST SUMMARY:');
                console.log('   Endpoint:', `${this.apiBaseUrl}/routing/alternatives`);
                console.log('   Start:', routeData.start);
                console.log('   End:', routeData.end);
                console.log('   Waypoints:', routeData.waypoints || 'none');
                console.log('   Profile:', routeData.profile);
                console.log('   Method:', routeData.method);
                
                this.log('🛣️ Calculating alternative routes');
                
                const response = await this.apiCall('routing/alternatives', {
                    method: 'POST',
                    body: JSON.stringify(routeData)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Alternative routes API error:', errorText);
                    
                    // Handle no route found errors specially
                    if (response.status === 404) {
                        let errorData;
                        try {
                            errorData = JSON.parse(errorText);
                        } catch {
                            errorData = { detail: errorText };
                        }
                        
                        this.showStatusMessage(
                            `${errorData.detail || 'No route found for this transport mode.'}`, 
                            'error'
                        );
                        return; // Don't throw, just show the message and return
                    }
                    
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('📥 API Response from /routing/alternatives:', result);
                
                // Analyze response for waypoint processing
                console.log('🔍 RESPONSE ANALYSIS:');
                const optimalRoute = result.optimal_route || result.route;
                if (optimalRoute) {
                    const pathLength = optimalRoute.geometry?.coordinates?.length || optimalRoute.path?.length || 0;
                    console.log('   Route path points:', pathLength);
                    console.log('   Distance:', optimalRoute.distance || optimalRoute.distance_km, 'km');
                    console.log('   Duration:', optimalRoute.duration || optimalRoute.duration_min, 'min');
                    
                    // Check if waypoints are mentioned in instructions
                    const instructions = optimalRoute.instructions || [];
                    const waypointInstructions = instructions.filter(i => 
                        i.instruction?.toLowerCase().includes('waypoint') || 
                        i.instruction?.toLowerCase().includes('via')
                    );
                    console.log('   Instructions:', instructions.length, 'steps');
                    console.log('   Waypoint-related instructions:', waypointInstructions.length);
                    
                    if (waypointInstructions.length > 0) {
                        console.log('   ✅ Backend processed waypoints! Found waypoint instructions:');
                        waypointInstructions.forEach(i => console.log('      -', i.instruction));
                    } else if (routeData.waypoints && routeData.waypoints.length > 0) {
                        console.warn('   ⚠️ Waypoints were sent but not reflected in instructions');
                        console.warn('   ⚠️ Backend may not support waypoints on this endpoint');
                    }
                } else {
                    console.error('   ❌ No route found in response');
                }
                
                this.log('✅ Alternative routes calculated');
                this.displayAlternativeRoutesResponse(result);
                
            } else {
                // Use the regular single route API
                const routeData = {
                    start: [startPos.lat, startPos.lng],
                    end: [endPos.lat, endPos.lng],
                    profile: this.currentProfile,
                    algorithm: 'quantaroute',
                    alternatives: false
                };

                // Add waypoints if any
                console.log('🔍 DEBUG: Waypoints array before processing:', this.waypoints);
                console.log('🔍 DEBUG: Waypoints array length:', this.waypoints.length);
                
                if (this.waypoints.length > 0) {
                    const filteredWaypoints = this.waypoints.filter(wp => wp !== null);
                    console.log('🔍 DEBUG: Filtered waypoints (non-null):', filteredWaypoints);
                    
                    routeData.waypoints = filteredWaypoints.map(wp => [wp.lat, wp.lng]);
                    console.log('✅ Added waypoints to single route calculation:', routeData.waypoints);
                    
                    this.log(`📍 Added ${routeData.waypoints.length} waypoints to single route calculation`);
                    this.showStatusMessage(
                        `🎯 Calculating route with ${routeData.waypoints.length} waypoint${routeData.waypoints.length > 1 ? 's' : ''}...`, 
                        'info'
                    );
                }

                console.log('📤 Sending request to /routing with data:', routeData);
                console.log('🔍 REQUEST SUMMARY:');
                console.log('   Endpoint:', `${this.apiBaseUrl}/routing`);
                console.log('   Start:', routeData.start);
                console.log('   End:', routeData.end);
                console.log('   Waypoints:', routeData.waypoints || 'none');
                console.log('   Profile:', routeData.profile);
                console.log('   Algorithm:', routeData.algorithm);
                
                this.log('🚀 Calculating single route');

                const response = await this.apiCall('routing', {
                    method: 'POST',
                    body: JSON.stringify(routeData)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Single route API error:', errorText);
                    
                    // Handle no route found errors specially
                    if (response.status === 404) {
                        let errorData;
                        try {
                            errorData = JSON.parse(errorText);
                        } catch {
                            errorData = { detail: errorText };
                        }
                        
                        this.showStatusMessage(
                            `${errorData.detail || 'No route found for this transport mode.'}`, 
                            'error'
                        );
                        return; // Don't throw, just show the message and return
                    }
                    
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('📥 API Response from /routing:', result);
                
                // Analyze response for waypoint processing
                console.log('🔍 RESPONSE ANALYSIS:');
                const route = result.route || result;
                if (route) {
                    const pathLength = route.geometry?.coordinates?.length || route.path?.length || 0;
                    console.log('   Route path points:', pathLength);
                    console.log('   Distance:', route.distance || route.distance_km, 'km');
                    console.log('   Duration:', route.duration || route.duration_min, 'min');
                    
                    // Check if waypoints are mentioned in instructions
                    const instructions = route.instructions || [];
                    const waypointInstructions = instructions.filter(i => 
                        i.instruction?.toLowerCase().includes('waypoint') || 
                        i.instruction?.toLowerCase().includes('via')
                    );
                    console.log('   Instructions:', instructions.length, 'steps');
                    console.log('   Waypoint-related instructions:', waypointInstructions.length);
                    
                    if (waypointInstructions.length > 0) {
                        console.log('   ✅ Backend processed waypoints! Found waypoint instructions:');
                        waypointInstructions.forEach(i => console.log('      -', i.instruction));
                    } else if (routeData.waypoints && routeData.waypoints.length > 0) {
                        console.warn('   ⚠️ Waypoints were sent but not reflected in instructions');
                        console.warn('   ⚠️ Backend may not support waypoints on this endpoint');
                        console.warn('   💡 Try enabling "Show Alternative Routes" for waypoint support');
                    }
                } else {
                    console.error('   ❌ No route found in response');
                }
                
                // Convert GeoJSON geometry to [lat, lng] path for single routes
                if (result.route && result.route.geometry) {
                    result.path = this.extractPathFromGeometry(result.route.geometry);
                    result.distance_km = result.route.distance / 1000;  // Convert meters to km
                    result.duration_min = result.route.duration / 60;  // Convert seconds to minutes
                    // ✅ CRITICAL: Copy elevation data from route to top level for display
                    result.elevation_profile = result.route.elevation_profile || [];
                    result.elevation_stats = result.route.elevation_stats || null;
                    result.instructions = result.route.instructions || [];
                }
                
                this.displayEnhancedRoute(result);
            }
            
        } catch (error) {
            console.error('Route calculation error:', error);
            this.showStatusMessage(`Route calculation failed: ${error.message}`, 'error');
            
            // Add fallback simulation to show route stats  
            try {
                const simulatedRoute = this.simulateRouteData(startPos, endPos);
                this.displayEnhancedRoute(simulatedRoute);
            } catch (simError) {
                console.error('Simulation fallback also failed:', simError);
                this.showStatusMessage('Unable to calculate route or fallback simulation', 'error');
            }
        } finally {
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        }
    }

    /**
     * Extract and convert GeoJSON geometry to Leaflet [lat, lng] path format
     * Handles both GeoJSON Feature and Geometry objects
     */
    extractPathFromGeometry(geometry) {
        if (!geometry) {
            console.warn('⚠️ extractPathFromGeometry: geometry is null/undefined');
            return [];
        }
        
        // Handle GeoJSON Feature (has geometry.coordinates)
        if (geometry.geometry && geometry.geometry.coordinates) {
            console.log('📐 extractPathFromGeometry: Unwrapping GeoJSON Feature');
            geometry = geometry.geometry;
        }
        
        // Handle GeoJSON Geometry (has coordinates directly)
        if (geometry.coordinates && Array.isArray(geometry.coordinates)) {
            const coords = geometry.coordinates;
            console.log(`📐 extractPathFromGeometry: Converting ${coords.length} GeoJSON coordinates from [lon,lat] to [lat,lng]`);
            
            // Convert [lon, lat] to [lat, lng] for Leaflet
            const converted = coords.map(coord => {
                if (Array.isArray(coord) && coord.length >= 2) {
                    return [coord[1], coord[0]];  // Swap lon,lat to lat,lng
                }
                return coord;
            });
            
            console.log(`✅ extractPathFromGeometry: Converted ${converted.length} points`);
            return converted;
        }
        
        // If it's already an array of coordinates (demo backend format)
        if (Array.isArray(geometry) && geometry.length > 0) {
            console.log(`📐 extractPathFromGeometry: Processing array of ${geometry.length} coordinates`);
            // Check if first element looks like [lon, lat] (lon > 90 indicates GeoJSON format)
            if (geometry[0] && geometry[0].length === 2) {
                if (Math.abs(geometry[0][0]) > 90) {
                    // Looks like [lon, lat], convert to [lat, lng]
                    console.log('   Converting from [lon,lat] to [lat,lng]');
                    return geometry.map(coord => [coord[1], coord[0]]);
                }
            }
            // Already [lat, lng] format
            console.log('   Already in [lat,lng] format');
            return geometry;
        }
        
        console.warn('⚠️ extractPathFromGeometry: Unknown geometry format:', geometry);
        return [];
    }

    displayAlternativeRoutesResponse(data) {
        // Handle the new alternative routes API response format
        this.log('🎨 Displaying alternative routes');
        
        // Clear any existing routes
        this.clearAlternativeRoutes();
        
        // Convert API response to internal format
        const alternatives = [];
        
        // Add optimal route first (always uses SSSP algorithm)
        if (data.optimal_route) {
            // Convert GeoJSON geometry to [lat, lng] path for Leaflet
            let optimalPath = this.extractPathFromGeometry(data.optimal_route.geometry || data.optimal_route.route?.geometry);
            
            alternatives.push({
                type: "optimal",
                name: "🏆 Optimal Route (SSSP)",
                description: `Shortest path using breakthrough SSSP O(m·log^{2/3}n) algorithm on real Bengaluru roads`,
                path: optimalPath,
                distance_km: (data.optimal_route.distance || data.optimal_route.route?.distance) / 1000,  // Convert meters to km
                duration_min: (data.optimal_route.duration || data.optimal_route.route?.duration) / 60,  // Convert seconds to minutes
                is_selected: true,
                cost_ratio: 1.0,
                similarity_to_optimal: 1.0,
                algorithm: data.optimal_route.algorithm || 'quantaroute',
                instructions: data.optimal_route.instructions || [],  // ✅ CRITICAL: Copy turn-by-turn instructions!
                elevation_profile: data.optimal_route.elevation_profile || data.optimal_route.route?.elevation_profile || [],  // ✅ CRITICAL: Copy elevation data!
                elevation_stats: data.optimal_route.elevation_stats || data.optimal_route.route?.elevation_stats || null  // ✅ CRITICAL: Copy elevation stats!
            });
        }
        
        // Check if alternative routes are available
        const hasAlternatives = data.alternative_routes && data.alternative_routes.length > 0;
        
        if (hasAlternatives) {
            // Add alternative routes (using advanced algorithms)
            data.alternative_routes.forEach((alt, index) => {
                // Convert GeoJSON geometry to [lat, lng] path for Leaflet
                let altPath = this.extractPathFromGeometry(alt.geometry || alt.route?.geometry);
                
                alternatives.push({
                    type: `alternative_${index + 1}`,
                    name: alt.route_name,
                    description: alt.route_description + ` (using ${data.computation_method} algorithm)`,
                    path: altPath,
                    distance_km: (alt.distance || alt.route?.distance) / 1000,  // Convert meters to km
                    duration_min: (alt.duration || alt.route?.duration) / 60,  // Convert seconds to minutes
                    is_selected: false,
                    cost_ratio: alt.cost_ratio,
                    similarity_to_optimal: alt.similarity_to_optimal,
                    route_preference_score: alt.route_preference_score,
                    algorithm: alt.algorithm || data.computation_method,
                    instructions: alt.instructions || [],  // ✅ CRITICAL: Copy turn-by-turn instructions!
                    elevation_profile: alt.elevation_profile || alt.route?.elevation_profile || [],  // ✅ CRITICAL: Copy elevation data!
                    elevation_stats: alt.elevation_stats || alt.route?.elevation_stats || null  // ✅ CRITICAL: Copy elevation stats!
                });
            });
        } else {
            // No alternative routes found
            this.log('⚠️ No alternative routes found');
        }
        
        // Store for selection handling
        this.currentAlternatives = alternatives;
        this.currentAlternativeData = data; // Store full response
        this.alternativeRouteLayers = [];
        
        // Get clicked coordinates for connector lines
        const clickedStart = this.startMarker ? this.startMarker.getLatLng() : null;
        const clickedEnd = this.endMarker ? this.endMarker.getLatLng() : null;

        // Display routes on map
        alternatives.forEach((alternative, index) => {
            if (alternative.path && alternative.path.length > 1) {
                const isSelected = alternative.is_selected;
                const routeColor = isSelected ? this.getProfileColor(this.currentProfile) : this.getAlternativeColor(index, this.currentProfile);
                
                // QuantaRoute API routes already connect properly - no need for connector lines
                // Just use the path directly
                const routeLayer = L.polyline(alternative.path, {
                    color: routeColor,
                    weight: isSelected ? 14 : 8,
                    opacity: isSelected ? 0.8 : 0.6,
                    lineCap: 'round',
                    lineJoin: 'round'
                }).addTo(this.map);
                
                // Add click handler to select alternative
                routeLayer.on('click', () => this.selectAlternativeRoute(index));
                
                // Add distance markers for the selected route
                if (isSelected && alternative.distance_km) {
                    this.addDistanceMarkersToRoute(alternative.path, alternative.distance_km);
                }
                
                this.alternativeRouteLayers.push({
                    layer: routeLayer,
                    alternative: alternative,
                    index: index
                });
            }
        });
        
        // Fit map to all routes
        if (this.alternativeRouteLayers.length > 0) {
            const group = new L.featureGroup(this.alternativeRouteLayers.map(r => r.layer));
            this.map.fitBounds(group.getBounds(), { padding: [30, 30] });
        }
        
        // Update UI
        const selectedRoute = alternatives.find(alt => alt.is_selected) || alternatives[0];
        this.updateEnhancedRouteInfo(selectedRoute, data);
        
        // Show alternative routes UI with proper messaging
        this.showAlternativeRoutesUI(alternatives, data, !hasAlternatives);
        
        // Show turn-by-turn directions for the selected (optimal) route
        this.showFloatingDirections(selectedRoute);
        
        // Show elevation profile for selected route
        this.showElevationProfile(selectedRoute);
        
        // Show clear button
        const clearButton = document.getElementById('clearRoute');
        if (clearButton) clearButton.style.display = 'block';
        
        // Show status message if no alternatives found
        if (!hasAlternatives) {
            this.showStatusMessage(
                `Only optimal route available for this location. SSSP algorithm found the shortest path on Bengaluru road network.`, 
                'info'
            );
        }
    }

    getAlternativeColor(index) {
        const colors = ['#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#10b981'];
        return colors[index % colors.length];
    }

    displayEnhancedRoute(routeData) {
        // Check if this is alternative routes or single route
        if (routeData.alternatives) {
            // Handle alternative routes
            this.displayAlternativeRoutes(routeData);
        } else {
            // Handle single route (legacy mode)
            this.displaySingleRoute(routeData);
        }
    }

    displaySingleRoute(routeData) {
        console.log('🎨 displaySingleRoute called with:', {
            hasPath: !!routeData.path,
            pathLength: routeData.path?.length || 0,
            distance: routeData.distance_km,
            duration: routeData.duration_min,
            isOptimizedRoute: routeData.algorithm?.includes('TSP')
        });
        
        // Clear existing route
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
        }
        
        // Clear any existing connector lines
        this.clearConnectorLines();

        // Display route
        if (routeData.path && routeData.path.length > 1) {
            console.log(`✅ Drawing route with ${routeData.path.length} points`);
            console.log(`   First point: [${routeData.path[0]}]`);
            console.log(`   Last point: [${routeData.path[routeData.path.length - 1]}]`);
            
            // For multi-point/optimized routes, the path is already complete from start to end
            // through all waypoints - NO NEED for connector lines!
            // The backend provides turn-by-turn routing for ALL segments.
            const isOptimizedRoute = routeData.algorithm && routeData.algorithm.includes('TSP');
            let finalPath;
            
            if (isOptimizedRoute) {
                // Use path directly - it's already complete with all segments stitched
                finalPath = routeData.path;
                console.log('🎯 Optimized multi-point route - using complete stitched path (NO connectors)');
            } else {
                // For regular routes, use connector lines if needed (legacy behavior)
                const clickedStart = this.startMarker ? this.startMarker.getLatLng() : null;
                const clickedEnd = this.endMarker ? this.endMarker.getLatLng() : null;
                finalPath = this.drawRouteWithConnectors(routeData.path, clickedStart, clickedEnd);
                console.log('📍 Regular route - checking for connector lines');
            }
            
            console.log(`   Final path length: ${finalPath.length} points`);
            
            this.routeLayer = L.polyline(finalPath, {
                color: this.getProfileColor(this.currentProfile),
                weight: 14,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(this.map);
            
            console.log('✅ Route polyline added to map');

            // Add distance markers along the route
            this.addDistanceMarkersToRoute(finalPath, routeData.distance_km);

            // Fit map to route
            this.map.fitBounds(this.routeLayer.getBounds(), { padding: [30, 30] });
        }

        // Update route info
        this.updateEnhancedRouteInfo(routeData);

        // Show floating turn-by-turn directions panel
        this.showFloatingDirections(routeData);

        // Show elevation profile for cycling and walking
        this.showElevationProfile(routeData);

        // Show clear button
        const clearButton = document.getElementById('clearRoute');
        if (clearButton) clearButton.style.display = 'block';
    }

    displayAlternativeRoutes(routeData) {
        // Clear existing routes
        this.clearAlternativeRoutes();

        // Store alternatives for later use
        this.currentAlternatives = routeData.alternatives;
        this.alternativeRouteLayers = [];

        // Find the selected route (or default to first)
        const selectedRoute = routeData.alternatives.find(alt => alt.is_selected) || routeData.alternatives[0];

        // Get clicked coordinates for connector lines
        const clickedStart = this.startMarker ? this.startMarker.getLatLng() : null;
        const clickedEnd = this.endMarker ? this.endMarker.getLatLng() : null;

        // Display all alternative routes with different styling
        routeData.alternatives.forEach((alternative, index) => {
            if (alternative.path && alternative.path.length > 1) {
                const isSelected = alternative.is_selected || index === 0;
                
                // Draw connector lines and get adjusted path for each alternative
                const adjustedPath = this.drawRouteWithConnectors(
                    alternative.path, 
                    clickedStart, 
                    clickedEnd, 
                    isSelected,
                    isSelected ? this.getProfileColor(this.currentProfile) : '#94a3b8'
                );
                
                const routeLayer = L.polyline(adjustedPath, {
                    color: isSelected ? this.getProfileColor(this.currentProfile) : this.getAlternativeColor(index, this.currentProfile),
                    weight: isSelected ? 14 : 8,
                    opacity: isSelected ? 0.8 : 0.6,
                    lineCap: 'round',
                    lineJoin: 'round'
                }).addTo(this.map);

                // Add distance markers only to the selected route to avoid clutter
                if (isSelected) {
                    this.addDistanceMarkersToRoute(adjustedPath, alternative.distance_km);
                }

                // Store reference
                this.alternativeRouteLayers.push({
                    layer: routeLayer,
                    alternative: alternative,
                    index: index
                });
            }
        });

        // Fit map to show all routes
        if (this.alternativeRouteLayers.length > 0) {
            const group = new L.featureGroup(this.alternativeRouteLayers.map(r => r.layer));
            this.map.fitBounds(group.getBounds(), { padding: [30, 30] });
        }

        // Update info with selected route
        this.updateEnhancedRouteInfo(selectedRoute);

        // Show floating turn-by-turn directions panel with selected route
        this.showFloatingDirections(selectedRoute);

        // Show elevation profile for selected route
        this.showElevationProfile(selectedRoute);

        // Display alternative routes UI
        this.showAlternativeRoutesUI(routeData.alternatives);

        // Show clear button
        const clearButton = document.getElementById('clearRoute');
        if (clearButton) clearButton.style.display = 'block';
    }

    clearAlternativeRoutes() {
        // Clear existing alternative route layers
        if (this.alternativeRouteLayers) {
            this.alternativeRouteLayers.forEach(routeLayer => {
                this.map.removeLayer(routeLayer.layer);
            });
        }
        this.alternativeRouteLayers = [];

        // Clear single route layer if exists
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }
        
        // Clear connector lines
        this.clearConnectorLines();
        
        // Clear distance markers
        this.clearDistanceMarkers();
        
        // Hide floating directions panel
        this.hideFloatingDirections();
    }

    showAlternativeRoutesUI(alternatives, data = null, noAlternatives = false) {
        const alternativeRoutesContainer = document.getElementById('alternativeRoutes');
        const alternativesList = document.getElementById('routeAlternativesList');
        const alternativeCount = document.getElementById('alternativeCount');

        if (!alternativeRoutesContainer || !alternativesList) return;

        // Update count and add diversity metrics if available  
        if (alternativeCount) {
            let countText;
            if (noAlternatives) {
                countText = `1 optimal route found • No alternatives available`;
            } else {
                countText = `${alternatives.length} routes found`;
                if (data && data.diversity_metrics) {
                    const diversity = data.diversity_metrics;
                    countText += ` • Diversity: ${(diversity.diversity_index * 100).toFixed(0)}%`;
                }
            }
            alternativeCount.textContent = countText;
        }

        // Clear existing items
        alternativesList.innerHTML = '';

        // Add algorithm info header
        if (data && data.computation_method) {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'algorithm-info-header';
            headerDiv.style.cssText = `
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 12px;
            `;
            
            if (noAlternatives) {
                // Special header for no alternatives case
                headerDiv.innerHTML = `
                    <div class="algorithm-badge" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span class="algorithm-name" style="font-weight: 600; color: #1e40af;">SSSP Algorithm</span>
                        <span class="algorithm-time" style="color: #059669; font-weight: 500;">${(data.compute_time_ms || data.total_compute_time_ms || 0).toFixed(0)}ms</span>
                    </div>
                    <div class="no-alternatives-message" style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 8px; font-size: 12px; color: #92400e;">
                        <strong>ℹ️ No alternative routes available</strong><br>
                        The optimal route is the only viable path between these locations on the Bengaluru road network.
                        This often happens for short distances or when the destination is in a limited-access area.
                    </div>
                `;
            } else {
                // Normal header with diversity metrics
                headerDiv.innerHTML = `
                    <div class="algorithm-badge" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span class="algorithm-name" style="font-weight: 600; color: #1e40af;">SSSP + ${(data.computation_method || 'FAST').toUpperCase()} Algorithms</span>
                        <span class="algorithm-time" style="color: #059669; font-weight: 500;">${(data.compute_time_ms || data.total_compute_time_ms || 0).toFixed(0)}ms</span>
                    </div>
                    ${data.diversity_metrics ? `
                    <div class="diversity-stats" style="display: flex; gap: 16px; font-size: 12px; color: #6b7280;">
                        <span class="diversity-stat">Avg Similarity: ${((data.diversity_metrics.avg_similarity || 0) * 100).toFixed(0)}%</span>
                        <span class="diversity-stat">Max Cost Ratio: ${(data.diversity_metrics.max_cost_ratio || 1.0).toFixed(1)}x</span>
                        <span class="diversity-stat">Diversity Index: ${((data.diversity_metrics.diversity_index || 0) * 100).toFixed(0)}%</span>
                    </div>` : ''}
                `;
            }
            alternativesList.appendChild(headerDiv);
        }

        // Create alternative route items
        alternatives.forEach((alternative, index) => {
            const item = document.createElement('div');
            item.className = `route-alternative-item ${alternative.is_selected ? 'selected' : ''}`;
            item.dataset.index = index;

            // Enhanced alternative info with diversity metrics
            const costRatio = alternative.cost_ratio || 1.0;
            const similarity = alternative.similarity_to_optimal || 1.0;
            const costDiff = ((costRatio - 1) * 100).toFixed(0);
            const routeColor = alternative.is_selected ? 
                this.getProfileColor(this.currentProfile) : 
                this.getAlternativeColor(index, this.currentProfile);

            item.innerHTML = `
                <div class="alternative-info">
                    <div class="alternative-header" style="display: flex; align-items: center; margin-bottom: 4px;">
                        <div class="route-color-indicator" style="background-color: ${routeColor}; width: 4px; height: 20px; border-radius: 2px; margin-right: 8px;"></div>
                        <div class="alternative-name" style="flex: 1; font-weight: 500;">${alternative.name || 'Route ' + (index + 1)}</div>
                        ${costRatio > 1.0 ? `<div class="cost-indicator" style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 10px; font-size: 11px; font-weight: 500;">+${costDiff}%</div>` : ''}
                    </div>
                    <div class="alternative-description">${alternative.description || ''}</div>
                    <div class="alternative-stats">
                        <span class="alternative-stat">📏 <strong>${(alternative.distance_km || 0).toFixed(1)} km</strong></span>
                        <span class="alternative-stat">⏱️ <strong>${this.formatDuration(alternative.duration_min)}</strong></span>
                        ${similarity < 1.0 ? `<span class="alternative-stat">🔄 ${(similarity * 100).toFixed(0)}% similar</span>` : ''}
                    </div>
                    ${alternative.route_preference_score ? `
                    <div class="preference-score" style="font-size: 11px; color: #6b7280; margin-top: 4px;">
                        Route Score: ${(alternative.route_preference_score || 0).toFixed(2)}/5.0
                    </div>` : ''}
                </div>
                <div class="alternative-actions">
                    <button class="select-route-btn" data-index="${index}">
                        ${alternative.is_selected ? '✓ Selected' : 'Select'}
                    </button>
                </div>
            `;

            // Add click handler for the entire item
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('select-route-btn')) {
                    this.selectAlternativeRoute(index);
                }
            });

            // Add specific handler for the button
            const button = item.querySelector('.select-route-btn');
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectAlternativeRoute(index);
            });

            alternativesList.appendChild(item);
        });

        // Show the alternatives container
        alternativeRoutesContainer.style.display = 'block';
    }

    selectAlternativeRoute(index) {
        if (!this.currentAlternatives || !this.alternativeRouteLayers) return;

        // Update selection state
        this.currentAlternatives.forEach((alt, i) => {
            alt.is_selected = i === index;
        });

        // Update route layer styling
        this.alternativeRouteLayers.forEach((routeLayer, i) => {
            const isSelected = i === index;
            routeLayer.layer.setStyle({
                color: isSelected ? this.getProfileColor(this.currentProfile) : this.getAlternativeColor(i, this.currentProfile),
                weight: isSelected ? 14 : 8,
                opacity: isSelected ? 0.8 : 0.6
            });
        });

        // Update UI
        this.showAlternativeRoutesUI(this.currentAlternatives);

        // Update route info with selected route
        const selectedRoute = this.currentAlternatives[index];
        this.updateEnhancedRouteInfo(selectedRoute);

        // Update floating directions panel with selected route
        this.showFloatingDirections(selectedRoute);

        // Show elevation profile for selected route
        this.showElevationProfile(selectedRoute);
    }

    updateEnhancedRouteInfo(routeData, data = null) {
        const routeInfo = document.getElementById('routeInfo');
        
        if (document.getElementById('routeDistance')) {
            document.getElementById('routeDistance').textContent = `${(routeData.distance_km || 0).toFixed(1)} km`;
        }
        
        if (document.getElementById('routeDuration')) {
            document.getElementById('routeDuration').textContent = `${(routeData.duration_min || 0).toFixed(0)} min`;
        }
        
        if (document.getElementById('routeMode')) {
            const modeNames = {
                'car': 'Driving',
                'bicycle': 'Cycling', 
                'foot': 'Walking',
                'motorcycle': 'Motorcycle'
            };
            document.getElementById('routeMode').textContent = modeNames[this.currentProfile] || 'Driving';
        }
        
        // Show performance indicator with enhanced information
        const performanceIndicator = document.getElementById('performanceIndicator');
        const routeComputeTime = document.getElementById('routeComputeTime');
        if (performanceIndicator && routeComputeTime) {
            let computeTime = routeData.compute_time_ms || (Math.random() * 200 + 50);
            let timeText = `Route calculated in ${Math.round(computeTime)}ms`;
            
            // Add algorithm info if available
            if (data && data.computation_method) {
                timeText += ` using ${data.computation_method.toUpperCase()}`;
            }
            
            routeComputeTime.textContent = timeText;
            performanceIndicator.style.display = 'block';
        }
        
        if (routeInfo) {
            routeInfo.style.display = 'block';
        }
    }

    // Override clearRoute to handle enhanced features
    clearRoute() {
        // Clear markers
        if (this.startMarker) {
            this.map.removeLayer(this.startMarker);
            this.startMarker = null;
        }
        
        if (this.endMarker) {
            this.map.removeLayer(this.endMarker);
            this.endMarker = null;
        }
        
        // Clear route layers
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }
        
        if (this.ssspRouteLayer) {
            this.map.removeLayer(this.ssspRouteLayer);
            this.ssspRouteLayer = null;
        }
        
        if (this.dijkstraRouteLayer) {
            this.map.removeLayer(this.dijkstraRouteLayer);
            this.dijkstraRouteLayer = null;
        }

        // Clear alternative routes
        this.clearAlternativeRoutes();
        this.currentAlternatives = null;
        
        // Clear waypoints
        this.waypointMarkers.forEach(marker => {
            if (marker) this.map.removeLayer(marker);
        });
        this.waypoints = [];
        this.waypointMarkers = [];
        
        // Clear connector lines and distance markers
        this.clearConnectorLines();
        this.clearDistanceMarkers();
        
        // Hide floating directions panel
        this.hideFloatingDirections();
        
        // Clear UI
        const fromInput = document.getElementById('fromInput');
        const toInput = document.getElementById('toInput');
        if (fromInput) fromInput.value = '';
        if (toInput) toInput.value = '';
        
        const waypointsList = document.getElementById('waypointsList');
        if (waypointsList) waypointsList.innerHTML = '';
        
        const routeInfo = document.getElementById('routeInfo');
        if (routeInfo) routeInfo.style.display = 'none';

        // Hide alternative routes UI
        const alternativeRoutes = document.getElementById('alternativeRoutes');
        if (alternativeRoutes) alternativeRoutes.style.display = 'none';
        
        // Hide elevation profile overlay
        this.hideElevationProfile();
        
        const performanceIndicator = document.getElementById('performanceIndicator');
        if (performanceIndicator) performanceIndicator.style.display = 'none';
        
        // Reset click count
        this.clickCount = 0;
        
        // Clear exploration layers
        if (this.explorationVisualizer) {
            try {
                this.explorationVisualizer.clearExploration();
            } catch (error) {
                console.warn('Error clearing exploration:', error);
            }
        }

        // Update button visibility
        const clearButton = document.getElementById('clearRoute');
        if (clearButton) clearButton.style.display = 'none';

        // Close any open popups
        this.map.closePopup();
        
        // Clear route points display panel
        this.updateRoutePointsDisplay();

        this.showStatusMessage('🎯 Click anywhere on the map to set your start point!', 'info');
    }

    simulateRouteData(startPos, endPos) {
        // Calculate approximate distance
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(endPos.lat - startPos.lat);
        const dLng = this.toRadians(endPos.lng - startPos.lng);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRadians(startPos.lat)) * Math.cos(this.toRadians(endPos.lat)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance_km = R * c;
        
        // Estimate duration based on transport mode
        let speed_kmh = 50; // default car speed
        switch(this.currentProfile) {
            case 'car': speed_kmh = 45; break;
            case 'motorcycle': speed_kmh = 40; break;
            case 'bicycle': speed_kmh = 15; break;
            case 'foot': speed_kmh = 5; break;
        }
        const duration_min = (distance_km / speed_kmh) * 60;
        
        // Generate a simple path
        const path = [];
        const steps = 15;
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const lat = startPos.lat + (endPos.lat - startPos.lat) * progress;
            const lng = startPos.lng + (endPos.lng - startPos.lng) * progress;
            path.push([lat, lng]);
        }
        
        return {
            path: path,
            distance_km: Math.max(0.1, distance_km),
            duration_min: Math.max(1, duration_min),
            algorithm: 'Simulated Route',
            compute_time_ms: Math.random() * 100 + 50
        };
    }

}

// Initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing QuantaRoute Demo...');
    window.quantaRouteDemo = new QuantaRouteDemo();
});
