const sharedEnv = require('../../../lib/environment');

module.exports = Object.assign({}, sharedEnv, {
  snykUrl: process.env.SNYK_URL || 'http://snyk:8086/',
  snykFailureLevel: process.env.SNYK_FAILURE_LEVEL || 'high',
});
