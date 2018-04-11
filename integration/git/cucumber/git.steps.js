const Git = require('../pages/git');
const { longTimeout, envsubst } = require('./environment');
const assert = require('assert');

module.exports = function () {
  this.Before(function () {
    this.git = new Git();
  });

  this.Given(/^I have cloned the following git repo into the directory: (.+)$/, { timeout: longTimeout }, async function (workingDir, table) {
    const [repo] = table.hashes();
    const args = repo.cloneArguments.split(' ')
      .filter(s => s)
      .map(s => s.trim());
    const { code } = await this.git.cmd(workingDir, 'clone', ...args, envsubst(repo.url), '.');
    assert(code === 0, `Command was unsuccessful: ${code}`);
  });

  this.Given(/^I checkout the following files into the directory: (.+)$/, { timeout: longTimeout }, async function (workingDir, table) {
    const files = table.hashes();
    for (const f of files) {
      const { code } = await this.git.cmd(workingDir, 'checkout', envsubst(f.commit), f.file);
      assert(code === 0, `Command was unsuccessful: ${code}`);
    }
  });
};
