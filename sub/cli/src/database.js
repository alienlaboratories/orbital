//
// Copyright 2017 Alien Labs.
//

import { GraphClient } from './client';

/**
 * Graph commands.
 */
export const Database = (config) => {
  const { ApiEndpoint } = config;

  let client = new GraphClient(ApiEndpoint + '/db');

  return {
    command: ['database', 'db'],
    describe: 'Graph Database API.',
    builder: yargs => yargs

      .command({
        command: 'query',
        aliases: ['q'],
        describe: 'Query nodes.',
        handler: argv => {

          const query = `
            query Query($query: Query!) {
              result: query(query: $query) {
                nodes {
                  id
                  title
                }
              }
            }
          `;

          let variables = {
            query: {
              domains: ['default']
            }
          };

          argv._result = client.query(query, variables, { verbose: argv.verbose }).then(result => {

            console.log('>>>>>>>>>', JSON.stringify(result));

          });
        }
      })

      .command({
        command: 'update <id> <title>',
        aliases: ['up'],
        describe: 'Update node.',
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
