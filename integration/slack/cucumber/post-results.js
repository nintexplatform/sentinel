// Usage: node ./post-results.js </location-to-cucumber-report.html>
const path = require('path');
const jsdom = require('jsdom');
const slackr = require('slackr');

const { JSDOM } = jsdom;
const slackFlag = process.env.SLACK_FEATURE_FLAG || 'OFF';
let status = {};
const reportDirectory = process.env.CUCUMBER_REPORT_DIR || './report/';
const output = path.join(reportDirectory, 'cucumber_report.html');

async function postSlack(message) {
    const data = {
            attachments: [
                {
                    title: 'Test Result',
                    text: `${message}`,
                    fallback: `${message}`,
                    color: 'good',
                    mrkdwn_in: ['text', 'fallback']
                }
            ]
    };

   await slackr(data).then(response => {
       if (response.code === 200){
           console.log ("Test resutls has been posted on Slack");
       } else {
           console.log (`Error: ${response.body}`);  
       } 
   });
}

async function writeMessageToSlack() {
    if (slackFlag === 'ON') {
      await JSDOM.fromFile(output).then((dom) => {
            const document = dom.window.document;
            const pass = document.documentElement.getElementsByClassName('label label-success')[1];
            status.passCount = ((pass) ? pass.textContent : 0);
            const fail = document.documentElement.getElementsByClassName('label label-danger')[1];
            status.failCount = ((fail) ? fail.textContent : 0);
            const skipped = document.documentElement.getElementsByClassName('label label-warning')[1];
            status.skippedCount = ((skipped) && (skipped.getAttribute('title') === 'scenarios') ? skipped.textContent : 0);
            status.total = parseInt(status.passCount, 10) + parseInt(status.failCount, 10) + parseInt(status.skippedCount, 10);

            const envVar = (document.documentElement.querySelectorAll('strong'));
            for (const env of envVar) {
                const str = env.parentNode.textContent.trim().split(':');
                status[str[0]] = str[1];
            }
      });
    }
    status = `Run Stats for ${status.total} Scenarios: :white_check_mark: ${status.passCount} passed, :x: ${status.failCount} failed, :heavy_minus_sign: ${status.skippedCount} skipped\n`;
    await postSlack(status);
}

module.exports = function () {
    this.AfterFeatures(writeMessageToSlack);
};