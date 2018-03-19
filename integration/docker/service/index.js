const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const { spawn } = require('child_process');

const app = new Koa();
const router = require('koa-router')({
  prefix: '',
});

const port = process.env.SVC_PORT || '8080';

router.post('/cmd', async (ctx) => {
  const args = ctx.request.body.args || [];
  const cmd = spawn('docker', args, { shell: true });
  let result = '';
  await new Promise((resolve, reject) => {
    cmd.stdout.on('data', (data) => {
      result += data;
    });
    cmd.on('error', (err) => {
      console.log(err);
      reject();
    });
    cmd.on('exit', (code) => {
      console.log(result);
      console.log(code);
      ctx.body = result;
      resolve();
    });
  });
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(parseInt(port, 10));
