//
// Copyright 2017 Alien Labs.
//

import assert from 'assert';

/**
 * Service registry interface.
 */
class ServiceRegistry {

  /**
   *
   * @param service
   */
  updateService(service) {
    throw new Error('Not implemented');
  }

  /**
   *
   * @param query
   */
  getServices(query) {
    throw new Error('Not implemented');
  }
}

/**
 * In-memory implementation of ServiceRegistry.
 */
export class MemoryServiceRegistry extends ServiceRegistry {

  _serviceMap = new Map();

  updateService(service) {
    assert(service.provider && service.id);
    service.uri = service.provider + '/' + service.id;
    return Promise.resolve(this._serviceMap.set(service.uri, service)).then(map => {
      return service;
    });
  }

  getServices(query) {
    // TODO(burdon): Filter.
    assert(query);
    return Promise.resolve(Array.from(this._serviceMap.values()));
  }
}

/**
 * DynamoDB implementation of ServiceRegistry.
 */
export class DynamoServiceRegistry extends ServiceRegistry {

  // TODO(burdon): Implement persistent version using DynamoDB.
  // https://serverless.com/blog/node-rest-api-with-serverless-lambda-and-dynamodb/
}
