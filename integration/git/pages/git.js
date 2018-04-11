const rp = require('request-promise');

class Git {
  async cmd(workingDir, ...args) {
    this.output = await rp({
      uri: 'http://git:8080/cmd',
      method: 'POST',
      body: {
        args,
        workingDir,
      },
      json: true,
    });
    return this.output;
  }
}

module.exports = Git;
