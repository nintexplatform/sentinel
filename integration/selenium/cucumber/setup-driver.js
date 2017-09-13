/* eslint
   new-cap: 0,
   func-names: 0,
   prefer-arrow-callback: 0
*/

const webdriver = require('selenium-webdriver');
const proxy = require('selenium-webdriver/proxy');
const path = require('path');
const { URL } = require('url');

function parseTimeout(val, ifNanValue) {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
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
    remoteSeleniumcapabilities: process.env.SELENIUM_REMOTE_CAPABILITY
};
// console.log(JSON.stringify(env, null, 2));

function configureDriver() {

    // Phase-I: To enable ZAP Tests to run only on Chrome Browser.
    const proxyTestcapabilities = {
        browserName: `${env.browser}`,
        chromeOptions: {
            excludeSwitches: ['ignore-certificate-errors'],
        },
    };

    // Initate WebDriver Object based on Environment - Current values - local. Else always points to BrowserStack
    if (env.executionEnv === 'local') {
        this.driver = new webdriver.Builder()
            .forBrowser(env.browser)
            .build();
        this.driver.manage().window().setSize(1920, 1080);
    } else if (env.executionEnv === 'proxy') {
        const url = new URL(env.proxyURL);
        this.driver = new webdriver.Builder()
            .forBrowser(env.browser)
            .withCapabilities(proxyTestcapabilities)
            .setProxy(proxy.manual({ http: `${url.host}` }))
            .build();
        this.driver.manage().window().setSize(1920, 1080);
    } else if (env.executionEnv === 'remote') {
        if (env.remoteSeleniumcapabilities) {
            const remoteSeleniumcapabilitiesParams = JSON.parse(require('fs').readFileSync(env.remoteSeleniumcapabilities, 'utf8'));
        }
        this.driver = new webdriver.Builder()
            .usingServer(`${env.remoteUrl}`)
            .withCapabilities(remoteSeleniumcapabilitiesParams)
            .build();
        this.driver.manage().window().maximize();
    }
    this.getDriver = () => this.driver;

    return this.driver.manage().timeouts().pageLoadTimeout(env.pageLoadTimeout);
}

function stopDriver() {
    return this.driver.quit();
}

function saveScreenshot(scenario) {
    if (!scenario.isFailed()) {
        return Promise.resolve();
    }
    return this.driver.takeScreenshot()
        .then(data => scenario.attach(new Buffer(data, 'base64'), 'image/png'));
}

module.exports = function () {
    this.Before(configureDriver);
    this.After(stopDriver);
    this.After(saveScreenshot);
    this.BeforeScenario(function (scenario) {
        env.testrunname = scenario.getName();
    });
};