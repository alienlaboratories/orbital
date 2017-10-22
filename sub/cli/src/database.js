//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';

import { Orb } from 'orbital-api';

// TODO(burdon): Util.
const log = (items) => {
  const col = 100;

  console.log(_.padEnd('Domain', 18), _.padEnd('Type', 8), _.padEnd('ID', 36), 'Data');
  console.log(_.padEnd('-', 18, '-'), _.padEnd('-', 8, '-'), _.padEnd('-', 36, '-'),
    _.padEnd('-', col - (18 + 8 + 36 + 3), '-'));

  _.each(items, item => {
    let { key: { domain, type, id } } = item;
    console.log(_.padEnd(domain, 18), _.padEnd(type, 8), _.padEnd(id, 36), JSON.stringify(_.omit(item, 'key')));
  });
};

/**
 * Graph commands.
 */
export const Database = (config) => {

  let db = Orb.DB();

  return {
    command: ['database', 'db'],
    describe: 'Graph Database API.',
    builder: yargs => yargs

      .option('domain', {
        alias: 'd',
      })

      .command({
        command: 'status',
        aliases: ['stat'],
        describe: 'DB Status.',
        handler: argv => {
          argv._result = db.status();
        }
      })

      .command({
        command: 'domains',
        aliases: ['dom'],
        describe: 'List domains.',
        handler: argv => {
          argv._result = db.domains().then(result => {
            console.log();
            console.log(JSON.stringify(result, null, 2));
          });
        }
      })

      .command({
        command: 'query',
        aliases: ['q'],
        describe: 'Query items.',
        handler: argv => {
          let { domain } = argv;
          let query = domain ? {
            domains: _.size(domain) === 1 ? [domain] : domain
          } : {};

          argv._result = db.query(query).then(result => {
            let { items } = result;
            console.log();
            log(items);
          });
        }
      })

      .command({
        command: 'create <title>',
        describe: 'Update node.',
        handler: argv => {
          let { domain, type='test', title } = argv;      // TODO(burdon): Default type.
          argv._result = db.update(domain, [
            {
              type,
              title
            }
          ]).then(result => {
            let { items } = result;
            console.log();
            log(items);
          });
        }
      })

      .command({
        command: 'clear',
        describe: 'Clear graph.',
        handler: argv => {
          let { domain } = argv;
          argv._result = db.clear(domain);
        }
      })

      .help()
  };
};
