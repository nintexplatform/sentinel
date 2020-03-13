const assert = require('assert');
const env = require('./environment');
const Snyk = require('../pages/snyk.io');
const fs = require('fs-extra');

module.exports = function () {
  this.Before(function () {
    this.snykOutput = null;
  });

  this.When(/^the SNYK command is run in the directory: (.+)$/, { timeout: env.longTimeout }, async function (directory) {
    const snyk = new Snyk();
    this.snykOutput = await snyk.runScanInDirectory(directory);
  });

  this.When(/^the SNYK command is run against the project dependencies$/, { timeout: env.longTimeout }, async function () {
    const snyk = new Snyk();
    this.snykOutput = await snyk.runScanInProjectDirectory();
  });

  this.Then(/^there should not be any vulnerable paths found$/, async function () {
    if (this.snykOutput) {
      assert(
        !this.snykOutput.body.vulnerabilities
          .some(vuln => env.snykFailureLevels.includes(vuln.severity))
        , 'Vulnerability detected.',
      );
    }
  });

  this.After(async function (scenario) {
    if (this.snykOutput) {
      // Generate snyk html reports
      try {
        var tags = scenario.getTags().map(e => e.getName()).join('-');
        const reportDir = process.env.CUCUMBER_REPORT_DIR || './report/';
        var reportName = `${reportDir}snyk-report-${tags}.html`;
        fs.writeFileSync(reportName, this.snykOutput.body.report);
      } catch (err) {
        console.log (`Error generating Snyk HTML report : ${reportName} (${err})`)
      }
      
      scenario.attach(JSON.stringify(this.snykOutput.body.vulnerabilities,null, '\t'));
    }
  });
};
