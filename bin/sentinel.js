#!/usr/bin/env node

const program = require('commander');
const pkg = require('./../package.json');
const CLI = require('../lib/cli');
const figlet = require('figlet');

program
  .version(pkg.version);

program
  .command('init')
  .description('Initializes the templates from core framework repo')
  .action(() => {
    genAscii();
    CLI.init();
  })
  .on('--help', () => {
    console.log('\n  Examples:');
    console.log();
    console.log('    $ sentinel init');
    console.log();
  });

program
  .command('run-compose [COMMAND] [ARGS...]')
  .description('Runs docker compose commands')
  .action(() => { CLI.runCompose(process.argv[3], process.argv.slice(4)); })
  .on('--help', () => {
    console.log('\n  Examples:');
    console.log();
    console.log('    $ sentinel run-compose ps');
    console.log();
  });

program
  .command('run-cucumber [<DIR | FILE[:LINE]>...]')
  .description('Executes cucumber tests')
  .option('-n, --name', 'To specify a scenario by its name matching a regular expression')
  .option('-r, --require <FILE|DIR>', 'To require support files before executing the features')
  .option('-f, --format <TYPE[:PATH]>', 'To specify the format of the output')
  .option('-fo, --format-options <JSON>', 'To pass in format options')
  .option('-p, --profile <NAME>', 'To set the profile')
  .option('-t, --tag <EXPRESSION>', 'To run specific features or scenarios')
  .option('-c, --compiler <file_extension>:<module_name>', 'To transpile Step definitions and support files written in other languages to JS')
  .option('-w, --world-parameters <JSON>', 'To pass in parameters to pass to the world constructor')
  .action(() => { CLI.runCucumber(process.argv.slice(3)); })
  .on('--help', () => {
    console.log('\n  Examples:');
    console.log();
    console.log('    $ sentinel run-cucumber -t ~@Template -t ~@Manual');
    console.log();
  });

program
  .command('start-services')
  .description('Starts all the needed docker containers')
  .option('-y, --yaml [FILE]', 'Additional services to start', (f, files) => files.concat(f), [])
  .action(cmd => CLI.startServices(cmd.yaml))
  .on('--help', () => {
    console.log('\n  Examples:');
    console.log();
    console.log('    $ sentinel start-services -y ./path/to/docker-compose.yml');
    console.log();
  });

program
  .command('stop-services')
  .description('Stops all the needed docker containers')
  .option('-y, --yaml [FILE]', 'Additional services to start', (f, files) => files.concat(f), [])
  .action(cmd => CLI.stopServices(cmd.yaml))
  .on('--help', () => {
    console.log('\n  Examples:');
    console.log();
    console.log('    $ sentinel stop-services -y ./path/to/docker-compose.yml');
    console.log();
  });

program.parse(process.argv);

// Print Usage output to console when user doesn't provie any command
if (!process.argv.slice(2).length) program.outputHelp();

function genAscii() {
  figlet.text('sentinel', {
    font: 'Colossal',
    horizontalLayout: 'fitted',
    verticalLayout: 'default',
  }, function (err, data) {
    if (err) {
      return (err);
    }
    console.log(data);
  });
}