/* eslint-disable no-underscore-dangle, no-console */

const path = require('path');
const { execSync } = require('child_process');
const Files = require('./filesystem');

class Npm {
  constructor() {
    this.fs = new Files();
    this.filterOptions = { nameFilter: n => n !== 'node_modules' && !n.startsWith('.') };
  }

  async installForSubdirectories(directory) {
    const subDirectoryList = await this.fs.getDirectories(directory, this.filterOptions);
    const packageDirs = await Promise.all(subDirectoryList
      .map(d => this.fs.exists(path.join(d, 'package.json'))
        .then(exists => ({ dir: d, isNodePackage: exists }))));
    packageDirs
      .filter(d => d.isNodePackage)
      .map(d => d.dir)
      .forEach((dir) => {
        if (dir !== directory) {
          console.log(`Performing "npm install" inside ./${path.relative(directory, dir)}`);
          Npm.install(dir);
        }
      });
  }

  static install(where) {
    execSync(`cd ${where} && npm install`, { env: process.env, stdio: 'inherit' });
  }

  async uninstallForSubdirectories(directory) {
    const subDirectoryList = await this.fs.getDirectories(directory, this.filterOptions);
    const packageDirs = await Promise.all(subDirectoryList
      .map(d => path.join(d, 'package.json'))
      .map(d => this.fs.exists(d).then(exists => ({ dir: d, isNodePackage: exists }))));
    packageDirs
      .filter(d => d.isNodePackage)
      .map(d => d.dir)
      .forEach((dir) => {
        if (dir !== directory) {
          console.log(`Performing "npm uninstall" inside ./${path.relative(directory, dir)}`);
          Npm.uninstall(directory);
        }
      });
  }

  static uninstall(dir) {
    execSync(`cd ${dir}  && rm -rf node_modules`, { env: process.env, stdio: 'inherit' });
  }
}

module.exports = Npm;
