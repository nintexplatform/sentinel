
[![npm](http://img.shields.io/npm/v/sentinel-ast.svg)](https://www.npmjs.com/package/sentinel-ast) 
[![License](https://img.shields.io/npm/l/sentinel-ast.svg)](https://github.com/nintexplatform/sentinel/blob/master/LICENSE)

# Sentinel

Sentinel is a framework that enables _automated security testing_ via a suite of industry standard test frameworks and security tools. 

It is built on Cucumber and Node.js. This allows for security test cases to be defined in Gherkin/BDD syntax making them human readable and self documenting. The idea is that we make security testing a concept that is approachable(tests written by developers, testers, security guys), repeatable(when integrated with your CI/CD pipelines) and auditable(when used to gather evidence in compliancy initiatives).

Sentinel was inspired by existing security frameworks(Gauntlt, Mittn, BDD-Security) but we felt the need to provide our own flavour to security testing with a modern javascript and docker based environment. 

# Features
Sentinel is currently integrated with
- Automated security scanners - [Open Zap](https://www.owasp.org/index.php/OWASP_Zed_Attack_Proxy_Project) and [SSLyze](https://github.com/nabla-c0d3/sslyze) to find security vulnerabilities in your web applications.
- Selenium/WebDriver and Node.js for implementing browser and API based automated tests.
- Docker/Compose that enables drop-in isolation of integrated components during runtime. It also enables what we call the Bring-Your-Own-Container(s) feature, which gives consumers of Sentinel the capability to attach their web applications/services as containers onto Sentinels' networking infrastructure.
- Reporting tools. 

It has been designed from ground-up to be completely [extensible](#extensibility).

# Quickstart

We want to get you off the ground and started as quick as possible in just a few steps. Running commands below on your shell will install Node.js, Docker and Sentinel running security tests against a local containerized website.

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/nintexplatform/sentinel/master/bin/install-dependencies.sh)"
git clone https://github.com/nintexplatform/sentinel-example.git && cd sentinel-example
npm install 
npm run test
```

On Linux, run the install-dependencies script under `sudo` for root privileges.

Once the tests have completed, you can find a generated report under `sentinel-example/report` directory

We've introduced an example use case of Sentinel in the [`sentinel-example`](https://github.com/nintexplatform/sentinel-example) repo

# Getting Started
To install the framework:
1. [Install prequisites](#install-prequisites)
2. [Install Sentinel](#install-sentinel-via-npm) via npm

## Install Prerequisites
These prerequisites must be installed first. 
1. [Node.js](https://nodejs.org/en/download/) Version 7+
2. [Docker](https://docs.docker.com/engine/installation/)
3. [Docker Compose](https://docs.docker.com/compose/install/#install-compose) 

 Alternatively, for Docker + Compose, you can also install Docker for [Mac](https://www.docker.com/docker-mac) or [Windows](https://www.docker.com/docker-windows) which is a fast and easy way to get Docker + Compose.

-or- 

Use our quick-install script
```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/nintexplatform/sentinel/master/bin/install-dependencies.sh)"
```

## Install Sentinel via npm

```bash
npm install -g sentinel-ast
```

From this point, see the [For Developers](#for-developers) section below on how to use Sentinel.

# For Developers

## Sentinel CLI 

Getting Sentinel to run is simple and done primarily through a global(if npm installed with `-g`) CLI.

``` bash
sentinel

  Usage: sentinel [options] [command]


  Options:

    -V, --version  output the version number
    -h, --help     output usage information


  Commands:

    init                             Initializes configuration & test templates in the current directory
    run-compose [COMMAND] [ARGS...]  Runs docker compose commands
    run-cucumber [options] [DIR]     Runs cucumber tests
    start-services [options]         Starts services in its containers
    stop-services [options]          Stops services and its containers
```
```
sentinel init
```
- From an empty directory, you should always run this command first. It initializes the current directory with a default config.env, feature templates and config json files.
- The default parameters in config.env are [explained below](#environment-variables). They should be configured prior to starting up the services. 

```
sentinel start-services
```
- This command starts all integrated services as containers.

```
sentinel stop-services
```
- This command stops all containers hosting integrated services. 

```
sentinel run-compose
```
- This command proxies the CLI arguments to Docker compose. 

```
sentinel run-cucumber
```
- This command proxies the CLI arguments to Cucumber-js. 


## Integrations 
The framework ships with a few integrated components out of the box. If they are hosted within containers, we refer to them as **services**.

### Cucumber Report
Adds cucumber hooks to create a report at the end of a test run.  
Integrates the [Cucumber Html Reporter](https://www.npmjs.com/package/cucumber-html-reporter)

### Slack
Adds hooks to post results at the end of a test run to Slack.

### Node
This is a general purpose Node.js container that tests are run in.  
It reads environment variables from config.env
Node Version 7+

### Selenium WebDriver
The node [Selenium WebDriver](https://www.npmjs.com/package/selenium-webdriver) package.  
It has cucumber hooks to configure the webdriver and adds the driver instance to the world.  
It also has a docker service for running a chrome container for remote control of the browser.

### SSLyze
A service which can be used for running a SSLyze scan against a host.  
[GitHub](https://github.com/iSECPartners/sslyze)

### Zap
A service which hosts OWASP ZAP.  
[GitHub](https://github.com/zaproxy/zaproxy/)

## Extensibility
Extending the framework starts with packaging your new **component** as a sub-directory within the `/integration` directory. These components can hook into the Sentinel runtime in a number of ways.

* Cucumber support files  
 Any files found in a components `cucumber` folder gets required when starting tests.  
 This can be used to add step definitions, modify the world, add hooks etc.  
 (Refer to `/integration/selenium`)
* Docker container/service  
 Required binaries, cli tools, etc can be exposed as a webservice by adding a compose-*.yml file in the integrations folder. 
 This lets you define containers that can host the cli and allows test code to use REST calls to access it by service name. 
 (Refer to `/integration/sslyze`)
 * Javascript module  
 You can create reusable Page Objects or interfaces needed to communicate to **services** by including the classes and exporting them from the `index.js` in the framework's root directory. By doing so, consumers of the Sentinel framework can have access to these objects at runtime.  
 (Refer to `/integration/zap`)

## Environment Variables

| Integration         | Name                        | Description                    | Required | Default / Optional Values |
|---------------------|-----------------------------|--------------------------------|----------|-------------|
| sslyze              | SSLYZE_SERVER_URL                  | Url to run sslyze scan against | true     | http://sslyze:8081/ |
| zap                 | ZAP_SERVER_URL              | Url to zap api server          | false    | http://zap:8080/ |
| selenium            | SELENIUM_BROWSER            | Webdriver capabilities         | false    | chrome      |
| selenium            | SELENIUM_REMOTE_URL         | Webdriver url                  | true     | http://selenium:4444/wd/hub |
| selenium            | SELENIUM_REMOTE_CAPABILITY  | For remote selenium services   | false    |  ./remoteSelenium.config.template.json |
| selenium            | WEBDRIVER_PAGE_TIMEOUT      | Webdriver page load timeout    | false    |  45000      |
| selenium            | WEBDRIVER_LONG_TIMEOUT      | Timeout for long running step  | false    |  30000      |
| selenium            | EXECUTION_ENVIRONMENT       | For zap proxy                  | false    |  local (default) / proxy / remote |
| cucumber            | FEATURE_DIR                 | Feature file location          | false    | ./features/  |
| cucumber-report     | CUCUMBER_REPORT_DIR         | path to store reports          | false    | ./report/    |
| slack               | SLACK_FEATURE               | *ON* or *OFF* the process      | false    | 'ON' / 'OFF' (default) |    
| slack               | SLACK_WEBHOOK_URI           | Specify the Incoming webhooks url - [Reference](https://api.slack.com/incoming-webhooks)   |   false |  - |       