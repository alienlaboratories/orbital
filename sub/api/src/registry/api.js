//
// Copyright 2017 Alien Labs.
//

import { ApiClient } from '../util/client';

/**
 * Registry API.
 */
export class Registry {

  constructor(config) {
    console.assert(config);
    this._config = config;

    let { apiKey, url } = config;
    this._client = new ApiClient({ apiKey, url: url + '/registry' });
  }

  list() {
    let { verbose } = this._config;

    const query = `
      query Query($query: ServiceQuery!) {
        services: getServices(query: $query) {
          id
          domain
          name
        }
      }
    `;

    let variables = {
      query: {
        domain: 'test.com'
      }
    };

    return this._client.query(query, variables, { verbose });
  }

  update(domain, id, name) {
    let { verbose } = this._config;

    const query = `
      mutation Mutation($batches: [Batch]!) {
        result: update(batches: $batches) {
          items {
            id
            title
          }
        }
      }
    `;

    let variables = {
      service: {
        domain,
        id,
        name
      }
    };

    return this._client.query(query, variables, { verbose });
  }

  test(id) {
    // TODO(burdon): Test/Invoke service (need endpoint).
    // TODO(burdon): Query for service endpoint then invoke.
    console.log('TESTING: ' + id);

    return Promise.resolve(true);
  }

  clear() {
    let { verbose } = this._config;

    const query = `
      mutation Reset {
        reset
      }
    `;

    return this._client.query(query, null, { verbose });
  }
}
