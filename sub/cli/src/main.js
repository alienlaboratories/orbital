//
// Copyright 2017 Alien Labs.
//

import readline from 'readline';
import yargs from 'yargs';

import { Graph } from './graph';
import { Registry } from './registry';
import { Status } from './status';

// TODO(burdon): Env.
const STAGE = 'dev';

const NAME = 'orb';

// TODO(burdon): Deploy npm package (locally).

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

      .command(Graph(config))
      .command(Registry(config))
      .command(Status(config))

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

          const next = result => {
            let log = result || output;

            // TODO(burdon): How to set output? (Is set by framework on error).
            // https://github.com/yargs/yargs/issues/960
            log && console.log(log);

            // Next command.
            console.log();
            this._rl.prompt();
          };

          if (err) {
//          process.exit(1);
            next();
            return;
          }

          // TODO(burdon): Async commands?
          // https://github.com/yargs/yargs/issues/918
          // https://github.com/yargs/yargs/issues/510
          Promise.resolve(argv._result).then(next).catch(ex => { next(ex); });
        });
      }).on('close', () => {
        resolve();
      });
    });
  }
}

new App({
  // TODO(burdon): NOTE: Changes each time deployed. CNAME? Route53? CloudFormation?
  // https://github.com/serverless/serverless/issues/2074
  ApiEndpoint: 'https://t2isk8i7ek.execute-api.us-east-1.amazonaws.com/' + STAGE
}).start();
