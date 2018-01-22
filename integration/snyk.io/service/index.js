/* eslint-disable import/no-unresolved */
const { exec } = require('child-process-promise');
const Koa = require('koa');

const app = new Koa();
const router = require('koa-router')({
  prefix: '',
});

const port = process.env.SVC_PORT || '8086';

function groupVulnerabilityLines(lines) {
  let groupOfLines = [];
  const hasLines = () => groupOfLines.length > 0;
  const isNewGroup = line => line && line.includes('severity vulnerability found');
  const hasFinished = line => line && line.includes('dependencies for known vulnerabilities');
  return lines.reduce((agg, line) => {
    if (hasLines() && (isNewGroup(line) || hasFinished(line))) {
      agg.push(groupOfLines);
      groupOfLines = [];
    }
    if (isNewGroup(line) || hasLines()) {
      groupOfLines.push(line);
    }
    return agg;
  }, []);
}

function parseGroupOfLines(group) {
  const typeReg = /(\w+) severity vulnerability found on (.+)$/;
  const descReg = /desc: (.+)$/;
  const infoReg = /info: (.+)$/;
  const fromReg = /from: (.+)$/;
  return group.reduce((result, line) => {
    /* eslint-disable no-param-reassign */
    let matches = typeReg.exec(line);
    if (matches) {
      [, result.severity, result.package] = matches;
    }
    matches = descReg.exec(line);
    if (matches) {
      [, result.desc] = matches;
    }
    matches = infoReg.exec(line);
    if (matches) {
      [, result.info] = matches;
    }
    matches = fromReg.exec(line);
    if (matches) {
      [, result.from] = matches;
    }
    /* eslint-enable no-param-reassign */
    return result;
  }, {});
}

function parseResult(result) {
  const lines = result.split('\n');
  const vulnerabilities = groupVulnerabilityLines(lines);
  return vulnerabilities.map(parseGroupOfLines);
}

router.get('/snyk/run', async (ctx) => {
  const result = await exec('sh ./snyk.sh');
  ctx.body = parseResult(result.stdout);
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(parseInt(port, 10));
