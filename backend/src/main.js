const { createApp } = require('#app.js');
const { logger } = require('#libs/logger/logger.service.js');

function installSignalHandlers(server) {
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      logger.info(`Received ${signal}`);
      server
        .stop()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
    });
  }
}

async function bootstrap() {
  const server = await createApp();
  installSignalHandlers(server);
  return server;
}

if (require.main === module) {
  bootstrap().catch((error) => {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  });
}

module.exports = { bootstrap, installSignalHandlers };
