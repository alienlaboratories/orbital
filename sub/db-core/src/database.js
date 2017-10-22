//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import { concatenateTypeDefs } from 'graphql-tools';

import DatabaseSchema from '../gql/db.graphql';
import MutationSchema from '../gql/mutation.graphql';
import QuerySchema from '../gql/query.graphql';

export const Schema = [ DatabaseSchema, MutationSchema, QuerySchema ];
export const TypeDefs = concatenateTypeDefs(Schema);

/**
 * Database interface.
 */
export class Database {

  static DEFAULT_DOMAIN = '_';

  // TODO(burdon): Context defines domains (default from CLI).
  // TODO(burdon): Ignore joins and other domains for now.

  test() {
    throw new Error('Not implemented');
  }

  /**
   *
   * @param query
   * @return {Promise}
   */
  query(query) {
    throw new Error('Not implemented');
  }

  /**
   *
   * @param batches
   * @return {Promise}
   */
  update(batches) {
    throw new Error('Not implemented');
  }

  /**
   *
   * @return {Promise}
   */
  clear(domain) {
    throw new Error('Not implemented');
  }
}
