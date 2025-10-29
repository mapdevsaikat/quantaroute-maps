/**
 * QuantaRoute Demo Configuration
 * Supports both localhost and deployed API modes
 */

class DemoConfig {
    constructor() {
        // Auto-detect environment or use config
        this.mode = this.detectMode();
        this.config = this.getConfig();
        
        // Debug logging
        console.log('🔧 DemoConfig initialized:', {
            mode: this.mode,
            apiBaseUrl: this.config.apiBaseUrl,
            authRequired: this.config.authRequired,
            apiKey: this.config.apiKey ? `${this.config.apiKey.substring(0, 20)}...` : 'none'
        });
    }

    detectMode() {
        // Check if running locally
        const isLocalhost = window.location.hostname === 'localhost' 
            || window.location.hostname === '127.0.0.1'
            || window.location.hostname === '';
        
        // Check if on GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        // Check for explicit mode in URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const modeParam = urlParams.get('mode');
        
        if (modeParam === 'local' || modeParam === 'remote') {
            return modeParam;
        }
        
        // Check for config in localStorage
        const storedMode = localStorage.getItem('quantaroute_demo_mode');
        if (storedMode) {
            return storedMode;
        }
        
        // Default: 
        // - remote if on GitHub Pages or non-localhost domain
        // - local only if explicitly on localhost
        return (isGitHubPages || !isLocalhost) ? 'remote' : 'local';
    }

    getConfig() {
        const configs = {
            local: {
                // Updated to match actual API endpoints: localhost:8080/v1/routing
                apiBaseUrl: 'http://localhost:8080/v1',
                displayName: '🏠 Local Demo',
                description: 'Using local QuantaRoute instance on localhost:8080',
                authRequired: true,
                apiKey: 'demo_enterprise_api_key_quantaroute_2024',
                healthCheck: true
            },
            remote: {
                // Production QuantaRoute API
                // Format: https://routing.api.quantaroute.com/v1
                apiBaseUrl: window.QUANTAROUTE_API_URL || 'https://routing.api.quantaroute.com/v1',
                displayName: '🌐 Production API',
                description: 'Using QuantaRoute Cloud API (routing.api.quantaroute.com)',
                authRequired: true,
                apiKey: window.QUANTAROUTE_API_KEY || 'demo_enterprise_api_key_quantaroute_2024',
                healthCheck: true
            }
        };

        return configs[this.mode];
    }

    setMode(mode) {
        if (mode !== 'local' && mode !== 'remote') {
            console.error('Invalid mode. Use "local" or "remote"');
            return;
        }
        
        this.mode = mode;
        this.config = this.getConfig();
        localStorage.setItem('quantaroute_demo_mode', mode);
        
        // Reload page to apply new configuration
        window.location.reload();
    }

    getApiUrl(endpoint) {
        // Remove leading slash if present
        endpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        
        // Handle custom demo endpoints that don't exist in QuantaRoute API
        // These return mock data or fallback to defaults
        if (endpoint === 'bengaluru-bounds' || endpoint === 'search?q=') {
            // Return null to indicate these should be handled client-side
            return null;
        }
        
        // DON'T add trailing slash for routing endpoints
        // The v1 routing API endpoints are defined WITHOUT trailing slashes
        // e.g., /v1/routing/, /v1/routing/alternatives, /v1/routing/turn-by-turn
        // Adding trailing slash causes FastAPI redirects which can break POST requests
        
        return `${this.config.apiBaseUrl}/${endpoint}`;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add API key using Bearer token format (FastAPI standard)
        if (this.config.authRequired && this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            console.log(`✅ Authorization header added (${this.mode} mode)`);
        } else {
            console.log('⚠️ No Authorization header added:', {
                mode: this.mode,
                authRequired: this.config.authRequired,
                hasApiKey: !!this.config.apiKey
            });
        }

        return headers;
    }

    async checkHealth() {
        try {
            // Health check endpoint (no /v1 prefix)
            // Both local and remote use the same base domain structure
            const baseUrl = this.config.apiBaseUrl.replace(/\/v1.*$/, '');
            const healthUrl = `${baseUrl}/health`;
            
            console.log(`🏥 Health check URL: ${healthUrl}`);
            
            const response = await fetch(healthUrl, {
                headers: this.getHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    available: true,
                    mode: this.mode,
                    apiUrl: this.config.apiBaseUrl,
                    authMethod: this.mode === 'remote' ? 'Bearer Token' : 'None',
                    ...data
                };
            }
            
            return {
                available: false,
                mode: this.mode,
                error: `HTTP ${response.status}: ${response.statusText}`
            };
        } catch (error) {
            return {
                available: false,
                mode: this.mode,
                error: error.message
            };
        }
    }

    getDisplayInfo() {
        return {
            mode: this.mode,
            displayName: this.config.displayName,
            description: this.config.description,
            apiBaseUrl: this.config.apiBaseUrl,
            authRequired: this.config.authRequired
        };
    }
}

// Create global instance
window.demoConfig = new DemoConfig();

// Log configuration on load
console.log('🔧 QuantaRoute Demo Configuration:', window.demoConfig.getDisplayInfo());

