const path = require('path');
const Npm = require('./npm');

const root = path.join(__dirname, '..', 'integration');
Npm.installForSubdirectories(root);
