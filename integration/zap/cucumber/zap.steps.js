/* eslint
   new-cap: 0,
   func-names: 0,
   prefer-arrow-callback: 0,
*/
const assert = require('assert');
const ZapCore = require('../pages/zap-core');
const env = require('./environment');

let url = '';
const zap = new ZapCore();

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForResult(result, timeout, action) {
  const now = Date.now();
  let done = await action();
  while (done !== result) {
    if (timeout > 0 && Date.now() > (now + timeout)) {
      throw new Error('Timeout waiting for zap scan to complete');
    }
    await sleep(1000); // eslint-disable-line no-await-in-loop
    done = await action(); // eslint-disable-line no-await-in-loop
  }
}

module.exports = function () {
  this.Then(/^the application is spidered/, { timeout: env.longTimeout }, async function () {
    zap.setsetOptionMaxDepth(env.maxDepth);
    zap.setOptionThreadCount(env.threadCount);

    url = await this.driver.getCurrentUrl();

    const resp = await zap.startScan(url);
    const scanID = resp.scan;
    await waitForResult(true, env.scanTimeout, () => zap.checkSpiderStatus(scanID));
  });

  this.Then(/^the passive scanner is enabled/, async function () {
    await zap.startPassiveScan();
  });

  this.Then(/^the active scanner is run/, { timeout: env.longTimeout }, async function () {
    const resp = await zap.startActiveScan(url);
    const scanID = resp.scan;
    await waitForResult(true, env.scanTimeout, () => zap.checkActiveScanStatus(scanID));
  });

  this.Then(/^a new scanning session/, async function () {
    await zap.newScanSession();
  });

  this.Then(/^the navigation and spider status is reset/, async function () {
    await zap.stopAllSpiderScans();
    await zap.removeAllSpiderScans();
  });

  this.Then(/^a scanner with all policies disabled/, async function () {
    await zap.disableAllActiveScanners();
  });

  this.Then(/^all existing alerts are deleted/, async function () {
    await zap.disableAllActiveScanners();
  });

  this.Then(/^no higher risk vulnerabilities should be present/, async function () {
    const result = await zap.checkForAlerts();
    assert(!(result.includes('High (')), 'We have HIGH security alert reported by ZAP');
  });

  this.Then(/^the "([^"]+)" policy is enabled with "([^"]+)" threshold and "([^"]+)" attack strength$/, async function (policy, threshold, alert) {
    switch (policy.toString().trim().toLowerCase()) {
      case 'sql injection':
        await zap.addScanPolicy('sql+injection', threshold, alert);
        break;
      case 'cross site scripting':
        await zap.addScanPolicy('cross+site+scripting', threshold, alert);
        break;
      case 'path traversal':
        await zap.addScanPolicy('path+traversal', threshold, alert);
        break;
      case 'remote file inclusion':
        await zap.addScanPolicy('remote+file+inclusion', threshold, alert);
        break;
      case 'server side include':
        await zap.addScanPolicy('server+side+include', threshold, alert);
        break;
      case 'server side code injection':
        await zap.addScanPolicy('server+side+code+injection', threshold, alert);
        break;
      case 'remote os command injection':
        await zap.addScanPolicy('remote+os+command+injection', threshold, alert);
        break;
      case 'crlf injection':
        await zap.addScanPolicy('crlf+injection', threshold, alert);
        break;
      case 'external redirect':
        await zap.addScanPolicy('external+redirect', threshold, alert);
        break;
      case 'source code disclosure':
        await zap.addScanPolicy('source+code+disclosure', threshold, alert);
        break;
      case 'shell shock':
        await zap.addScanPolicy('shell+shock', threshold, alert);
        break;
      case 'ldap injection':
        await zap.addScanPolicy('ldap+injection', threshold, alert);
        break;
      case 'xpath injection':
        await zap.addScanPolicy('xpath+injection', threshold, alert);
        break;
      case 'xml external entity':
        await zap.addScanPolicy('xml+external+entity', threshold, alert);
        break;
      case 'padding oracle':
        await zap.addScanPolicy('padding+oracle', threshold, alert);
        break;
      case 'insecure http methods':
        await zap.addScanPolicy('insecure+http+methods', threshold, alert);
        break;
      default:
      // Do Nothing For Now
    }
  });
};
