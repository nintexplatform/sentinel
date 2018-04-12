function parseTimeout(val, ifNanValue) {
  const parsed = parseInt(val, 10);
  if (isNaN(parsed)) { // eslint-disable-line no-restricted-globals
    return ifNanValue;
  }
  return parsed;
}

function envsubst(str) {
  const regex = /(?:\[([\w\d]+)\])+/g;
  let result = str;
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(str)) !== null) {
    const [, envVar] = match;
    if (envVar && process.env[envVar] !== undefined) {
      result = result.replace(`[${envVar}]`, process.env[envVar]);
    }
  }
  return result;
}

module.exports = {
  parseTimeout,
  envsubst,
  timeout: parseTimeout(process.env.CUCUMBER_TIMEOUT, 10000),
  longTimeout: parseTimeout(process.env.CUCUMBER_LONG_TIMEOUT, 30000),
};
