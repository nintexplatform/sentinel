/* eslint-disable import/no-unresolved */
const { exec } = require('child-process-promise');
const Koa = require('koa');

const app = new Koa();
const router = require('koa-router')({
  prefix: '',
});

const port = process.env.SVC_PORT || '8081';
const svcTimeout = process.env.SSLYZE_SVC_TIMEOUT || '120000'; // 2 mins

router.get('/sslyze/run/:host', async (ctx) => {
  try {
    const result = await exec(`cd /usr/local/bin && ./sslyze --regular --http_headers ${ctx.params.host}`);
    console.log(result.stdout); // eslint-disable-line
    ctx.body = result.stdout;
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
