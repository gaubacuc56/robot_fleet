const { logger } = require('#libs/logger/logger.service.js');
const { CONNECT_TIMEOUT_MS } = require('./broadcaster.constant.js');
const { createLocalBroadcaster } = require('./local.broadcaster.js');
const { createRedisBroadcaster } = require('./redis.broadcaster.js');

async function createBroadcaster({ redisUrl } = {}) {
  if (!redisUrl) {
    const local = createLocalBroadcaster();
    await local.start();
    logger.info('Broadcaster using in-process fan-out (single worker only)');
    return local;
  }

  const redis = createRedisBroadcaster(redisUrl);
  try {
    // Hard ceiling on top of the client's own timeout, so startup cannot
    // block indefinitely on a service that may never come up.
    await Promise.race([
      redis.start(),
      new Promise((unused, reject) =>
        setTimeout(
          () => reject(new Error(`connect timed out after ${CONNECT_TIMEOUT_MS * 2}ms`)),
          CONNECT_TIMEOUT_MS * 2
        ).unref()
      ),
    ]);
    return redis;
  } catch (error) {
    logger.error(`Redis unavailable at ${redisUrl}: ${error.message}. Falling back to local.`);
    await redis.close().catch(() => {});
    const local = createLocalBroadcaster();
    await local.start();
    return local;
  }
}

module.exports = { createBroadcaster };
