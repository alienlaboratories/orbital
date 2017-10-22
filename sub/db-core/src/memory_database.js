//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import assert from 'assert';

import { Transforms } from 'orbital-db-core';
import { TypeUtil } from 'orbital-util';

import { Database } from './database';

/**
 * In-memory  partition.
 */
export class Shard {

  constructor(domain) {
    assert(_.isString(domain));
    this._domain = domain;
    this._nodeMap = new Map();
  }

  toString() {
    return `Shard("${this._domain}", ${this._nodeMap.size})`;
  }

  get domain() {
    return this._domain;
  }

  queryNodes(query) {
    return _.map(Array.from(this._nodeMap.values()), item => TypeUtil.clone(item));
  }

  updateNode(key, mutations) {
    let { id } = key;

    let node = this._nodeMap.get(id);
    if (!node) {
      node = { key };
      this._nodeMap.set(id, node);
    }

    Transforms.applyObjectMutations({}, node, mutations);

    return TypeUtil.clone(node);
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
    console.assert(_.isString(domain));
    let shard = this._shardMap.get(domain);
    if (!shard) {
      shard = new Shard(domain);
      this._shardMap.set(domain, shard);
      console.log('Created', shard.toString());
    }

    return shard;
  }

  test() {
    return Promise.resolve(true);
  }

  query(query) {
    let { domains=[Database.DEFAULT_DOMAIN] } = query || {};

    // TODO(burdon): Ordered.
    let itemMap = new Map();

    _.each(domains, domain => {
      let shard = this._getOrCreateShard(domain);

      // TODO(burdon): Data model.
      // TODO(burdon): Merge (items should have a map of domain specific sub-items).
      let items = shard.queryNodes(query);

      _.each(items, item => {
        itemMap.set(item.key.id, item);

        // TODO(burdon): Move to resolver?
        _.set(item, 'key.domain', domain);
      });

//    console.log('QUERY', shard.toString(), '=>', _.size(items));
    });

    let items = Array.from(itemMap.values());

    return Promise.resolve({
      items
    });
  }

  update(batches) {
    return Promise.resolve(_.map(batches, batch => {
      let { domain=Database.DEFAULT_DOMAIN, mutations } = batch;

      let shard = this._getOrCreateShard(domain);

      let items = _.map(mutations, mutation => {
        let { key, mutations } = mutation;
        let item = shard.updateNode(key, mutations);

        // TODO(burdon): Move to resolver?
        _.set(item, 'key.domain', domain);

        return item;
      });

//    console.log('UPDATED', shard.toString());

      return {
        items
      };
    }));
  }

  clear(domain=Database.DEFAULT_DOMAIN) {
    this._getOrCreateShard(domain).clearNodes();

    return Promise.resolve();
  }
}
