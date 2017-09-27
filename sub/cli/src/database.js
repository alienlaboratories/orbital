//
// Copyright 2017 Alien Labs.
//

import uuidv4 from 'uuid/v4';

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
            query: {}
          };

          argv._result = client.query(query, variables, { verbose: argv.verbose }).then(response => {
            let { result: { errors, data } } = response;
            if (errors) {
              console.error(JSON.stringify(errors, null, 2));
            } else {
              console.log(JSON.stringify(data, null, 2));
            }
          });
        }
      })

      .command({
        command: 'create <title>',
        describe: 'Update node.',
        handler: argv => {
          let { title } = argv;

          const query = `
            mutation Mutation($batches: [Batch]!) {
              result: update(batches: $batches) {
                nodes {
                  id
                  title
                }
              }
            }
          `;

          let variables = {
            batches: [
              {
                mutations: [
                  {
                    // TODO(burdon): Factor out to util.
                    id: uuidv4(),
                    mutations: [
                      {
                        key: 'title',
                        value: title
                      }
                    ]
                  }
                ]
              }
            ]
          };

          argv._result = client.query(query, variables, { verbose: argv.verbose }).then(response => {
            let { result: { errors, data } } = response;
            if (errors) {
              console.error(JSON.stringify(errors, null, 2));
            } else {
              console.log(JSON.stringify(data, null, 2));
            }
          });
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
