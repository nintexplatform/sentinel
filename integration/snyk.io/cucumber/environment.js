const env = require('../../../lib/environment');
const merge = require('lodash.merge');

module.exports = merge(env, {
  snykUrl: process.env.SNYK_URL || 'http://snyk:8086/',
});
