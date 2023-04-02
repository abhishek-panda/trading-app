export const csp = {
    useDefaults: true,
    directives: {
        'default-src': [
            "'self'"
        ],
        'script-src': [
            "'self'"
        ],
        'style-src': ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        upgradeInsecureRequests:[]
    }
};