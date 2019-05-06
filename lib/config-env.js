const Files = require('./filesystem');

class EnvConfig {
  constructor({
    filename = 'config.env',
    createIfMissing,
    envVarWhitelist,
  } = {
    createIfMissing: false,
    envVarWhitelist: null,
  }) {
    this.filename = filename;
    this.createIfMissing = createIfMissing;
    this.envVarWhitelist = envVarWhitelist;
    this.fs = new Files();
  }
  async ensureFileIfRequired() {
    const exists = await this.fs.exists(this.filename);
    if (!exists && this.createIfMissing) {
      const envText = Object.keys(process.env)
        .filter(envVar => !this.envVarWhitelist ||
          this.envVarWhitelist.includes(envVar))
        .reduce((str, envVar) => `${str}${envVar}=${process.env[envVar]}\n`, '');
      await this.fs.writeFile(this.filename, envText, { encoding: 'utf8', flag: 'w' });
    }
  }
}

module.exports = EnvConfig;
