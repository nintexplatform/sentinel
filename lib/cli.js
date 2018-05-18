const figlet = require('figlet');
const SentinelConfig = require('./config-sentinel');
const EnvConfig = require('./config-env');
const DockerCompose = require('./docker-compose');
const Integration = require('./integration');
const { promisify } = require('./promisify');

class CLI {
  constructor() {
    this.int = new Integration();
    this.configrc = new SentinelConfig();
    this.whitelistedIntegrations = [];
    this.additionalServices = [];
    this.readConfig = async () => {
      this.config = await this.configrc.readFile();
      this.additionalServices = this.config
        && this.config.integrations
        && Array.isArray(this.config.integrations.customServices)
        ? this.config.integrations.customServices : [];
      this.whitelistedIntegrations = this.config
        && this.config.integrations
        && Array.isArray(this.config.integrations.whitelist)
        ? this.config.integrations.whitelist : [];
      const configenv = new EnvConfig(this.config.configEnv);
      await configenv.ensureFileIfRequired();
    };
  }

  async init() {
    await this.int.intialize(Integration.integrationDirectory());
    await this.configrc.ensureFile();
  }

  async runCompose(composeCommand, composeArgs) {
    await this.readConfig();
    const files = await this.int.getFiles({
      whitelistedIntegrations: this.whitelistedIntegrations,
    });
    const composeFiles = Integration
      .findCompose(files)
      .concat(this.additionalServices);

    if (composeCommand === undefined) {
      throw new Error('docker-compose command required. e.g. run-compose ps');
    }
    const dc = new DockerCompose(composeFiles, [], Integration.integrationDirectory());
    return dc[composeCommand](...composeArgs);
  }

  async runCucumber(cucumberArgs) {
    await this.readConfig();
    const featureDir = process.env.FEATURE_DIR || './features/';

    // 1. require support files for each module)
    let files = await this.int.getFiles({
      withRelativePaths: true,
      whitelistedIntegrations: this.whitelistedIntegrations,
    });
    cucumberArgs.push(...Integration.findSupportJs(files)
      .reduce((a, f) => a.concat('--require', f), [])
      .concat('--require', featureDir)
      .concat('-t', '~@Template'));

    // 2. Bootstrap modules
    files = await this.int.getFiles({
      whitelistedIntegrations: this.whitelistedIntegrations,
    });
    Integration.findIntegration(files)
      .map(f => require(f)) // eslint-disable-line global-require, import/no-dynamic-require
      .filter(m => m.cucumberArgs)
      .forEach((m) => {
        cucumberArgs.push(...m.cucumberArgs());
      });

    const composeFiles = Integration.findCompose(files)
      .concat(this.additionalServices);
    const dc = new DockerCompose(composeFiles, [], Integration.integrationDirectory());
    return Promise.resolve()
      .then(() => dc.up('--build', '-d'))
      .then(() => dc.run('node', './node_modules/.bin/cucumber.js', ...cucumberArgs));
  }

  async startServices() {
    await this.readConfig();
    const files = await this.int.getFiles({
      whitelistedIntegrations: this.whitelistedIntegrations,
    });
    const composeFiles = Integration.findCompose(files)
      .concat(this.additionalServices);
    const dc = new DockerCompose(composeFiles, [], Integration.integrationDirectory());
    return dc.up('--build', '-d');
  }

  async stopServices() {
    await this.readConfig();
    const files = await this.int.getFiles({
      whitelistedIntegrations: this.whitelistedIntegrations,
    });
    const composeFiles = Integration.findCompose(files)
      .concat(this.additionalServices);
    const dc = new DockerCompose(composeFiles, [], Integration.integrationDirectory());
    return dc.down();
  }

  static genAscii() {
    return promisify(cb => figlet.text('sentinel', {
      font: 'Colossal',
      horizontalLayout: 'fitted',
      verticalLayout: 'default',
    }, cb));
  }
}

module.exports = CLI;
