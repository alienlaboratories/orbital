//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';

import { ID, TypeUtil } from 'orbital-util';

import { ApiClient } from '../client';

/**
 * DB API.
 */
export class DB { // TODO(burdon): Rename DatabaseClient.

  constructor(config) {
    console.assert(config);
    this._config = config;

    let { apiKey, url } = config;
    this._client = new ApiClient({ apiKey, url: url + '/db' });
  }

  /**
   *
   * @return {*}
   */
  test() {
    console.assert(this._config, 'Invalid configuration.');
    return Promise.resolve(true);
  }

  /**
   *
   */
  status() {
    let { verbose } = this._config;

    const query = `
      query StatusQuery {
        status {
          version
        }
      }
    `;

    let variables = {};

    return this._client.query(query, variables, { verbose }).then(response => {
      let { errors, data } = response;
      if (errors) {
        throw new Error(JSON.stringify(errors, null, 2));
      }

      return data;
    });
  }

  /**
   *
   */
  domains() {
    let { verbose } = this._config;

    const query = `
      query DomainsQuery {
        domains {
          uri
          name
        }
      }
    `;

    let variables = {};

    return this._client.query(query, variables, { verbose }).then(response => {
      let { errors, data } = response;
      if (errors) {
        throw new Error(JSON.stringify(errors, null, 2));
      }

      return data;
    });
  }

  /**
   *
   * @return {*}
   */
  query(queryInput={}) {
    let { verbose } = this._config;

    const query = `
      query Query($query: QueryInput!) {
        result: query(query: $query) {
          items {
            key {
              domain
              type
              id
            }
            title
            items {
              key {
                domain
                type
                id
              }
            }
          }
        }
      }
    `;

    let variables = {
      query: queryInput
    };

    return this._client.query(query, variables, { verbose }).then(response => {
      let { errors, data } = response;
      if (errors) {
        throw new Error(JSON.stringify(errors, null, 2));
      }

      let { result } = data;
      return result;
    });
  }

  /**
   *
   * @param {String} domain
   * @param items
   * @return {*}
   */
  update(domain, items) {
    let { verbose } = this._config;

    const query = `
      mutation UpdateMutation($batches: [BatchInput]!) {
        result: update(batches: $batches) {              
          items {
            key {
              domain
              type
              id
            }
            title
          }
        }
      }
    `;

    let variables = {
      batches: [
        {
          domain,
          mutations: _.map(items, item => {
            let { type='test', title } = item;        // TODO(burdon): Default type.

            return {
              key: {
                type,
                id: ID.createId()
              },
              mutations: [
                {
                  field: 'title',
                  value: {
                    string: title
                  }
                }
              ]
            };
          })
        }
      ]
    };

    return this._client.query(query, variables, { verbose }).then(response => {
      let { errors, data } = response;
      if (errors) {
        throw new Error(JSON.stringify(errors, null, 2));
      }

      let { result } = data;
      return TypeUtil.deepMerge({ items: [] }, ...result);
    });
  }

  /**
   *
   * @return {*}
   */
  clear(domain) {
    let { verbose } = this._config;

    const query = `
      mutation ClearMutation {
        result: clear
      }
    `;

    let variables = {
      domain
    };

    return this._client.query(query, variables, { verbose }).then(response => {
      let { errors, data } = response;
      if (errors) {
        throw new Error(JSON.stringify(errors, null, 2));
      }

      return data;
    });
  }
}
