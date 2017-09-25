const Npm = require('./npm');
const Integration = require('./integration');

const npm = new Npm();
npm.installForSubdirectories(Integration.integrationDirectory());
