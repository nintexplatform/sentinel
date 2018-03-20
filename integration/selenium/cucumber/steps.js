const sharedEnv = require('../../../lib/environment');

module.exports = function () {
  const autUrl = process.env.AUT_SERVER_URL || '.';

  this.Given(/^I have loaded the web application$/, { timeout: sharedEnv.timeout }, async function () {
    return this.driver.get(`${autUrl}`);
  });

  this.Given(/^I have loaded the web application with "([^"]+)"$/, { timeout: sharedEnv.timeout }, async function (url) {
    return this.driver.get(url);
  });
};
