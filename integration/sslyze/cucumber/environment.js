const env = require('../../../lib/environment');
const merge = require('lodash.merge');

module.exports = merge(env, {
  serverHostName: process.env.SSLYZE_SERVER_URL || '.',
});
