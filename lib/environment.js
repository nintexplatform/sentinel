function parseTimeout(val, ifNanValue) {
  const parsed = parseInt(val, 10);
  if (isNaN(parsed)) { // eslint-disable-line no-restricted-globals
    return ifNanValue;
  }
  return parsed;
}

module.exports = {
  parseTimeout,
  timeout: parseTimeout(process.env.CUCUMBER_TIMEOUT, 10000),
  longTimeout: parseTimeout(process.env.CUCUMBER_LONG_TIMEOUT, 30000),
};
