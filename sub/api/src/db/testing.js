//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import { Chance } from 'chance';
import { graphql } from 'graphql';
import { print } from 'graphql/language/printer';

import { MemoryDatabase } from 'orbital-db-core';
import { ID } from 'orbital-util';

import { createSchema } from './resolvers';

const chance = new Chance();

/**
 * Test data generator.
 */
export class TestDataGenerator {

  constructor(database) {
    console.assert(database);
    this._database = database;
  }

  // TODO(burdon): Query existing to link.
  async addItems(count=20) {
    const TYPE = 'test';

    // TODO(burdon): Query to link existing items.
    // let result = await this._database.query();

    let ids = _.times(count, () => {
      return ID.createId();
    });

    let mutations = _.map(ids, nodeId => {

      // TODO(burdon): Check creates a closed graph.
      let linkId = ids[chance.natural({ min: 0, max: ids.length - 1 })];
      // if (linkId === nodeId) {
      // }

      let mutations = [
        {
          field: 'title',
          value: {
            string: chance.name()
          }
        },
        {
          field: 'items',
          value: {
            set: [{           // TODO(burdon): Set or scalar?
              value: {
                string: ID.encodeKey({ type: TYPE, id: linkId })
              }
            }]
          }
        }
      ];

      return {
        key: {
          type: TYPE,
          id: nodeId,
        },
        mutations
      };
    });

    let batches = [
      {
        mutations
      }
    ];

    return this._database.update(batches);
  }
}

/**
 * Test resolver.
 */
export class TestResolver {

  _database = new MemoryDatabase();

  _schema = createSchema(this._database);

  _root = {};

  _context = {};

  get database() {
    return this._database;
  }

  exec(query, variables) {

    // https://github.com/graphql/graphql-js/blob/master/src/graphql.js
    return graphql(this._schema, print(query), this._root, this._context, variables);
  }
}

/**
 * Test Apollo Network Interface.
 */
export class TestNetworkInterface {

  constructor(resolver) {
    this._resolver = resolver || new TestResolver();
  }

  get database() {
    return this._resolver.database;
  }

  // http://dev.apollodata.com/core/network.html#NetworkInterface
  query(request) {
    let { operationName, query, variables } = request;
    console.log('=>>', operationName);

    return this._resolver.exec(query, variables).then(result => {
      console.log('<<=', result);
      return result;
    });
  }
}
