/* eslint-disable import/no-unresolved */
const { spawn } = require('child_process');
const path = require('path');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

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

function runCommand(prog, args, options = {}) {
  const cmd = spawn(prog, args, options);
  let result = '';
  return new Promise((resolve, reject) => {
    cmd.stdout.on('data', (data) => {
      result += data;
    });
    cmd.on('error', (err) => {
      console.log(err);
      reject(err);
    });
    cmd.on('exit', (code) => {
      console.log(result);
      console.log(code);
      resolve({ code, result });
    });
  });
}

router.get('/snyk/run', async (ctx) => {
  await runCommand('snyk', ['auth', '$SNYK_TOKEN'], { shell: true });
  const { result } = await runCommand('snyk', ['test']);
  ctx.body = parseResult(result);
});

router.post('/snyk/run', async (ctx) => {
  const cwd = path.join(process.cwd(), ctx.request.body.working_directory || '.');
  await runCommand('snyk', ['auth', '$SNYK_TOKEN'], { cwd, shell: true });
  const { result } = await runCommand('snyk', ['test'], { cwd });
  ctx.body = parseResult(result);
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(parseInt(port, 10));
