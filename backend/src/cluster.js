const cluster = require('node:cluster');
const os = require('node:os');

const { config } = require('#config/env.config.js');
const { logger } = require('#libs/logger/logger.service.js');

/**
 * Cluster entry point. (Q4-R1, Q4-R2, Q4-R3)
 *
 * How the workers share one port: uWebSockets.js does not use Node's net
 * server, so Node's cluster module cannot round-robin connections the way it
 * does for an http.Server. Instead every worker calls listen() on the same
 * port and uSockets sets SO_REUSEPORT, leaving the kernel to spread incoming
 * connections. That is Linux-specific — elsewhere only one worker binds.
 *
 * Workers still need REDIS_URL for cross-worker fan-out; see
 * src/libs/broadcaster/redis.broadcaster.js.
 */
function startPrimary() {
  const workerCount = config.workers;
  const detectedCpus = os.cpus().length;

  logger.info(
    `Primary ${process.pid} starting ${workerCount} worker(s) ` +
      `(WORKERS=${process.env.WORKERS ?? 'unset'}, cpus=${detectedCpus}, cap=${config.maxWorkers})`
  );

  if (!config.redisUrl) {
    logger.warn(
      'REDIS_URL is not set. uWS topics are per-process, so a dashboard client ' +
        'will only receive updates from robots on the same worker. Set REDIS_URL ' +
        'for cross-worker fan-out.'
    );
  }

  for (let i = 0; i < workerCount; i += 1) {
    cluster.fork();
  }

  cluster.on('online', (worker) => {
    logger.info(`Worker ${worker.process.pid} online`);
  });

  // Replace a worker that died unexpectedly, but not one shut down on purpose.
  cluster.on('exit', (worker, code, signal) => {
    if (worker.exitedAfterDisconnect) {
      logger.info(`Worker ${worker.process.pid} exited cleanly`);
      return;
    }

    logger.error(
      `Worker ${worker.process.pid} died (code=${code}, signal=${signal}); restarting`
    );
    cluster.fork();
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      logger.info(`Primary received ${signal}, stopping workers`);
      for (const worker of Object.values(cluster.workers)) {
        worker.kill(signal);
      }
      // Give workers a moment to close sockets and the database.
      setTimeout(() => process.exit(0), 2000).unref();
    });
  }
}

async function startWorker() {
  const { bootstrap } = require('#main.js');
  const server = await bootstrap();
  logger.info(`Worker ${process.pid} serving port ${server.port}`);
}

if (cluster.isPrimary) {
  startPrimary();
} else {
  startWorker().catch((error) => {
    logger.error(`Worker ${process.pid} failed to start:`, error.message);
    process.exit(1);
  });
}
