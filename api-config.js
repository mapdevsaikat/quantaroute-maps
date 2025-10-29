// Local development API configuration
// This file is NOT deployed to GitHub Pages
// For production, GitHub Actions creates this file with secrets

(function() {
    if (typeof window !== 'undefined') {
        // Use dummy key for local development
        // The real key will be injected by GitHub Actions during deployment
        window.QUANTAROUTE_API_KEY = window.QUANTAROUTE_API_KEY || 'demo_enterprise_api_key_quantaroute_2024';
        console.log('🔧 Local development mode - using dummy API key');
        console.log('ℹ️  Production deployment will use real API key from GitHub Secrets');
    }
})();

