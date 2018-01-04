const rp = require('request-promise');
const env = require('./../cucumber/environment');

class Snyk {
  async startTheProcess() {
    this.output = await rp(`${env.snykUrl}snyk/run`);
    return this.output;
  }
}

module.exports = Snyk;
