/* eslint max-len: ["error", 150]*/
const rp = require('request-promise');
const env = require('../cucumber/environment');
const { URL } = require('url');

class ZapCore {
    async sendRequestToZAP(path, options = {}) {
        return rp(
            Object.assign({
                uri: new URL(path, env.server).href,
                json: true,
            }, options)
        );
    }

    async setsetOptionMaxDepth(value) {
        return this.sendRequestToZAP('JSON/spider/action/setOptionMaxDepth', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
                Integer: value,
            },
        });
    }

    async setOptionThreadCount(value) {
        return this.sendRequestToZAP('JSON/spider/action/setOptionThreadCount', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
                Integer: value,
            },
        });
    }

    async startScan(value) {
        return this.sendRequestToZAP('JSON/spider/action/scan', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
                url: value,
                maxChildren: '',
                recurse: '',
                contextName: '',
                subtreeOnly: '',
            },
        });
    }

    async startPassiveScan() {
        return this.sendRequestToZAP('JSON/pscan/action/enableAllScanners/', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
            }
        });
    }

    async newScanSession() {
        return this.sendRequestToZAP('JSON/core/action/newSession/', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
                name: '',
                overwrite: '',
            },
        });
    }

    async stopAllSpiderScans() {
        return this.sendRequestToZAP('JSON/spider/action/stopAllScans/', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
            }
        });
        return this.sendRequestToZAP('JSON/spider/action/removeAllScans/', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
            }
        });
    }

    async disableAllActiveScanners() {
        return this.sendRequestToZAP('JSON/ascan/action/disableAllScanners/', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
                scanPolicyName: '',
            }
        });
    }

    async deleteExistingAlerts() {
        return this.sendRequestToZAP('JSON/core/action/deleteAllAlerts/', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
            }
        });
    }

    async checkForAlerts() {
        return this.sendRequestToZAP('OTHER/core/other/mdreport/', {
            qs: {
                formMethod: 'GET',
            }
        });
    }

    async addScanPolicy(policy, threshold, attackStrength) {
        return this.sendRequestToZAP('JSON/ascan/action/addScanPolicy/', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
                scanPolicyName: policy,
                alertThreshold: threshold,
                attackStrength: attackStrength,
            }
        });
    }

    async startActiveScan(url) {
        return this.sendRequestToZAP('JSON/ascan/action/scan', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
                url,
                recurse: '',
                inScopeOnly: '',
                scanPolicyName: '',
                method: '',
                postData: '',
                contextId: '',
            },
        });
    }

    async checkSpiderStatus(scanId) {
        const resp = await this.sendRequestToZAP('JSON/spider/view/status', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
                scanId,
            },
        });
        return resp.status === '100';
    }

    async checkActiveScanStatus(scanId) {
        const resp = await this.sendRequestToZAP('JSON/ascan/view/status', {
            qs: {
                zapapiformat: 'JSON',
                formMethod: 'GET',
                scanId,
            },
        });
        return resp.status === '100';
    }
}
module.exports = ZapCore;
