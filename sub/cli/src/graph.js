//
// Copyright 2017 Alien Labs.
//

import { GraphClient } from './client';

/**
 * Graph commands.
 */
export const Graph = (config) => {
  const { ApiEndpoint } = config;

  let client = new GraphClient(ApiEndpoint + '/graph');

  return {
    command: ['graph', 'g'],
    describe: 'Graph API.',
    builder: yargs => yargs

      .command({
        command: 'query',
        aliases: ['q'],
        describe: 'Query nodes.',
        handler: argv => {
          console.log('Query');
        }
      })

      .command({
        command: 'update <id> <title>',
        aliases: ['up'],
        describe: 'Add/update node.',
        handler: argv => {
          let { id, title } = argv;
          console.log('Update', id, title);
        }
      })


      .command({
        command: 'clear',
        describe: 'Clear graph.',
        handler: argv => {
          console.log('Clear');
        }
      })

      .help()
  };
};
