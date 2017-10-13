//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import assert from 'assert';
import { concatenateTypeDefs } from 'graphql-tools';

import { Transforms } from 'orbital-db-core';

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
  clear() {
    throw new Error('Not implemented');
  }
}

/**
 * In-memory  partition.
 */
export class Shard {

  constructor(domain) {
    assert(_.isString(domain));
    this._domain = domain;
    this._nodeMap = new Map();
  }

  get domain() {
    return this._domain;
  }

  queryNodes(query) {
    return Array.from(this._nodeMap.values());
  }

  updateNode(key, mutations) {
    let { id } = key;

    let node = this._nodeMap.get(id);
    if (!node) {
      node = { key };
      this._nodeMap.set(id, node);
    }

    Transforms.applyObjectMutations({}, node, mutations);

    return node;
  }

  clearNodes() {
    this._nodeMap.clear();
  }
}

/**
 * Memory Database.
 */
export class MemoryDatabase extends Database {

  _shardMap = new Map();

  _getOrCreateShard(domain) {
    let schard = this._shardMap.get(domain);
    if (!schard) {
      schard = new Shard(domain);
      this._shardMap.set(domain, schard);
    }

    return schard;
  }

  test() {
    return Promise.resolve(true);
  }

  query(query) {
    let { domains=[Database.DEFAULT_DOMAIN] } = query;

    // TODO(burdon): Ordered.
    let itemMap = new Map();
    _.each(domains, domain => {
      let shard = this._getOrCreateShard(domain);

      // TODO(burdon): Data model.
      // TODO(burdon): Merge (items should have a map of domain specific sub-items).
      let items = shard.queryNodes(query);
      _.each(items, item => {
        itemMap.set(item.id, item);
      });
    });

    return Promise.resolve({
      items: Array.from(itemMap.values())
    });
  }

  update(batches) {
    return Promise.resolve(_.map(batches, batch => {
      let { domain=Database.DEFAULT_DOMAIN, mutations } = batch;
      let shard = this._getOrCreateShard(domain);

      return {
        items: _.map(mutations, mutation => {
          let { key, mutations } = mutation;
          return shard.updateNode(key, mutations);
        })
      };
    }));
  }

  clear() {
    this._getOrCreateShard(Database.DEFAULT_DOMAIN).clearNodes();

    return Promise.resolve();
  }
}
