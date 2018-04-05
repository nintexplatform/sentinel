const assert = require('assert');
const env = require('./environment');
const Snyk = require('../pages/snyk.io');

module.exports = function () {
  this.Before(function () {
    this.snykOutput = null;
  });

  this.When(/^the SNYK command is run in the directory: (.+)$/, { timeout: env.longTimeout }, async function (directory) {
    const snyk = new Snyk();
    this.snykOutput = await snyk.runScanInDirectory(directory);
  });

  this.When(/^the SNYK command is run against the project dependencies$/, { timeout: env.longTimeout }, async function () {
    const snyk = new Snyk();
    this.snykOutput = await snyk.runScanInProjectDirectory();
  });

  this.Then(/^there should not be any vulnerable paths found$/, async function () {
    if (this.snykOutput) {
      assert(this.snykOutput.every(v =>
        v.severity && v.severity.toLowerCase() !== env.snykFailureLevel.toLowerCase()), 'Vulnerability detected');
    }
  });

  this.After(async function (scenario) {
    if (this.snykOutput) {
      scenario.attach(JSON.stringify(this.snykOutput, null, 2));
    }
  });
};
