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
                apiBaseUrl: 'http://localhost:8000/api',
                displayName: '🏠 Local Demo',
                description: 'Using local QuantaRoute instance on localhost:8000',
                authRequired: false,
                healthCheck: true,
                requiresTrailingSlash: false  // Local API doesn't need trailing slashes
            },
            remote: {
                // Production QuantaRoute API
                // Format: https://routing.api.quantaroute.com/v1
                apiBaseUrl: window.QUANTAROUTE_API_URL || 'https://routing.api.quantaroute.com/v1',
                displayName: '🌐 Production API',
                description: 'Using QuantaRoute Cloud API (routing.api.quantaroute.com)',
                authRequired: true,
                apiKey: window.QUANTAROUTE_API_KEY || 'demo_enterprise_api_key_quantaroute_2024',
                healthCheck: true,
                requiresTrailingSlash: true  // Production API requires trailing slashes (FastAPI)
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
        
        // Add trailing slash for remote mode (FastAPI requirement)
        if (this.config.requiresTrailingSlash && !endpoint.includes('?') && !endpoint.endsWith('/')) {
            // Don't add trailing slash if endpoint has query parameters
            const hasQueryParams = endpoint.includes('?');
            if (!hasQueryParams) {
                endpoint = `${endpoint}/`;
            }
        }
        
        return `${this.config.apiBaseUrl}/${endpoint}`;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add API key for remote mode using Bearer token format (FastAPI standard)
        if (this.mode === 'remote' && this.config.authRequired && this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            console.log('✅ Authorization header added for remote mode');
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
            // Health check endpoint (no /v1 prefix needed)
            const healthUrl = this.mode === 'local' 
                ? `${this.config.apiBaseUrl}/health`
                : `${this.config.apiBaseUrl.replace('/v1', '')}/health`;
            
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

