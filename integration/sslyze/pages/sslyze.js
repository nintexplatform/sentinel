const rp = require('request-promise');

class Sslyze {

    async startTheProcess(host) {
        this.output = await rp(`http://sslyze:8081/sslyze/run/${host}`);
        return this.output;
    }

    listAcceptedCipherSuites() {
        let readFlag = false;
        const ciphers = [];
        this.output.toString().split('\n').forEach(function (line, index, arr) {
            if (index === arr.length - 1 && line === '') { return; }

            // Look for the Accepted Cipher Suites - TurnON flag accordingly
            if (line.indexOf('Accepted:') !== -1) {
                readFlag = true;
            }

            if (line === '') {
                readFlag = false;
            }

            if (readFlag && (line.indexOf('TLS_') !== -1)) {
                const temp = line.replace('bits', '').split(/\s+/);
                ciphers.push({ name: temp[1], size: temp[3] });
            }
        });
        return ciphers;
    }

    listsupportedprotocols() {
        const protocol = [];
        let temp = '';
        this.output.toString().split('\n').forEach(function (line, index, arr) {
            if (index === arr.length - 1 && line === '') {
                return;
            }

            // Identify the Protocols
            if (line.indexOf('Cipher Suites:') !== -1) {
                temp = line.split(/\s+/);
                return;
            }

            // Push the Protocols which are Rejected
            if ((line.indexOf('rejected') !== -1) && (temp !== '')) {
                protocol.push({ name: temp[2], type: 'Rejected' });
                temp = '';
            }

            // Push the Protocols which are Supported
            if ((line.indexOf('Preferred') !== -1) && (temp !== '')) {
                protocol.push({ name: temp[2], type: 'Supported' });
                temp = '';
            }
        });
        return protocol;
    }
};
module.exports = Sslyze;