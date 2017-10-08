//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import path from 'path';
import yaml from 'node-yaml';

import { Util } from '../../util';
import { AWSUtil } from '../../util/aws';

import { DynamoDatabase } from './dynamo';

const ENV = Util.defaults(_.assign({}, process.env), {
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
      return {
        id: `Item-${i}`,
        mutations: [
          {
            key: 'title',
            value: `Item ${i}`
          }
        ]
      };
    });

    let batches = [
      {
        mutations
      }
    ];

    // TODO(burdon): Clear first.
    let database = new DynamoDatabase();
    return database.test().then(() => {
      return database.update(batches).then(() => {
        return database.query({}).then(result => {
          let { nodes } = result;
          expect(nodes).toHaveLength(count);
        });
      });
    });
  });
});
