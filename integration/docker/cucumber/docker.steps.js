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
};
