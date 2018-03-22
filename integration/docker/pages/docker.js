const rp = require('request-promise');

class Docker {
  async cmd(...args) {
    this.output = await rp({
      uri: 'http://docker:8080/cmd',
      method: 'POST',
      body: {
        args,
      },
      json: true,
    });
    return this.output;
  }
}

module.exports = Docker;
