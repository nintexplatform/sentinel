const DockerCompose = require('./docker-compose');
const Integration = require('./integration');
const figlet = require('figlet');
const { promisify } = require('./promisify');

class CLI {
  static init() {
    const int = new Integration();
    return int.intialize(Integration.integrationDirectory());
  }

  static async runCompose(composeCommand, composeArgs, userServices) {
    const int = new Integration();
    const additionalServices = Array.isArray(userServices) ? userServices : [];
    const files = await int.getFiles();
    const composeFiles = Integration
      .findCompose(files)
      .concat(additionalServices);

    if (composeCommand === undefined) {
      throw new Error('docker-compose command required. e.g. run-compose ps');
    }
    const dc = new DockerCompose(composeFiles, [], Integration.integrationDirectory());
    return dc[composeCommand](...composeArgs);
  }

  static async runCucumber(cucumberArgs, userServices) {
    const int = new Integration();
    const additionalServices = Array.isArray(userServices) ? userServices : [];
    const featureDir = process.env.FEATURE_DIR || './features/';

    // 1. require support files for each module)
    let files = await int.getFiles({ withRelativePaths: true });
    cucumberArgs.push(...Integration.findSupportJs(files)
      .reduce((a, f) => a.concat('--require', f), [])
      .concat('--require', featureDir)
      .concat('-t', '~@Template'));

    // 2. Bootstrap modules
    files = await int.getFiles();
    Integration.findIntegration(files)
      .map(f => require(f)) // eslint-disable-line global-require, import/no-dynamic-require
      .filter(m => m.cucumberArgs)
      .forEach((m) => {
        cucumberArgs.push(...m.cucumberArgs());
      });

    const composeFiles = Integration.findCompose(files)
      .concat(additionalServices);
    const dc = new DockerCompose(composeFiles, [], Integration.integrationDirectory());
    return Promise.resolve()
      .then(() => dc.up('--build', '-d'))
      .then(() => dc.run('node', './node_modules/.bin/cucumber.js', ...cucumberArgs));
  }

  static async startServices(userServices) {
    const int = new Integration();
    const additionalServices = Array.isArray(userServices) ? userServices : [];
    const files = await int.getFiles();
    const composeFiles = Integration.findCompose(files)
      .concat(additionalServices);
    const dc = new DockerCompose(composeFiles, [], Integration.integrationDirectory());
    return dc.up('--build', '-d');
  }

  static async stopServices(userServices) {
    const int = new Integration();
    const additionalServices = Array.isArray(userServices) ? userServices : [];
    const files = await int.getFiles();
    const composeFiles = Integration.findCompose(files)
      .concat(additionalServices);
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
