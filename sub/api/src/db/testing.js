//
// Copyright 2017 Alien Labs.
//

import { graphql } from 'graphql';
import { print } from 'graphql/language/printer';

import { createSchema } from './resolvers';
import { MemoryDatabase } from './database';

/**
 * Test data generator.
 */
export class TestDataGenerator {

  _counter = 0;

  constructor(database) {
    console.assert(database);
    this._database = database;
  }

  addItems(count=20) {
    let mutations = _.times(count, i => {
      this._counter++;
      return {
        id: `I-${this._counter}`,
        mutations: [
          {
            key: 'title',
            value: `Item ${this._counter}`
          }
        ]
      };
    });

    let batches = [
      {
        mutations
      }
    ];

    this._database.update(batches);
    return this;
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
