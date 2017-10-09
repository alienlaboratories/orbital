//
// Copyright 2017 Alien Labs.
//

import assert from 'assert';
import { concatenateTypeDefs, makeExecutableSchema } from 'graphql-tools';

import DatabaseSchema from './gql/schema.graphql';

/**
 * Creates the GQL client schema.
 *
 * @param database
 * @returns {GraphQLSchema}
 */
export const createSchema = (database) => {
  return makeExecutableSchema({

    // Schema defs.
    typeDefs: concatenateTypeDefs([ DatabaseSchema ]),

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

      // TODO(burdon): Should format result here (not in database).

      RootQuery: {

        status: (obj, args, context) => {
          return {
            timestamp: Date.now(),
            version: '0.0.1'
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
