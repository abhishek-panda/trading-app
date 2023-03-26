export const csp = {
    useDefaults: true,
    directives: {
        'default-src': [
            "'self'"
        ],
        'script-src': [
            "'self'"
        ],
        'style-src': ["'self'", "'unsafe-inline'"],
        upgradeInsecureRequests:[]
    }
};