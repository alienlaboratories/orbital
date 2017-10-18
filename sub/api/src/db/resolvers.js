//
// Copyright 2017 Alien Labs.
//

import assert from 'assert';
import { concatenateTypeDefs, makeExecutableSchema } from 'graphql-tools';

import { Schema } from 'orbital-db-core';
import { ID } from 'orbital-util';

import APISchema from '../../gql/api.graphql';

const VERSION = '0.0.1';

/**
 * Creates the GQL client schema.
 *
 * @param database
 * @returns {GraphQLSchema}
 */
export const createSchema = (database) => {
  return makeExecutableSchema({

    // Schema defs.
    typeDefs: concatenateTypeDefs(Schema.concat(APISchema)),

    // http://dev.apollodata.com/tools/graphql-tools/resolvers.html
    resolvers: new Resolvers(database).getMap()
  });
};

/**
 * GQL Schema Resolvers.
 */
export class Resolvers {

  constructor(database) {
    assert(database);
    this._database = database;
  }

  getMap() {
    return {

      // TODO(burdon): Catch exceptions (see beta).

      Item: {

        items: (obj, args, context) => {
          let { key, items } = obj;

          // TODO(burdon): Query for items with ID.
          return _.map(items, encodedKey => {
            let itemKey = ID.decodeKey(encodedKey);
            itemKey.domain = key.domain;

            return {
              key: itemKey
            };
          });
        }
      },

      RootQuery: {

        status: (obj, args, context) => {
          return {
            timestamp: Date.now(),
            version: VERSION
          };
        },

        domains: (obj, args, context) => {
          return [
            {
              uri: '_',
              name: 'Default'
            },
            {
              uri: 'example.com/red',
              name: 'Red'
            },
            {
              uri: 'example.com/green',
              name: 'Green'
            },
            {
              uri: 'example.com/blue',
              name: 'Blue'
            }
          ];
        },

        query: (obj, args, context) => {
          let { query } = args;
          return this._database.query(query);
        }
      },

      RootMutation: {

        clear: (obj, args, context) => {
          this._database.clear();
          return 0;
        },

        update: (obj, args, context) => {
          let { batches } = args;
          return this._database.update(batches);
        }
      }
    };
  }
}
