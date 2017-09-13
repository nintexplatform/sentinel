const path = require('path');
const Npm = require('./npm');

const root = path.join(__dirname, '..', 'integration');
const npm = new Npm();
npm.uninstallForSubdirectories(root);