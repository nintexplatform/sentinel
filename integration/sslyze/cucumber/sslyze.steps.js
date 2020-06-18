/* eslint
   new-cap: 0,
   func-names: 0,
   prefer-arrow-callback: 0,
   no-console: 0,
*/
const { URL } = require('url');
const env = require('./environment');
const Sslyze = require('../pages/sslyze');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const { assert } = chai;
const errorMessage = 'Vulnerability detected';

const cachedOutput = {};

const getHost = function (url) {
  if (url.startsWith('http:') || url.startsWith('https:')) {
    return new URL(url).host;
  }
  return url;
};

const getSslyzeOutput = async function (hostname) {
  const host = getHost(hostname);
  if (!cachedOutput[host]) {
    const sslyze = new Sslyze();
    const results = await sslyze.startTheProcess(host);
    const ciphersSupported = sslyze.listAcceptedCipherSuites();
    const protocolSupported = ciphersSupported.reduce((protocols, cipherSuite) => {
      if (protocols.includes(cipherSuite.type)) {
        return protocols;
      }
      return protocols.concat(cipherSuite.type);
    }, []);
    cachedOutput[host] = {
      sslyzeOutput: results,
      ciphersSupported,
      protocolSupported,
    };
    console.log(cachedOutput[host].sslyzeOutput.stdOut);
  }
  return cachedOutput[host];
};

module.exports = function () {
  this.When(/^the SSLyze command is run against the host$/, { timeout: env.longTimeout }, async function () {
    const output = await getSslyzeOutput(env.serverHostName);
    Object.assign(this, output);
  });

  this.When(/^the SSLyze command is run against the "([^"]*)"$/, { timeout: env.longTimeout }, async function (host) {
    const output = await getSslyzeOutput(host);
    Object.assign(this, output);
  });

  this.Then(/^the SSLyze output must contain the text "([^"]*)"$/, function (arg1) {
    assert(this.sslyzeOutput.stdOut.indexOf(arg1) !== -1, `${errorMessage}: SSLyze scan did not contain any line matching - '${arg1}'`);
  });

  this.Then(/^the SSLyze output must contain a line that matches (.*)$/, async function (regex) {
    assert(this.sslyzeOutput.stdOut.search(regex) !== -1, `${errorMessage}: SSLyze scan did not contain any line matching - '${regex}'`);
  });

  this.Then(/^the minimum key size must be (.*) bits$/, function (arg1) {
    assert(this.ciphersSupported.length > 0, `${errorMessage}: The host does not support any valid ciphers`);

    this.ciphersSupported.forEach((ciphers) => {
      assert(ciphers.size >= arg1, `${errorMessage}: ${ciphers.name} has key size less than ${arg1} bits`);
    });
  });

  this.Then(/^the following protocols must not be supported$/, async function (table) {
    assert(this.protocolSupported.length > 0, `${errorMessage}: The host does not support any valid protocols`);
    const data = table.hashes();
    const matches = data
      .map(d => Sslyze.formatProtocol(d.protocol))
      .filter(d => this.protocolSupported.includes(d));
    assert.deepEqual(matches, [], `${errorMessage}: protocols must not be supported`);
  });

  this.Then(/^the following protocols must be supported$/, async function (table) {
    assert(this.protocolSupported.length > 0, `${errorMessage}: The host does not support any valid protocols`);
    const data = table.hashes();
    const matches = data
      .map(d => Sslyze.formatProtocol(d.protocol))
      .filter(p => !this.protocolSupported.includes(p));
    assert.deepEqual(matches, [], `${errorMessage}: protocols must be supported`);
  });

  this.Then(/^any of the following ciphers must be supported$/, async function (table) {
    assert(this.ciphersSupported.length > 0, `${errorMessage}: The host does not support any valid ciphers`);

    const data = table.hashes();
    for (let i = 0; i < data.length; i += 1) {
      assert(this.ciphersSupported.some(ciphers => ciphers.name === data[i].ciphers), `${errorMessage}: ${data[i].ciphers} cipher is not supported`);
    }
  });

  this.Then(/^the following ciphers must not be supported$/, async function (table) {
    assert(this.ciphersSupported.length > 0, `${errorMessage}: The host does not support any valid ciphers`);

    const data = table.hashes();
    for (let i = 0; i < data.length; i += 1) {
      assert(!this.ciphersSupported.some(ciphers => ciphers.name === data[i].ciphers), `${errorMessage}: ${data[i].ciphers} cipher is supported`);
    }
  });

  this.Then(/^the certificate has a matching host name$/, function () {
    assert(this.sslyzeOutput.stdOut.indexOf(`${env.serverHostName.replace(/^https?:\/\//, '')}`) !== -1, `${errorMessage}: None of Certificate has matching hostname - ${env.serverHostName.replace(/^https?:\/\//, '')}`);
  });

  this.Then(/^the certificate is in major root CA trust stores$/, function () {
    assert(this.sslyzeOutput.stdOut.search('OK - Certificate is trusted') !== -1, `${errorMessage}: Found Certificate that is not trusted`);
    assert(this.sslyzeOutput.stdOut.search('Certificate is not trusted') === -1, `${errorMessage}: Found Certificate that is not trusted`);
  });
};
