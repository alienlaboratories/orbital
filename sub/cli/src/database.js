//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';

import { Orb } from 'orbital-api';

// TODO(burdon): Util.
const log = (items) => {
  const col = 48;

  console.log(_.padEnd('Key', col), 'Data');
  console.log(_.padEnd('---', col, '-'), _.pad('---', col, '-'));

  _.each(items, item => {
    let { type, id } = item;

    // TODO(burdon): Util.
    let key = `${type}/${id}`;

    console.log(_.padEnd(key, col), JSON.stringify(_.omit(item, 'type', 'id')));
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

      .command({
        command: 'status',
        describe: 'DB Status.',
        handler: argv => {
          argv._result = db.status();
        }
      })

      .command({
        command: 'query',
        aliases: ['q'],
        describe: 'Query items.',
        handler: argv => {
          argv._result = db.query().then(result => {
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
          let { type='test', title } = argv;
          argv._result = db.update([
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
          argv._result = db.clear();
        }
      })

      .help()
  };
};
