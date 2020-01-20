/* eslint-disable no-console */
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
const svcTimeout = process.env.SNYK_SVC_TIMEOUT || '300000'; // 5 mins

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
  const authResult = await runCommand('snyk', ['auth', '$SNYK_TOKEN'], { shell: true });
  if (authResult.code !== 0) {
    ctx.body = authResult;
    ctx.status = 500;
    return;
  }
  const testResult = await runCommand('snyk', ['test', '--json']);
  try {
    ctx.body = JSON.parse(testResult.result);
    return;
  } catch (parseError) {
    ctx.body = testResult;
    ctx.status = 500;
  }
});

router.post('/snyk/run', async (ctx) => {
  const cwd = path.join(process.cwd(), ctx.request.body.working_directory || '.');
  const authResult = await runCommand('snyk', ['auth', '$SNYK_TOKEN'], { cwd, shell: true });
  if (authResult.code !== 0) {
    ctx.body = authResult;
    ctx.status = 500;
    return;
  }
  const testResult = await runCommand('snyk', ['test', '--json'], { cwd });
  try {
    ctx.body = JSON.parse(testResult.result);
    return;
  } catch (parseError) {
    ctx.body = testResult;
    ctx.status = 500;
  }
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app
  .listen(parseInt(port, 10))
  .setTimeout(parseInt(svcTimeout, 10));
