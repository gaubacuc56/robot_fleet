const { logger } = require('#libs/logger/logger.service.js');
const {
  BROADCAST_CHANNEL,
  CONNECT_TIMEOUT_MS,
  MAX_CONNECT_RETRIES,
} = require('./broadcaster.constant.js');

async function shutdownClient(client) {
  try {
    if (client.isOpen) {
      await client.quit();
      return;
    }
  } catch {
    // fall through to a hard drop
  }

  try {
    if (typeof client.destroy === 'function') client.destroy();
    else if (typeof client.disconnect === 'function') await client.disconnect();
  } catch {
    // already gone
  }
}

function createRedisBroadcaster(redisUrl) {
  const { createClient } = require('redis');

  const publisher = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: CONNECT_TIMEOUT_MS,
      // The default retries for ever, which would hang startup instead of
      // letting the caller fall back.
      reconnectStrategy: (retries) =>
        retries > MAX_CONNECT_RETRIES
          ? new Error('Redis unreachable')
          : Math.min(retries * 200, 1000),
    },
  });
  const subscriber = publisher.duplicate();
  let handler = null;

  publisher.on('error', (error) => logger.error('Redis publisher error:', error.message));
  subscriber.on('error', (error) => logger.error('Redis subscriber error:', error.message));

  return {
    kind: 'redis',
    async start() {
      await publisher.connect();
      await subscriber.connect();

      await subscriber.subscribe(BROADCAST_CHANNEL, (raw) => {
        if (!handler) return;
        try {
          handler(JSON.parse(raw));
        } catch (error) {
          logger.error('Dropping malformed message from Redis:', error.message);
        }
      });

      logger.info(`Broadcaster using Redis at ${redisUrl}`);
    },
    onMessage(fn) {
      handler = fn;
    },
    async publish(message) {
      // Redis delivers to every subscriber including this process, so the
      // local WebSocket publish happens in the subscription handler.
      await publisher.publish(BROADCAST_CHANNEL, JSON.stringify(message));
    },
    async close() {
      handler = null;
      if (subscriber.isOpen) {
        await subscriber.unsubscribe(BROADCAST_CHANNEL).catch(() => {});
      }
      await Promise.all([shutdownClient(subscriber), shutdownClient(publisher)]);
    },
  };
}

module.exports = { createRedisBroadcaster };
