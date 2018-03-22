const sharedEnv = require('../../../lib/environment');

module.exports = Object.assign({}, sharedEnv, {
  serverHostName: process.env.AUT_SERVER_URL || '.',
  sslyzeServerUrl: process.env.SSLYZE_SERVER_URL || 'http://sslyze:8081/',
});
