const rp = require('request-promise');
const env = require('./../cucumber/environment');

class Sslyze {
  async startTheProcess(host) {
    this.output = await rp({
      uri: `${env.sslyzeServerUrl}sslyze/run/${host}`,
      json: true,
      simple: true,
      resolveWithFullResponse: false,
    });
    return this.output;
  }

  listAcceptedCipherSuites() {
    const results = this.output.json.server_scan_results[0].scan_commands_results;
    return Object.keys(results)
      .filter(k => k.endsWith('_cipher_suites'))
      .reduce((acceptedCiphers, suiteKey) => {
        const cipherType = suiteKey.replace('_cipher_suites', '');
        if (results[suiteKey].accepted_cipher_suites &&
          results[suiteKey].accepted_cipher_suites.length > 0) {
          return acceptedCiphers.concat(results[suiteKey].accepted_cipher_suites.map(suite => ({
            type: cipherType,
            name: suite.cipher_suite.name,
            size: suite.cipher_suite.key_size,
          })));
        }
        return acceptedCiphers;
      }, []);
  }

  static formatProtocol(p) {
    return p.toLowerCase().replace(/[ .]/g, '_');
  }
}

module.exports = Sslyze;
