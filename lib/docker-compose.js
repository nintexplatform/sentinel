const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const merge = require('lodash.merge');

class DockerCompose {
    constructor(composeFiles, options, workingDir) {
        this.composeFiles = (composeFiles && Array.isArray(composeFiles)) ? composeFiles : [];
        this.options = (options && Array.isArray(options)) ? options : [];
        this.file = null;
        this.workingDir = workingDir || '.';
    }

    generateConfig(filePath) {
        const result = this.composeFiles.reduce((agg, f) => {
            const thisDir =  path.parse(path.resolve(f)).dir;
            const contents = fs.readFileSync(f, 'utf8')
                .replace(/##THIS_DIR##/g, thisDir)
                .replace(/##WORKING_DIR##/g, process.cwd());
            const config = yaml.safeLoad(contents);
            return merge(agg, config);
        }, {});

        const output = yaml.safeDump(result);
        fs.writeFileSync(filePath, output);
        this.file = filePath;
    }

    createCommand(cmd, args) {
        if (this.file === null) {
            this.generateConfig(path.join(this.workingDir, 'docker-compose.yml'));
        }
        return [
            'docker-compose',
            [ '-f', this.file ]
                .concat(this.options)
                .concat(cmd, args)
        ];
    }

    exec(cmd, args) {
        return new Promise((r, e) => {
            const [prog, progArgs] = this.createCommand(cmd, args);
            const child = spawn(prog, progArgs, {
                stdio: 'inherit',
            });
            child.on('error', e);
            child.on('close', r);
        });
    }

    up(...args) {
        return this.exec('up', args);
    }
    down(...args) {
        return this.exec('down', args);
    }
    run(...args) {
        return this.exec('run', args);
    }
    logs(...args) {
        return this.exec('logs', args);
    }
    ps(...args) {
        return this.exec('ps', args);
    }
}

module.exports = DockerCompose;