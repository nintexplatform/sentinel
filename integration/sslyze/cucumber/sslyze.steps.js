/* eslint
   new-cap: 0,
   func-names: 0,
   prefer-arrow-callback: 0,
   no-console: 0,
*/
const assert = require('assert');
const { URL } = require('url');
const env = require('./environment');
const Sslyze = require('../pages/sslyze');

module.exports = function () {
  this.When(/^the SSLyze command is run against the host$/, { timeout: env.longTimeout }, async function () {
    const url = new URL(env.serverHostName);
    const sslyze = new Sslyze();
    this.sslyzeOutput = await sslyze.startTheProcess(url.host);
    console.log(this.sslyzeOutput);
    this.ciphersSupported = sslyze.listAcceptedCipherSuites();
    this.protocolSupported = sslyze.listsupportedprotocols();
  });

  this.When(/^the SSLyze command is run against the "([^"]*)"$/, { timeout: env.longTimeout }, async function (host) {
    const sslyze = new Sslyze();
    this.sslyzeOutput = await sslyze.startTheProcess(host);
    console.log(this.sslyzeOutput);
    this.ciphersSupported = sslyze.listAcceptedCipherSuites();
    this.protocolSupported = sslyze.listsupportedprotocols();
  });

  this.Then(/^the SSLyze output must contain the text "([^"]*)"$/, function (arg1) {
    assert(this.sslyzeOutput.indexOf(arg1) !== -1);
  });

  this.Then(/^the SSLyze output must contain a line that matches (.*)$/, function (regex) {
    assert(this.sslyzeOutput.search(regex) !== -1);
  });

  this.Then(/^the minimum key size must be (.*) bits$/, function (arg1) {
    this.ciphersSupported.forEach((ciphers) => {
      assert(ciphers.size >= arg1, `${ciphers.name} has key size less than 128 bits`);
    });
  });

  this.Then(/^the following protocols must not be supported$/, async function (table) {
    const data = table.hashes();
    for (let i = 0; i < data.length; i += 1) {
      this.protocolSupported.forEach((protocol) => {
        if (protocol.name === data[i].protocol) {
          assert.equal(protocol.type, 'Rejected');
        }
      });
    }
  });

  this.Then(/^the following protocols must be supported$/, async function (table) {
    const data = table.hashes();
    for (let i = 0; i < data.length; i += 1) {
      this.protocolSupported.forEach((protocol) => {
        if (protocol.name === data[i].protocol) {
          assert.equal(protocol.type, 'Supported');
        }
      });
    }
  });

  this.Then(/^any of the following ciphers must be supported$/, async function (table) {
    const data = table.hashes();
    for (let i = 0; i < data.length; i += 1) {
      assert(this.ciphersSupported.some(ciphers => ciphers.name === data[i].ciphers));
    }
  });

  this.Then(/^the following ciphers must not be supported$/, async function (table) {
    const data = table.hashes();
    for (let i = 0; i < data.length; i += 1) {
      assert(!this.ciphersSupported.some(ciphers => ciphers.name === data[i].ciphers));
    }
  });

  this.Then(/^the certificate has a matching host name$/, function () {
    assert(this.sslyzeOutput.indexOf(`${env.serverHostName}`) !== -1);
  });

  this.Then(/^the certificate is in major root CA trust stores$/, function () {
    assert(this.sslyzeOutput.search('OK - Certificate is trusted') !== -1);
    assert(this.sslyzeOutput.search('Certificate is not trusted') === -1);
  });
};
