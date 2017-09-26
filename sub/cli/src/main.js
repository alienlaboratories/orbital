//
// Copyright 2017 Alien Labs.
//

import readline from 'readline';
import yargs from 'yargs/yargs';

import { Graph } from './graph';
import { Registry } from './registry';
import { Status } from './status';

const VERSION = '0.0.1';

// TODO(burdon): Env.
const STAGE = 'dev';

const PROMPT = '[orb]> ';

/**
 * CLI app.
 */
class App {

  constructor(config) {

    // TODO(burdon): '*' default command.
    // https://github.com/yargs/yargs/blob/master/docs/advanced.md#commands
    this._yargs = yargs()
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
        command: 'version',
        handler: argv => {
          console.log(VERSION);
        }
      })

      .command(Graph(config))
      .command(Registry(config))
      .command(Status(config))

      .help();
  }

  start() {

    // Command line.
    if (process.argv.length > 2) {
      let args = process.argv.slice(2);
      this._yargs.parse(args, (err, argv, output) => {
        console.log(output);
      });
    } else {
      this.startCLI();
    }
  }

  startCLI() {
    // https://nodejs.org/api/readline.html
    // https://nodejs.org/api/readline.html#readline_example_tiny_cli
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,                        // Prevent output from being echoed.
      prompt: PROMPT
    });

    return new Promise((resolve, reject) => {

      // CLI mode.
      rl.prompt();
      rl.on('line', (input) => {
        this._yargs.parse(input, (err, argv, output) => {

          const next = result => {

            // TODO(burdon): How to set output? (Is set by framework on error).
            // https://github.com/yargs/yargs/issues/960
            let log = result || output;
            log && console.log(log);

            // Next command.
            console.log();
            rl.prompt();
          };

          if (err) {
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
