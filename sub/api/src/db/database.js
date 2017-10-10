//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import assert from 'assert';

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

  updateNode(type, id, mutations) {
    let node = this._nodeMap.get(id);
    if (!node) {
      node = { type, id };
      this._nodeMap.set(id, node);
    }

    // TODO(burdon): OT mutations.
    _.each(mutations, mutation => {
      let { key, value } = mutation;
      node[key] = value;
    });

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
    let results = new Map();

    _.each(domains, domain => {
      let shard = this._getOrCreateShard(domain);

      // TODO(burdon): Data model.
      // TODO(burdon): Merge (nodes should have a map of domain specific sub-nodes).
      let nodes = shard.queryNodes(query);
      _.each(nodes, node => {
        results.set(node.id, node);
      });
    });

    return Promise.resolve({
      nodes: Array.from(results.values())
    });
  }

  update(batches) {
    return Promise.resolve(_.map(batches, batch => {
      let { domain=Database.DEFAULT_DOMAIN, mutations } = batch;
      let shard = this._getOrCreateShard(domain);

      return {
        nodes: _.map(mutations, mutation => {
          let { type, id, mutations } = mutation;
          return shard.updateNode(type, id, mutations);
        })
      };
    }));
  }

  clear() {
    this._getOrCreateShard(Database.DEFAULT_DOMAIN).clearNodes();

    return Promise.resolve();
  }
}
