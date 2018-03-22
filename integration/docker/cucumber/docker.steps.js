const Docker = require('../pages/docker');
const env = require('./environment');

module.exports = function () {
  this.Before(function () {
    this.docker = new Docker();
  });

  this.Given(/^I have logged into the docker registry (.+)$/, { timeout: env.longTimeout }, async function (server) {
    await this.docker.cmd('login', '-u', env.username, '-p', env.password, server);
  });

  this.Given(/^I have run the docker command$/, { timeout: env.longTimeout }, async function (table) {
    const cmd = table.rowsHash().cmd || '';
    const args = cmd.split(' ');
    if (args.length > 1 && args[0] === 'docker') {
      await this.docker.cmd(...args.slice(1));
    }
  });

  this.Given(/^I have copied the paths from the docker image$/, { timeout: env.longTimeout }, async function (table) {
    const paths = table.hashes();
    await Promise.all(paths.map((p) => {
      let { dockerImage, dockerTag } = p;
      if (dockerTag) {
        const [, envVar] = dockerTag.match(/^\[(.+)\]$/);
        if (envVar) {
          dockerTag = process.env[envVar];
        }
        dockerImage += `:${dockerTag}`;
      }
      if (p.type === 'file') {
        return this.docker.cmd('run', '-v', '$(pwd):/wd', dockerImage, 'cp', p.fromPath, `/wd/${p.toPath}`);
      }
      return this.docker.cmd('run', '-v', '$(pwd):/wd', dockerImage, 'cp', '-R', p.fromPath, `/wd/${p.toPath}`);
    }));
  });
};
