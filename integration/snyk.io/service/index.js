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

function uniqueArray (arr) {
  return [...new Set(arr.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))
}

async function snykTestToHtml(workingDir) {
    
    var snyk;
    if (workingDir == undefined)
      snyk = spawn('snyk', ['test','--all-projects','--json']);
    else
      snyk = spawn('snyk', ['test','--all-projects','--json'], workingDir);
    
    var snykToHtml = spawn('snyk-to-html', ['-s']);
    let snykHtmlresult = '';
    let snykTestResult = '';

    snyk.stdout.on('data', (data) => {
      snykTestResult += data.toString();
      snykToHtml.stdin.write(data);
    });

    snykToHtml.stdout.on('data', (data) => {
      snykHtmlresult += data.toString();
    });

    await new Promise((resolve, reject) => {
      snyk.on('close', (code) => {
        snykToHtml.stdin.end();
        resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      snykToHtml.on('close', (code) => {
        resolve();
      });
    });

    const snykTestJSON = JSON.parse(snykTestResult);
    var vulns;
    
    if (snykTestJSON.vulnerabilities) {
      vulns = snykTestJSON.vulnerabilities.map(vuln =>
        {   
          const id = vuln.id;
          const title = vuln.title;
          const severity = vuln.severity;
          const from = vuln.from.join(',');
          const url = 'https://snyk.io/vuln/' + vuln.id;
        
          return {id, title, severity, from, url };
        });  
    }

    return {
      vulnerabilities: uniqueArray(vulns),
      report: snykHtmlresult,
    };
}

router.get('/snyk/run', async (ctx) => {
  const authResult = await runCommand('snyk', ['auth', '$SNYK_TOKEN'], { shell: true });
  if (authResult.code !== 0) {
    ctx.body = authResult;
    ctx.status = 500;
    return;
  }

  try {
    ctx.set('Content-type','application/json');
    var testResult = snykTestToHtml();
    ctx.body = testResult;
    
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

  try {
    ctx.set('Content-type','application/json');
    var testResult = await snykTestToHtml({cwd});
    ctx.body = testResult;
    
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
