const exec = require('child-process-promise').exec;
const Koa = require('koa');

const app = new Koa();
const router = require('koa-router')({
    prefix: '',
});

const port = process.env.SVC_PORT || '8081';
let sslyzeOutput = '';

router.get('/sslyze/run/:host', async (ctx) => {
    sslyzeOutput = await exec(`cd /usr/local/bin && ./sslyze --regular --http_headers ${ctx.params.host}`)
                .then(function (result) {
                    console.log (result.stdout);
                    return result.stdout;
                })
                .catch(function (err) {
                    return err;
                });
   ctx.body = sslyzeOutput;
});

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(parseInt(port, 10));