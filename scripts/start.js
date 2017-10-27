process.env.NODE_ENV = 'development';

// use .env file instead of settings environment directly
require('dotenv').config({silent: true});

const chalk = require('chalk');
const webpack = require('webpack');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const bsync = require('browser-sync').create();
const filewatcher = require('filewatcher')();
const spawn = require('child_process').spawn;

const config = require('../config/webpack.config.dev');
const paths = require('../config/paths');

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// ACTUAL START FUNCTION
// -----------------------------------------------------------------------------
function run() {
  const protocol = process.env.HTTPS === 'true' ? "https" : "http";
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 3001;

  setupCompiler();
  startServer();

  setTimeout(() => setupBrowser(protocol, host, port), 4000);
}

run ();

// WEBPACK WATCHER
// -----------------------------------------------------------------------------
function setupCompiler() {
  // "Compiler" is a low-level interface to Webpack.
  // It lets us listen to some events and provide our own custom messages.
  const compiler = webpack(config);

  compiler.watch({}, (err, stats) => {
    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    const messages = formatWebpackMessages(stats.toJson({}, true));
    const isSuccessful = !messages.errors.length && !messages.warnings.length;

    if (isSuccessful) {
      console.log(chalk.green('[webpack] compiled successfully!'));
    }

    // If errors exist, only show errors.
    if (messages.errors.length) {
      console.log(chalk.red('[webpack] failed to compile.'));
      console.log();
      messages.errors.forEach(message => {
        console.log(message);
        console.log();
      });
      return;
    }

    // Show warnings if no errors were found.
    if (messages.warnings.length) {
      console.log(chalk.yellow('[webpack] compiled with warnings.'));
      console.log();
      messages.warnings.forEach(message => {
        console.log(message);
        console.log();
      });
    }
  });

  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.plugin('invalid', function() {
    console.log('[webpack] compiling...');
  });
}

// BROWSERSYNC
// -----------------------------------------------------------------------------
function setupBrowser(protocol, host, port) {
  bsync.watch('*').on('change', bsync.reload);

  bsync.init({
    files: paths.appBuild,
    browser: 'google chrome',
    reloadDebounce: 1000,
    proxy: `${protocol}://${host}:${port}`
  }, err => {
    if (err) console.log(err);
  });
}

// SERVER
// -----------------------------------------------------------------------------
// sets up all event handlers for server so that we can restart it uniformly
function setupServer() {
  const server = spawn('node', [ paths.serverSrc ]);

  server.stdout.on('data', data => {
    console.log(chalk.white(`[server] ${data}`));
  });
  server.stderr.on('data', data => {
    console.log(chalk.red(`[server] ${data}`));
  });

  return server;
}

// starts server and sets up filewatcher hooks
function startServer() {
  let server = setupServer();

  // ADD NEW SERVER-SIDE FOLDERS HERE
  filewatcher.add(paths.serverSrc);
  filewatcher.add(`${paths.serverSrc}/routes`);
  filewatcher.on('change', (file, stat) => {
    if (!stat) {
      console.log(`${chalk.magenta('[server] : file deleted:')} ${file.split('/')[file.split('/').length - 1]}`);
    } else {
      console.log(`${chalk.magenta('[server] : file change detected:')} ${file.split('/')[file.split('/').length - 1]}`);
    }

    console.log(chalk.bold.cyan('[server] : restarting server'));

    server.kill();

    server = setupServer();
  });

  // make sure server exits when we kill start script
  process.on('exit', () => server.kill());
}
