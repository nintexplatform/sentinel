const fs = require('fs');

const reportDir = process.env.CUCUMBER_REPORT_DIR || './report';
try {
    fs.mkdirSync(reportDir);
} catch (err) {
    if (err.code !== 'EEXIST')
        throw err;
}

module.exports = {
    cucumberArgs: () => ['-f', `json:${reportDir}/cucumber_report.json`],
};