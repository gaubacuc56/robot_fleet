function createLocalBroadcaster() {
  let handler = null;

  return {
    kind: 'local',
    async start() {},
    onMessage(fn) {
      handler = fn;
    },
    async publish(message) {
      if (handler) handler(message);
    },
    async close() {
      handler = null;
    },
  };
}

module.exports = { createLocalBroadcaster };
