const sharedEnv = require('../../../lib/environment');

module.exports = Object.assign({}, sharedEnv, {
  username: process.env.DOCKER_USERNAME,
  password: process.env.DOCKER_PASSWORD,
});
