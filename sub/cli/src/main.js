//
// Copyright 2017 Alien Labs.
//

import readline from 'readline';
import yargs from 'yargs';

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
      .command(['quit', 'exit'], 'Quit', {}, argv => process.exit(0))
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

          // TODO(burdon): Async? https://github.com/yargs/yargs/issues/918
          Promise.resolve(argv._result).then(result => {
            console.log();

            // TODO(burdon): How to set output?
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
