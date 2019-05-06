const sharedEnv = require('../../../lib/environment');

const configuredThreshold = (process.env.SNYK_FAILURE_LEVEL || 'high').toLowerCase();
const possibleThresholds = ['low', 'medium', 'high'];

if (!possibleThresholds.includes(configuredThreshold)) {
  throw new Error(`Invalid snyk severity threshold: ${configuredThreshold}`);
}

module.exports = Object.assign({}, sharedEnv, {
  snykUrl: process.env.SNYK_URL || 'http://snyk:8086/',
  snykFailureLevels: possibleThresholds.slice(possibleThresholds.indexOf(configuredThreshold)),
});
