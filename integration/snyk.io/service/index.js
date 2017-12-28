/* eslint-disable import/no-unresolved */
const { exec } = require('child-process-promise');
const Koa = require('koa');

const app = new Koa();
const router = require('koa-router')({
  prefix: '',
});

const port = process.env.SVC_PORT || '8086';

router.get('/snyk/run', async (ctx) => {
  try {
    const result = await exec('sh ./snyk.sh');
    console.log(result.stdout); // eslint-disable-line
    ctx.body = result.stdout;
  } catch (err) {
    ctx.body = err;
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(parseInt(port, 10));
