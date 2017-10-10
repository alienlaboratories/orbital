//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';

import { ID } from 'orbital-util';

import { ApiClient } from '../util/client';

/**
 * DB API.
 */
export class DB {

  constructor(config) {
    console.assert(config);
    this._config = config;

    let { url } = config;
    this._client = new ApiClient(url + '/db');
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
   * @return {*}
   */
  query() {
    let { verbose } = this._config;

    const query = `
      query Query($query: Query!) {
        result: query(query: $query) {
          nodes {
            type
            id
            title
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
        console.error(JSON.stringify(errors, null, 2));
      } else {
        let { result } = data;
        return result;
      }
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
      mutation Mutation($batches: [Batch]!) {
        result: update(batches: $batches) {              
          nodes {
            type
            id
            title
          }
        }
      }
    `;

    let variables = {
      batches: [
        {
          mutations: _.map(items, item => {
            let { type='test', title } = item;

            return {
              type,
              id: ID.createId(),
              mutations: [
                {
                  key: 'title',
                  value: title
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
        console.error(JSON.stringify(errors, null, 2));
      } else {
        let { result } = data;
        let nodes = _.reduce(result, (result, value) => {
          result.nodes = result.nodes.concat(value.nodes);
          return result.nodes;
        }, { nodes: [] });

        return { nodes };
      }
    });
  }

  /**
   *
   * @return {*}
   */
  clear() {
    let { verbose } = this._config;

    const query = `
      mutation Mutation {
        result: clear
      }
    `;

    let variables = {};

    return this._client.query(query, variables, { verbose }).then(response => {
      let { errors, data } = response;
      if (errors) {
        console.error(JSON.stringify(errors, null, 2));
        return false;
      } else {
        return data;
      }
    });
  }
}
