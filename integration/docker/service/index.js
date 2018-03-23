const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const { spawn } = require('child_process');

const app = new Koa();
const router = Router({
  prefix: '',
});

const port = process.env.SVC_PORT || '8080';

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

router.post('/cmd', async (ctx) => {
  const args = ctx.request.body.args || [];
  const result = await runCommand('docker', args, { shell: true });
  ctx.body = result;
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(parseInt(port, 10));
