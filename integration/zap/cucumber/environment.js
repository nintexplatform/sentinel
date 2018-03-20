const sharedEnv = require('../../../lib/environment');

module.exports = Object.assign({}, sharedEnv, {
  server: process.env.ZAP_SERVER_URL || 'http://zap:8080/',
  scanTimeout: sharedEnv.parseTimeout(process.env.ZAP_SCAN_TIMEOUT, 30000),
});
