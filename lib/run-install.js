const Npm = require('./npm');
const Integration = require('./integration');

const npm = new Npm();
npm.installForSubdirectories(Integration.integrationDirectory())
  .catch((e) => {
    // eslint-disable-next-line
    console.log(e);
    process.exit(1);
  });
