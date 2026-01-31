const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    // Proxy for Session API
    app.use(
        '/session-api',
        createProxyMiddleware({
            target: 'https://idf-session-api.ndashdigital.com/api',
            changeOrigin: true,
            pathRewrite: {
                '^/session-api': '',
            },
        })
    );

    // Proxy for Identity API
    app.use(
        '/identity-api',
        createProxyMiddleware({
            target: 'https://identity-api.ndashdigital.com/api',
            changeOrigin: true,
            pathRewrite: {
                '^/identity-api': '',
            },
        })
    );

    // Proxy for Connector API
    app.use(
        '/connector-api',
        createProxyMiddleware({
            target: 'https://idf-connector.ndashdigital.com/api',
            changeOrigin: true,
            pathRewrite: {
                '^/connector-api': '',
            },
        })
    );
};
