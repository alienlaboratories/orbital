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

    //
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
      RootQuery: {

        query: (obj, args, context) => {
          let { query } = args;
          let { domains } = context;
          return this._database.query(domains, query);
        }
      },

      RootMutation: {

        updateNodes: (obj, args, context) => {
          return [];
        }
      }
    };
  }
}
