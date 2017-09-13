module.exports = {
  server: process.env.ZAP_SERVER_URL || 'http://zap:8080/',
  scanTimeout: parseInt(process.env.ZAP_SCAN_TIMEOUT || '30000', 10),
};
