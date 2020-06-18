/* eslint-disable import/no-unresolved */
const { exec } = require('child-process-promise');
const { readFileSync } = require('fs');
const Koa = require('koa');

const app = new Koa();
const router = require('koa-router')({
  prefix: '',
});

const port = process.env.SVC_PORT || '8081';
const svcTimeout = process.env.SSLYZE_SVC_TIMEOUT || '120000'; // 2 mins

router.get('/sslyze/run/:host', async (ctx) => {
  const hostName = ctx.params.host;
  const fileName = `${hostName}.json`;
  try {
    const result = await exec(`sslyze --regular --http_headers ${hostName} --json_out=${fileName}`);
    console.log(result.stdout); // eslint-disable-line
    ctx.headers = { 'Content-Type': 'application/json' };
    ctx.body = {
      stdOut: result.stdout,
      json: JSON.parse(readFileSync(fileName, 'utf8')),
    };
  } catch (err) {
    ctx.body = err;
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app
  .listen(parseInt(port, 10))
  .setTimeout(parseInt(svcTimeout, 10));
