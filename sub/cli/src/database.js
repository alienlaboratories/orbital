//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';

import { Orb } from 'orbital-api';

const log = (nodes) => {
  const col1 = 50;

  console.log(_.padEnd('Key', col1), 'Data');
  console.log(_.padEnd('---', col1, '-'), _.pad('---', 40, '-'));

  _.each(nodes, node => {
    let { type, id } = node;

    // TODO(burdon): Util.
    let key = `${type}/${id}`;

    console.log(_.padEnd(key, col1), JSON.stringify(_.omit(node, 'type', 'id')));
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
        command: 'query',
        aliases: ['q'],
        describe: 'Query nodes.',
        handler: argv => {
          argv._result = db.query().then(result => {
            let { nodes } = result;
            console.log();
            log(nodes);
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
            let { nodes } = result;
            console.log();
            log(nodes);
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
