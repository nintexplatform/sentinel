const rp = require('request-promise');
const env = require('./../cucumber/environment');

class Snyk {
  async runScanInProjectDirectory() {
    this.output = await rp({
      uri: `${env.snykUrl}snyk/run`,
      json: true,
    });
    return this.output;
  }
  async runScanInDirectory(dir) {
    this.output = await rp({
      uri: `${env.snykUrl}snyk/run`,
      method: 'POST',
      json: true,
      body: {
        working_directory: dir,
      },
    });
    return this.output;
  }
}

module.exports = Snyk;
