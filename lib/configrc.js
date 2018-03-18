const Files = require('./filesystem');

class Config {
  constructor(filename = '.sentinel.json') {
    this.filename = filename;
    this.default = {
      integrations: {
        whitelist: [],
        customServices: [],
      },
    };
  }
  async ensureFile() {
    const fs = new Files();
    try {
      await fs.fsa.writeFile(
        this.filename,
        JSON.stringify(this.default, null, 2),
        { flag: 'wx' },
      );
    } catch (ex) {
      // Ignore the file if it already exists.
      if (ex.code !== 'EEXIST') {
        throw ex;
      }
    }
  }
  async readFile() {
    const fs = new Files();
    try {
      const contents = await fs.fsa.readFile(this.filename);
      return JSON.parse(contents);
    } catch (ex) {
      if (ex.code !== 'ENOTEXISTS') {
        throw ex;
      }
    }
    return this.default;
  }
}

module.exports = Config;
