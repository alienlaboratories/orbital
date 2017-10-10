//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';

import { Orb } from 'orbital-api';

/**
 * Registry commands.
 */
export const Registry = (config) => {

  let registry = Orb.Registry();

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
          argv._result = registry.list().then(result => {
            let { data: { services } } = result;

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
          argv._result = registry.update(domain, id, name).then(result => {
            console.log(JSON.stringify(result, null, 2));
          });
        }
      })

      .command({
        command: 'test <id>',
        describe: 'Test service.',
        handler: argv => {
          let { id } = argv;
          argv._result = registry.test(id);
        }
      })

      .command({
        command: 'clear',
        describe: 'Clear entire registry.',
        handler: argv => {
          argv._result = registry.clear();
        }
      })

      .help()
  };
};
