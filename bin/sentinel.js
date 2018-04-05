#!/usr/bin/env node
/* eslint-disable no-console */

const program = require('commander');
const pkg = require('./../package.json');
const CLI = require('../lib/cli');

const cli = new CLI();

program
  .version(pkg.version);

program
  .command('init')
  .description('Initializes the templates from core framework repo')
  .action(async () => {
    const ascii = await CLI.genAscii();
    console.log(ascii);
    await cli.init();
    console.log('Initialization Completed!');
  })
  .on('--help', () => {
    console.log('\n  Examples:');
    console.log();
    console.log('    $ sentinel init');
    console.log();
  });

program
  .command('run-compose <COMMAND> [ARGS...]')
  .description('Runs docker compose commands')
  .action((cmd, args) => cli.runCompose(cmd, args)
    .catch((ex) => {
      console.log(ex);
      process.exit(1);
    }))
  .on('--help', () => {
    console.log('\n  Examples:');
    console.log();
    console.log('    $ sentinel run-compose ps');
    console.log();
  });

const cucumberArgs = [];
const gatherCucumberArgs = param => (val) => {
  cucumberArgs.push(param, val);
  return cucumberArgs;
};
program
  .command('run-cucumber [<DIR>|<FILE[:LINE]>...]')
  .description('Executes cucumber tests')
  .option('-n, --name', 'To specify a scenario by its name matching a regular expression', gatherCucumberArgs('--name'), cucumberArgs)
  .option('-r, --require <FILE|DIR>', 'To require support files before executing the features', gatherCucumberArgs('--require'), cucumberArgs)
  .option('-f, --format <TYPE[:PATH]>', 'To specify the format of the output', gatherCucumberArgs('--format'), cucumberArgs)
  .option('-fo, --format-options <JSON>', 'To pass in format options', gatherCucumberArgs('--format-options'), cucumberArgs)
  .option('-p, --profile <NAME>', 'To set the profile', gatherCucumberArgs('--profile'), cucumberArgs)
  .option('-t, --tags <EXPRESSION>', 'To run specific features or scenarios', gatherCucumberArgs('--tags'), cucumberArgs)
  .option('-c, --compiler <file_extension>:<module_name>', 'To transpile Step definitions and support files written in other languages to JS', gatherCucumberArgs('--compiler'), cucumberArgs)
  .option('-w, --world-parameters <JSON>', 'To pass in parameters to pass to the world constructor', gatherCucumberArgs('--world-parameters'), cucumberArgs)
  .action(args => cli.runCucumber(cucumberArgs.concat(args))
    .catch((ex) => {
      console.log(ex);
      process.exit(1);
    }))
  .on('--help', () => {
    console.log('\n  Examples:');
    console.log();
    console.log('    $ sentinel run-cucumber -t ~@Template -t ~@Manual');
    console.log();
  });

program
  .command('start-services')
  .description('Starts all the needed docker containers')
  .action(() => cli.startServices()
    .catch((ex) => {
      console.log(ex);
      process.exit(1);
    }))
  .on('--help', () => {
    console.log('\n  Examples:');
    console.log();
    console.log('    $ sentinel start-services');
    console.log();
  });

program
  .command('stop-services')
  .description('Stops all the needed docker containers')
  .action(() => cli.stopServices()
    .catch((ex) => {
      console.log(ex);
      process.exit(1);
    }))
  .on('--help', () => {
    console.log('\n  Examples:');
    console.log();
    console.log('    $ sentinel stop-services');
    console.log();
  });

program.parse(process.argv);

// Print Usage output to console when user doesn't provie any command
if (!process.argv.slice(2).length) program.outputHelp();
