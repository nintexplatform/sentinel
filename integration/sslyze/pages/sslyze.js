const rp = require('request-promise');
const env = require('./../cucumber/environment');

class Sslyze {
  async startTheProcess(host) {
    this.output = await rp(`${env.sslyzeServerUrl}sslyze/run/${host}`);
    return this.output;
  }

  listAcceptedCipherSuites() {
    let readFlag = false;
    const ciphers = [];
    this.output.toString()
      .split('\n')
      .forEach((line, index, arr) => {
        if (index === arr.length - 1 && line === '') {
          return;
        }

        // Look for the Accepted Cipher Suites - TurnON flag accordingly
        if (line.search('The server accepted the following.*cipher suites:') !== -1) {
          readFlag = true;
        }

        if (line === '') {
          readFlag = false;
        }

        if (readFlag && (line.indexOf('TLS_') !== -1)) {
          const [, name, , size] = line.replace('bits', '').split(/\s+/);
          ciphers.push({ name, size });
        }
      });
    return ciphers;
  }

  listsupportedprotocols() {
    const protocol = [];
    let temp = '';
    this.output.toString()
      .split('\n')
      .forEach((line, index, arr) => {
        if (index === arr.length - 1 && line === '') {
          return;
        }

        // Identify the Protocols
        if (line.indexOf('Cipher suites:') !== -1) {
          temp = line.match(/(SSL|TLS) \d+\.\d+/g)         
          return;
        }

        // Push the Protocols which are Rejected
        if ((line.indexOf('rejected') !== -1) && (temp !== '')) {
          protocol.push({ name: temp[0], type: 'Rejected' });
          temp = '';
        }

        // Push the Protocols which are Supported
        if ((line.indexOf('Preferred') !== -1) && (temp !== '')) {
          protocol.push({ name: temp[0], type: 'Supported' });
          temp = '';
        }
      });
    return protocol;
  }
}

module.exports = Sslyze;
