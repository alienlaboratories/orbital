//
// Copyright 2017 Alien Labs.
//

import { concatenateTypeDefs, makeExecutableSchema } from 'graphql-tools';

import RegistrySchema from './gql/schema.graphql';

/**
 * Creates the GQL client schema.
 *
 * @param registry
 * @returns {GraphQLSchema}
 */
export const createSchema = (registry) => {
  return makeExecutableSchema({

    //
    typeDefs: concatenateTypeDefs([ RegistrySchema ]),

    // http://dev.apollodata.com/tools/graphql-tools/resolvers.html
    resolvers: new Resolvers(registry).getMap()
  });
};

/**
 * GQL Schema Resolvers.
 */
export class Resolvers {

  constructor(registry) {
    this._registry = registry;
  }

  getMap() {

    return {
      RootQuery: {
        getServices: (obj, args, context) => {
          let { query } = args;
          return this._registry.getServices(query);
        }
      },

      RootMutation: {
        reset: (obj, args, context) => {
          this._registry.clear();
          return 0;
        },

        updateService: (obj, args, context) => {
          let { service } = args;
          return this._registry.updateService(service);
        }
      }
    };
  }
}
