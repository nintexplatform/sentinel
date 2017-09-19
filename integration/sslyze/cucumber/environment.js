const env = require('../../../lib/environment');
const merge = require('lodash.merge');

module.exports = merge(env, {
  serverHostName: process.env.AUT_SERVER_URL || '.',
  sslyzeServerUrl: process.env.SSLYZE_SERVER_URL || 'http://sslyze:8081/',
});