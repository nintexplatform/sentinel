/* eslint
   new-cap: 0,
   func-names: 0,
   prefer-arrow-callback: 0
*/

const webdriver = require('selenium-webdriver');
const proxy = require('selenium-webdriver/proxy');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const { URL } = require('url');
const rp = require('request-promise-native');

function parseTimeout(val, ifNanValue) {
  const parsed = parseInt(val, 10);
  if (isNaN(parsed)) { // eslint-disable-line no-restricted-globals
    return ifNanValue;
  }
  return parsed;
}

const env = {
  browser: process.env.SELENIUM_BROWSER || 'chrome',
  remoteUrl: process.env.SELENIUM_REMOTE_URL || 'http://selenium:4444/wd/hub',
  executionEnv: process.env.EXECUTION_ENVIRONMENT || 'local',
  proxyURL: process.env.ZAP_SERVER_URL || 'http://zap:8080',
  pageLoadTimeout: parseTimeout(process.env.WEBDRIVER_PAGE_TIMEOUT, 45000),
  remoteSeleniumcapabilities: process.env.SELENIUM_REMOTE_CAPABILITY,
  waitForSeleniumTimeout: parseTimeout(process.env.SELENIUM_SERVICE_START_TIMEOUT, 45000),
};

async function waitForSeleniumDriver() {
  let resp;
  let timedOut = false;
  const timeout = Date.now() + env.waitForSeleniumTimeout;
  const url = new URL(env.remoteUrl);
  do {
    try {
      resp = await rp({ // eslint-disable-line no-await-in-loop
        uri: url.href,
        resolveWithFullResponse: true,
      });
    } catch (e) {
      // Ignore connection errors because we are waiting for the container to start
      resp = { statusCode: 418 };
      await new Promise(r => setTimeout(r, 10000)); // eslint-disable-line no-await-in-loop
    }
    timedOut = Date.now() > timeout;
    if (timedOut) {
      throw new Error('Timeout waiting for request to succeed');
    }
  } while (resp.statusCode !== 200);
}

function createDriver() {
  let builder = new webdriver.Builder()
    .forBrowser(env.browser);

  if (env.executionEnv === 'proxy') {
    const url = new URL(env.proxyURL);
    const options = new chrome.Options();
    builder = builder
      .withCapabilities(options.toCapabilities())
      .setProxy(proxy.manual({ http: `${url.host}` }));
  }

  if (env.executionEnv === 'remote') {
    let remoteSeleniumcapabilitiesParams;
    if (env.remoteSeleniumcapabilities) {
      remoteSeleniumcapabilitiesParams = JSON.parse(fs.readFileSync(env.remoteSeleniumcapabilities, 'utf8'));
    }
    builder = builder.withCapabilities(remoteSeleniumcapabilitiesParams);
  }

  const driver = builder.build();


  if (env.executionEnv !== 'remote') {
    driver.manage().window().setSize(1920, 1080);
  } else {
    driver.manage().window().maximize();
  }
  driver.manage().timeouts().pageLoadTimeout(env.pageLoadTimeout);
  return driver;
}

function configureDriver() {
  let driver;
  let hasDriver = false;
  Object.defineProperty(this, 'hasDriver', {
    get: () => hasDriver,
    set: (value) => {
      if (hasDriver && !value) {
        driver = undefined;
      }
      hasDriver = value;
    },
    configurable: true,
    enumerable: true,
  });
  Object.defineProperty(this, 'driver', {
    get: () => {
      if (!hasDriver) {
        driver = createDriver();
        hasDriver = !!driver;
      }
      return driver;
    },
    configurable: true,
    enumerable: true,
  });
  this.getDriver = () => this.driver;
}

async function stopDriver() {
  if (this.hasDriver) {
    await this.driver.quit();
  }
  this.hasDriver = false;
}

async function saveScreenshot(scenario) {
  if (!this.hasDriver) {
    return;
  }
  if (!scenario.isFailed()) {
    return;
  }
  // On a failed scenario, take a screenshot
  try {
    const data = await this.driver.takeScreenshot();
    scenario.attach(Buffer.from(data, 'base64'), 'image/png');
  } catch (e) {
    // Do not report another error here if the driver is unavailable.
  }
}

module.exports = function () {
  this.registerHandler('BeforeFeatures', {
    timeout: env.waitForSeleniumTimeout,
  }, waitForSeleniumDriver);
  this.Before(configureDriver);
  this.After(stopDriver);
  this.After(saveScreenshot);
  this.BeforeScenario(function (scenario) {
    env.testrunname = scenario.getName();
  });
};
