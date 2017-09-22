//
// Copyright 2017 Alien Labs.
//

import request from 'request';
import readline from 'readline';
import yargs from 'yargs';

const NAME = 'orb';

// TODO(burdon): Deploy npm package (locally).

// TODO(burdon): Map AWS End-point to Route 53.
const StatusUrl = 'https://psuwih37r6.execute-api.us-east-1.amazonaws.com/dev/status';

/**
 * CLI app.
 */
class App {

  constructor(config) {

    // TODO(burdon): '*' default command.
    // https://github.com/yargs/yargs/blob/master/docs/advanced.md#commands
    this._yargs = yargs
      .exitProcess(false)

      .option('verbose', {
        alias: 'v',
        default: false,
      })

      .command({
        command: ['quit', 'exit'],
        describe: 'Quit',
        handler: argv => process.exit(0)
      })

      .command({
        command: ['status', 'stat'],
        describe: 'Service status',
        handler: argv => {
          argv._result = new Promise((resolve, reject) => {
            request.get(StatusUrl, (error, response, body) => {
              console.log(JSON.stringify(JSON.parse(body)));
              resolve();
            });
          });
        }
      })

      .help();

    // https://nodejs.org/api/readline.html
    // https://nodejs.org/api/readline.html#readline_example_tiny_cli
    this._rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,                        // Prevent output from being echoed.
      prompt: `[${NAME}]> `
    });
  }

  start() {
    return new Promise((resolve, reject) => {

      // CLI mode.
      this._rl.prompt();
      this._rl.on('line', (input) => {
        this._yargs.parse(input, (err, argv, output) => {
          if (err) {
            console.error(err);
            process.exit(1);
          }

          // TODO(burdon): Async commands?
          // https://github.com/yargs/yargs/issues/918
          // https://github.com/yargs/yargs/issues/510
          Promise.resolve(argv._result).then(result => {
            console.log();

            // TODO(burdon): How to set output?
            // https://github.com/yargs/yargs/issues/960
            output && console.log(output);

            // Next command.
            this._rl.prompt();
          });
        });
      }).on('close', () => {
        resolve();
      });
    });
  }
}

new App({}).start();
