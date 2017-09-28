//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import { GraphClient } from './client';

/**
 * Registry commands.
 */
export const Registry = (config) => {
  const { ApiEndpoint } = config;

  let client = new GraphClient(ApiEndpoint + '/registry');

  return {
    command: ['registry', 'reg'],
    describe: 'Registry API.',
    builder: yargs => yargs

      // Testing.
      // url: 'http://graphql.org/swapi-graphql',
      // http://graphql.org/swapi-graphql/?query=%7B%0A%20%20allFilms%20%7B%0A%20%20%20%20films%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&operationName=null

      .command({
        command: 'list',
        describe: 'List services.',
        handler: argv => {

          const query = `
            query Query($query: ServiceQuery!) {
              services: getServices(query: $query) {
                id
                domain
                name
              }
            }
          `;

          let variables = {
            query: {
              domain: 'test.com'
            }
          };

          argv._result = client.query(query, variables, { verbose: argv.verbose }).then(result => {
            let { result: { data: { services } } } = result;

            console.log();
            console.log(`${_.padEnd('Domain', 32)} ${_.padEnd('ID', 16)} Name`);

            _.each(services, service => {
              let { id, domain, name } = service;
              console.log(`${_.padEnd(domain, 32)} ${_.padEnd(id, 16)} ${name}`);
            });
          });
        }
      })

      // TODO(burdon): Get from local YML file.
      .command({
        command: 'update <domain> <id> <name>',
        aliases: ['up'],
        describe: 'Add/update service record.',
        handler: argv => {
          let { domain, id, name } = argv;

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
            service: {
              domain,
              id,
              name
            }
          };

          argv._result = client.query(query, variables, { verbose: argv.verbose }).then(result => {
            console.log(JSON.stringify(result, null, 2));
          });
        }
      })

      .command({
        command: 'test <id>',
        describe: 'Test service.',
        handler: argv => {
          let { id } = argv;

          // TODO(burdon): Test/Invoke service (need endpoint).
          // TODO(burdon): Query for service endpoint then invoke.
          console.log('TESTING: ' + id);
        }
      })

      .command({
        command: 'clear',
        describe: 'Clear entire registry.',
        handler: argv => {
          const query = `
            mutation Reset {
              reset
            }
          `;

          argv._result = client.query(query, null, { verbose: argv.verbose });
        }
      })

      .help()
  };
};
