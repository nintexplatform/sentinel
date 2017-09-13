const DockerCompose = require('./lib/docker-compose');
const ZapCore = require('./integration/zap/pages/zap-core');

/**
 * These are the classes that get imported when the consumer of this framework does this:
 * fw = require('sentinel-ast');
 */
module.exports = {
    DockerCompose,
    ZapCore,
};