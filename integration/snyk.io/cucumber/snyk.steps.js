/* eslint
   new-cap: 0,
   func-names: 0,
   prefer-arrow-callback: 0,
   no-console: 0,
*/
const env = require('./environment');
const Snyk = require('../pages/snyk.io');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const assert = chai.assert;
const errorMessage = 'Vulnerability detected';
let snykOutput = '';

module.exports = function () {
  this.When(/^the SNYK command is run against the project dependencies$/, { timeout: env.longTimeout }, async function () {
    const snyk = new Snyk();
    snykOutput = await snyk.startTheProcess();
    console.log(snykOutput);
  });

  this.When(/^there should not be any vulnerable paths found$/, { timeout: env.longTimeout }, async function () {
    const expectedValue = 'no vulnerable paths found';
    assert((snykOutput.indexOf(expectedValue) !== -1), `${errorMessage}`);
  });
};
