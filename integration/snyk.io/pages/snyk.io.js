const rp = require('request-promise');
const env = require('./../cucumber/environment');

class Snyk {
  async runScanInProjectDirectory() {
    this.output = await rp({
      uri: `${env.snykUrl}snyk/run`,
      json: true,
      resolveWithFullResponse: true,
      simple: false,
    });
    if (this.output.statusCode !== 200) {
      throw new Error(`Snyk error: ${JSON.stringify(this.output.body)}`);
    }
    return this.output;
  }
  async runScanInDirectory(dir) {
    this.output = await rp({
      uri: `${env.snykUrl}snyk/run`,
      method: 'POST',
      json: true,
      resolveWithFullResponse: true,
      simple: false,
      body: {
        working_directory: dir,
      },
    });
    if (this.output.statusCode !== 200) {
      throw new Error(`Snyk error: ${JSON.stringify(this.output.body)}`);
    }
    return this.output;
  }
}

module.exports = Snyk;
