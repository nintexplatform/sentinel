/* eslint
   no-console: 0
*/

const path = require('path');
const jsdom = require('jsdom');
const slackr = require('slackr');

const { JSDOM } = jsdom;
const slackFlag = process.env.SLACK_FEATURE_FLAG || 'OFF';
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
        mrkdwn_in: ['text', 'fallback'],
      },
    ],
  };

  const response = await slackr(data);
  if (response.code === 200) {
    console.log('Test results has been posted on Slack');
  } else {
    console.log(`Error: ${response.body}`);
  }
}

async function writeMessageToSlack() {
  if (slackFlag === 'ON') {
    const dom = await JSDOM.fromFile(output);
    const { document } = dom.window;
    const pass = document.documentElement.getElementsByClassName('label label-success')[1];
    const fail = document.documentElement.getElementsByClassName('label label-danger')[1];
    const skipped = document.documentElement.getElementsByClassName('label label-warning')[1];
    const envVar = document.documentElement.querySelectorAll('strong');
    const status = {
      passCount: pass ? pass.textContent : 0,
      failCount: fail ? fail.textContent : 0,
      skippedCount: skipped && skipped.getAttribute('title') === 'scenarios' ? skipped.textContent : 0,
    };
    status.total = parseInt(status.passCount, 10)
      + parseInt(status.failCount, 10)
      + parseInt(status.skippedCount, 10);
    envVar.forEach((env) => {
      const [key, val] = env.parentNode.textContent.trim().split(':');
      status[key] = val;
    });
    const statusMsg = `Run Stats for ${status.total} Scenarios: :white_check_mark: ${status.passCount} passed, :x: ${status.failCount} failed, :heavy_minus_sign: ${status.skippedCount} skipped\n`;
    await postSlack(statusMsg);
  }
}

// eslint-disable-next-line func-names
module.exports = function () {
  this.AfterFeatures(writeMessageToSlack);
};
