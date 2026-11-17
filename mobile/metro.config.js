const http = require('node:http');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Let phones use the Metro LAN port when they cannot reach the API port directly.
if (process.env.NEXTSTEP_DEV_API_PROXY === '1') {
  const { host, hostname } = new URL(process.env.EXPO_PUBLIC_API_URL);
  const enhanceMiddleware = config.server.enhanceMiddleware;

  config.server.enhanceMiddleware = (middleware, server) => {
    const handleMetro = enhanceMiddleware(middleware, server);

    return (req, res, next) => {
      if (req.headers.host !== host || !req.url?.startsWith('/api/')) {
        return handleMetro(req, res, next);
      }

      const upstream = http.request({
        hostname,
        port: 5000,
        method: req.method,
        path: req.url,
        headers: { ...req.headers, host: `${hostname}:5000` },
      }, apiResponse => {
        res.writeHead(apiResponse.statusCode, apiResponse.headers);
        apiResponse.on('error', () => res.destroy());
        apiResponse.pipe(res);
      });

      upstream.on('error', () => {
        if (res.destroyed) return;
        if (res.headersSent) {
          res.destroy();
          return;
        }
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'The Nextstep API is unavailable. Start Docker Compose and try again.' }));
      });
      upstream.setTimeout(65000, () => upstream.destroy());
      res.on('close', () => {
        if (!res.writableEnded) upstream.destroy();
      });
      req.pipe(upstream);
    };
  };
}

module.exports = config;
