
const reportDir = process.env.CUCUMBER_REPORT_DIR || './report';

module.exports = {
    cucumberArgs: () => ['-f', `json:${reportDir}/cucumber_report.json`],
};