//
// Copyright 2017 Alien Labs.
//

import assert from 'assert';

/**
 * Service registry abstraction.
 */
export class ServiceRegistry {

  // TODO(burdon): Create interface.
  // TODO(burdon): Implement persistent version using DynamoDB.

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
