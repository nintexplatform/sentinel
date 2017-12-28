/* eslint
   new-cap: 0,
   func-names: 0,
   prefer-arrow-callback: 0,
   no-console: 0,
*/
const env = require('./environment');
const Snyk = require('../pages/snyk.io');

module.exports = function () {
  this.When(/^the SNYK command is run against the project dependencies$/, { timeout: env.longTimeout }, async function () {
    const snyk = new Snyk();
    this.snykOutput = await snyk.startTheProcess();
    console.log(this.snykOutput);
  });
};
