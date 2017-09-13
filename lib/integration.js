const path = require('path');
const shell = require('shelljs');

class Integration {
    static packageDirectory() {
        return path.resolve(path.join(__dirname, '..'));
    }
    static integrationDirectory() {
        return path.join(Integration.packageDirectory(), 'integration');
    }
    static getFiles(options) {
        const integrationDirectory = Integration.integrationDirectory();
        const integration = shell.find(integrationDirectory);
        if (integration.code !== 0) {
            return [];
        }
        if (options && options.withRelativePaths === true) {
            // Windows returns \ as directory separator. shell.find returns /.
            const cwd = process.cwd().replace(/\\/g, '/');
            // Make all paths that reference the current working dir relative.
            // And any paths that reference the global install dir relative to local.
            return integration
                .map(f => f.replace(cwd, '.'))
                .map(f => f.replace(Integration.packageDirectory(), './node_modules/sentinel-ast'));
        }
        return integration;
    }
    static findFeatures(files) {
        return files.filter(f => f.match(/\.feature$/));
    }
    static findSupportJs(files) {
        return files.filter(f => f.match(/\/cucumber\/.*\.js$/));
    }
    static findCompose(files) {
        return files.filter(f => f.match(/docker-compose\.yml$/));
    }
    static findIntegration(files) {
        return files.filter(f => f.match(/integration\.js$/));
    }
}

module.exports = Integration;