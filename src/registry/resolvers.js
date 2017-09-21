//
// Copyright 2017 Alien Labs.
//

import assert from 'assert';
import { concatenateTypeDefs, makeExecutableSchema } from 'graphql-tools';

import RegistrySchema from './gql/schema.graphql';

/**
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
 *
 */
export class Registry {

  _serviceMap = new Map();

  updateService(service) {
    assert(service.provider && service.id);
    service.uri = service.provider + '/' + service.id;
    this._serviceMap.set(service.uri, service);
  }

  getServices(query) {
    // TODO(burdon): Filter.
    assert(query);
    return Array.from(this._serviceMap.values());
  }
}

/**
 *
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
        updateService: (obj, args, context) => {
          let { service } = args;
          this._registry.updateService(service);
          return service;
        }
      }
    };
  }
}
