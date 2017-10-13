//
// Copyright 2017 Alien Labs.
//

import assert from 'assert';
import { concatenateTypeDefs, makeExecutableSchema } from 'graphql-tools';

import { Schema } from 'orbital-db-core';

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
          let { items } = obj;

          console.log('RESOLVE:', obj);

          // TODO(burdon): Query for items with ID.
          return _.map(items, itemId => {
            return {
              id: itemId
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
