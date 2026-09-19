const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8080",
      changeOrigin: true,
    })
  );

  const hub = {
    target: "http://localhost:8080",
    changeOrigin: true,
    pathRewrite: {
      "^/session-api": "/api",
      "^/identity-api": "/api",
      "^/connector-api": "/api",
    },
  };
  app.use("/session-api", createProxyMiddleware(hub));
  app.use("/identity-api", createProxyMiddleware(hub));
  app.use("/connector-api", createProxyMiddleware(hub));
};
