const sharedEnv = require('../../../lib/environment');

module.exports = Object.assign({}, sharedEnv, {
  server: process.env.ZAP_SERVER_URL || 'http://zap:8080/',
  scanTimeout: sharedEnv.parseTimeout(process.env.ZAP_SCAN_TIMEOUT, 30000),
  maxDepth: process.env.ZAP_MAX_DEPTH || 5,
  threadCount: process.env.ZAP_THREAD_COUNT || 5,
});
