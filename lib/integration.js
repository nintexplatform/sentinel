const path = require('path');
const Files = require('./filesystem');

class Integration {
  constructor() {
    this.userDirectory = process.cwd();
    this.featureDir = process.env.FEATURE_DIR || path.join(this.userDirectory, 'features');
    this.envConsolidate = '# These are the environment variables used in the tests container';
    this.fs = new Files();
  }

  static packageDirectory() {
    return path.resolve(path.join(__dirname, '..'));
  }

  static integrationDirectory() {
    return path.join(Integration.packageDirectory(), 'integration');
  }

  async getFiles(options) {
    const integrationDirectory = Integration.integrationDirectory();
    const exists = await this.fs.exists(integrationDirectory);
    if (!exists) {
      return [];
    }
    const integrationEnabled = d => !options
      || !Array.isArray(options.whitelistedIntegrations)
      || options.whitelistedIntegrations.length === 0
      || options.whitelistedIntegrations.some(wld => d.endsWith(wld));
    const integrationDirectories = await this.fs.getDirectories(integrationDirectory, options);
    const integrationFiles = await Promise.all(integrationDirectories
      .filter(integrationEnabled)
      .map(d => this.fs.getFilesRecursive(d, options)));
    const integration = integrationFiles.reduce((agg, c) => agg.concat(c), []);
    if (options && options.withRelativePaths === true) {
      // Windows returns \ as directory separator. shell.find returns /.
      const cwd = process.cwd().replace(/\\/g, '/');
      // Make all paths that reference the current working dir relative.
      // And any paths that reference the global install dir relative to local.
      return integration
        .map(f => f.replace(cwd, '.'))
        .map(f => f.replace(Integration.packageDirectory(), './node_modules/sentinel-ast'));
    }
    return integration;
  }

  static findFeatures(files) {
    return files.filter(f => f.match(/\.feature$/));
  }

  static findSupportJs(files) {
    return files.filter(f => f.match(/\/cucumber\/.*\.js$/));
  }

  static findCompose(files) {
    return files.filter(f => f.match(/docker-compose\.yml$/));
  }

  static findIntegration(files) {
    return files.filter(f => f.match(/integration\.js$/));
  }

  async intialize(moduleDirectory) {
    const subDirectoryList = await this.fs
      .getDirectoriesRecursive(moduleDirectory, { nameFilter: n => n !== 'node_modules' && !n.startsWith('.') });
    const templateFiles = await Promise.all(subDirectoryList
      .map(d => this.fs.getFiles(d, { nameFilter: f => f.includes('.template.') })));
    await Promise.all(templateFiles
      .filter(l => l)
      .reduce((agg, cur) => agg.concat(cur), [])
      .map(async (file) => {
        if (file.includes('.template.env')) {
          const input = await this.fs.readFile(file, { encoding: 'utf8' });
          this.envConsolidate += `\n${input}`;
        } else if (file.includes('.template.feature')) {
          await this.fs.copyFile(file, this.featureDir);
        } else if (file.includes('.template.json')) {
          await this.fs.copyFile(file, this.userDirectory);
        }
      }));
    await this.writeConfigFile(path.join(this.userDirectory, 'config.env'), this.envConsolidate);
  }

  async writeConfigFile(file, contents) {
    return this.fs.appendFile(file, contents, { flag: 'w+' });
  }
}

module.exports = Integration;
