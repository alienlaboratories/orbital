//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import path from 'path';
import yaml from 'node-yaml';

import { AWSUtil } from 'orbital-node-util';
import { ID, TypeUtil } from 'orbital-util';

import { DynamoDatabase } from './dynamo';

const ENV = TypeUtil.defaults(_.assign({}, process.env), {
  CONFIG_DIR:   '../../config',
  AWS_USER:     'testing',
  AWS_CONFIG:   'aws-dev.yml'
});

async function config(baseDir) {
  return await {
    'aws': await yaml.read(path.join(baseDir, ENV.AWS_CONFIG))
  };
}

// TODO(burdon): Large (non-unit) test. Use testing service domain.
test('AWS config.', async () => {
  return config(ENV.CONFIG_DIR).then(config => {
    AWSUtil.config(config, ENV.AWS_USER);

    const count = 3;
    let mutations = _.times(count, i => {

      let fieldMutations = [
        {
          field: 'title',
          value: {
            string: `Item ${i}`
          }
        }
      ];

      if (i > 0) {
        fieldMutations.push({
          field: 'items',
          value: {
            set: [{
              value: {
                string: ID.encodeKey({ type: 'test', id: 'Item-0' })
              }
            }]
          }
        });
      }

      return {
        key: {
          type: 'test',
          id: `Item-${i}`,
        },
        mutations: fieldMutations
      };
    });

    let batches = [
      {
        mutations
      }
    ];

    // TODO(burdon): Use test domain.

    let database = new DynamoDatabase();
    return database.clear().then(() => {
      return database.update(batches).then(() => {
        return database.query({}).then(result => {
          let { items } = result;
          expect(items).toHaveLength(count);
        });
      });
    });
  });
});
