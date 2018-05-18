const Files = require('./filesystem');

class SentinelConfig {
  constructor(filename = '.sentinel.json') {
    this.filename = filename;
    this.default = {
      integrations: {
        whitelist: [],
        customServices: [],
      },
      configEnv: {
        createIfMissing: false,
        envVarWhitelist: null,
      },
    };
  }
  async ensureFile() {
    const fs = new Files();
    try {
      await fs.writeFile(
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
      const contents = await fs.readFile(this.filename);
      return JSON.parse(contents);
    } catch (ex) {
      if (ex.code !== 'ENOTEXISTS' && ex.code !== 'ENOENT') {
        throw ex;
      }
    }
    return this.default;
  }
}

module.exports = SentinelConfig;
