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
   * @return {*}
   */
  query() {
    let { verbose } = this._config;

    const query = `
      query Query($query: QueryInput!) {
        result: query(query: $query) {
          items {
            key {
              type
              id
            }
            title
            items {
              key {
                id
              }
            }
          }
        }
      }
    `;

    let variables = {
      query: {}
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
   * @param items
   * @return {*}
   */
  update(items) {
    let { verbose } = this._config;

    const query = `
      mutation UpdateMutation($batches: [BatchInput]!) {
        result: update(batches: $batches) {              
          items {
            key {
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
  clear() {
    let { verbose } = this._config;

    const query = `
      mutation ClearMutation {
        result: clear
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
}
