const mongoose = require('mongoose');

const { config } = require('#config/env.config.js');
const { Robot } = require('#domain/entities/schema/robot.entity.js');
const { Telemetry } = require('#domain/entities/schema/telemetry.entity.js');
const { logger } = require('#libs/logger/logger.service.js');

async function connectDatabase(uri = config.mongoUri) {
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  logger.info(`Connected to MongoDB at ${uri.replace(/\/\/[^@]*@/, '//***@')}`);

  await Promise.all([Telemetry.syncIndexes(), Robot.syncIndexes()]);
  logger.debug('Indexes synced');

  return mongoose.connection;
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  logger.info('MongoDB connection closed');
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDatabase, disconnectDatabase, isDatabaseConnected };
