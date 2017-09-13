const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process');
const { getDirectoriesRecursive, getDirectories } = require('./filesystem');
const shell = require('shelljs');

class Npm {
    constructor() {
        // We should add a command line arg or Env var to set this
        this.userDirectory = process.cwd();
        this.featureDir = process.env.FEATURE_DIR || path.join(this.userDirectory, 'features');
        this.envConsolidate = '# These are the environment variables used in the tests container';
    }

    intializeRecursive(directory) {
        const subDirectoryList = getDirectoriesRecursive(directory, d => d !== 'node_modules');
        subDirectoryList.forEach((where) => {
            fs.readdirSync(where)
                .filter(f => f.includes('.template.'))
                .forEach((file) => {
                    const filePath = path.join(where, file);
                    this._doIntialize(filePath.toString());
                });
        });
        Npm._writeConfigFile(path.join(this.userDirectory, 'config.env'), this.envConsolidate);
        console.log('Initialization Completed!');
    }

    installForSubdirectories(directory){
        const subDirectoryList = getDirectories(directory, (d) => d !== 'node_modules');
        subDirectoryList
            .filter(d => fs.existsSync(path.join(d, 'package.json')))
            .forEach((dir) => {
                if (dir !== directory) {
                    console.log(`Performing "npm install" inside ./${path.relative(directory, dir)}`);
                    Npm.install(dir);
                }
            });
    }

    static install(where){
        execSync(`cd ${where} && npm install`, { env: process.env, stdio: 'inherit' })
    }

    uninstallForSubdirectories(directory){
        const subDirectoryList = getDirectories(directory, (d) => d !== 'node_modules');
        subDirectoryList
            .filter(d => fs.existsSync(path.join(d, 'package.json')))
            .forEach((dir) => {
                if (dir !== directory){
                    console.log(`Performing "npm uninstall" inside ./${path.relative(directory, dir)}`);
                    this.uninstall(directory);
                }
            });
    }
    
    static uninstall(dir){
        execSync(`cd ${dir}  && rm -rf node_modules`, { env: process.env, stdio: 'inherit' });
    }

    _doIntialize(filePath) {
        const silentState = shell.config.silent
        shell.config.silent = true;
        if (filePath.includes('.template.env')) {
            const input = fs.readFileSync(filePath, { encoding: 'utf8' });
            this.envConsolidate += `\n${input}`;
        } else if (filePath.includes('.template.feature')) {
            shell.cp(filePath, this.featureDir);
        } else if (filePath.includes('.template.json')) {
            shell.cp(filePath, this.userDirectory);
        }
        shell.config.silent = silentState;
    }

    static _writeConfigFile(file, contents) {
        fs.appendFileSync(file, contents, { flag: 'w+' });
    }
}

module.exports = Npm;