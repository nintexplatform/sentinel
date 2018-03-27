/* eslint
   new-cap: 0,
   func-names: 0,
   prefer-arrow-callback: 0,
   no-console: 0
*/

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const reporter = require('cucumber-html-reporter');

const reportDirectory = process.env.CUCUMBER_REPORT_DIR || './report/';

function bootstrap() {
  shell.mkdir('-p', reportDirectory);
}

function writeReport() {
  try {
    const logTimeStamp = new Date().toISOString();
    const jsonFile = path.join(reportDirectory, `cucumber_report_${logTimeStamp}.json`);
    const output = path.join(reportDirectory, `cucumber_report_${logTimeStamp}.html`);
    const stat = fs.statSync(jsonFile);
    if (stat.isFile()) {
      console.log(`Writing a report to ${output}`);
      const options = {
        theme: 'bootstrap',
        jsonFile,
        output,
        reportSuiteAsScenarios: true,
      };
      reporter.generate(options);
    }
  } catch (e) {
    // If we cant read the file, then don't write the report
    console.log('Not writing report file. Cannot read cucumber_report.json');
  }
}

module.exports = function () {
  this.BeforeFeatures(bootstrap);
  this.AfterFeatures(writeReport);
};
