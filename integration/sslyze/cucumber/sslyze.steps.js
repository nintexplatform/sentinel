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
const assert = chai.assert;
const errorMessage = 'Vulnerability detected';

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
        assert(this.sslyzeOutput.indexOf(arg1) !== -1, `${errorMessage}: SSLyze scan didnot contain any line matching - '${arg1}'`);
    });

    this.Then(/^the SSLyze output must contain a line that matches (.*)$/, async function (regex) {
        assert.equal((this.sslyzeOutput.search(regex) !== -1), `${errorMessage}: SSLyze scan didnot contain any line matching - '${regex}'`);
    });

    this.Then(/^the minimum key size must be (.*) bits$/, function (arg1) {
        assert(this.ciphersSupported.length > 0 , `${errorMessage}: The host does not support any valid ciphers`);
    
        this.ciphersSupported.forEach((ciphers) => {
            assert(ciphers.size >= arg1, `${errorMessage}: ${ciphers.name} has key size less than 128 bits`);
        });
    });

    this.Then(/^the following protocols must not be supported$/, async function (table) {
        assert(this.protocolSupported.length > 0, `${errorMessage}: The host does not support any valid protocols`);

        const data = table.hashes();
        for (let i = 0; i < data.length; i += 1) {
            this.protocolSupported.forEach((protocol) => {
                if (protocol.name === data[i].protocol) {
                    assert.equal(protocol.type, 'Rejected',`${errorMessage}: ${protocol.name} should not be supported by host`);
                }
            });
        }
    });

    this.Then(/^the following protocols must be supported$/, async function (table) {
        assert(this.protocolSupported.length > 0 , `${errorMessage}: The host does not support any valid protocols`);

        const data = table.hashes();
        for (let i = 0; i < data.length; i += 1) {
            this.protocolSupported.forEach((protocol) => {
                if (protocol.name === data[i].protocol) {
                    assert.equal(protocol.type, 'Supported', `${errorMessage}: ${protocol.name} should be supported by host`);
                }
            });
        }
    });

    this.Then(/^any of the following ciphers must be supported$/, async function (table) {
        assert(this.ciphersSupported.length > 0, `${errorMessage}: The host does not support any valid ciphers`);

        const data = table.hashes();
        for (let i = 0; i < data.length; i += 1) {
            assert(this.ciphersSupported.some(ciphers => ciphers.name === data[i].ciphers), `${errorMessage}: ${data[i].ciphers} cipher is not supported`) ;
        }
    });

    this.Then(/^the following ciphers must not be supported$/, async function (table) {

        assert(this.ciphersSupported.length > 0, `${errorMessage}: The host does not support any valid ciphers`);

        const data = table.hashes();
        for (let i = 0; i < data.length; i += 1) {
            assert(!this.ciphersSupported.some(ciphers => ciphers.name === data[i].ciphers),`${errorMessage}: ${data[i].ciphers} cipher is supported`);
        }
    });

    this.Then(/^the certificate has a matching host name$/, function () {
        assert(this.sslyzeOutput.indexOf(`${env.serverHostName}`) !== -1, `${errorMessage}: None of Certificate has matching hostname - ${env.serverHostName}`);
    });

    this.Then(/^the certificate is in major root CA trust stores$/, function () {
        assert(this.sslyzeOutput.search('OK - Certificate is trusted') !== -1, `${errorMessage}: Found Certificate that is not trusted`);
        assert(this.sslyzeOutput.search('Certificate is not trusted') === -1, `${errorMessage}: Found Certificate that is not trusted`);
    });
};