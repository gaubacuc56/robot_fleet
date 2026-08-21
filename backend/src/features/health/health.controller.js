const { isDatabaseConnected } = require('#libs/database/database.provider.js');
const { writeJson } = require('#libs/http/response.util.js');

function registerHealthRoutes(app) {
  app.get('/health', (res) => {
    writeJson(res, 200, {
      status: 'ok',
      mongo: isDatabaseConnected() ? 'connected' : 'disconnected',
      uptime: Number(process.uptime().toFixed(1)),
      pid: process.pid,
    });
  });

  return app;
}

module.exports = { registerHealthRoutes };
