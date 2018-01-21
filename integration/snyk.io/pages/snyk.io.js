const rp = require('request-promise');
const env = require('./../cucumber/environment');

class Snyk {
  async startTheProcess() {
    this.output = await rp({
      uri: `${env.snykUrl}snyk/run`,
      json: true,
    });
    return this.output;
  }
}

module.exports = Snyk;
