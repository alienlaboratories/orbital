//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import assert from 'assert';

/**
 *
 */
export class Graph {

  constructor(domain) {
    assert(_.isString(domain));
    this._domain = domain;
    this._nodeMap = new Map();
  }

  get domain() {
    return this._domain;
  }

  queryNodes() {
    return Array.from(this._nodeMap.values());
  }

  updateNode(id, mutations) {
    let node = this._nodeMap.get(id);
    if (!node) {
      node = { id };
      this._nodeMap.set(id, node);
    }

    // TODO(burdon): OT mutations.
    _.each(mutations, mutation => {
      let { key, value } = mutation;
      node[key] = value;
    });

    return node;
  }
}

/**
 *
 */
export class Database {

  _graphMap = new Map();

  // TODO(burdon): Context defines domains (default from CLI).
  // TODO(burdon): Default Graph?
  // TODO(burdon): Ignore joins and other domains for now.

  addGraph(graph) {
    this._graphMap.set(graph.domain, graph);
    return this;
  }

  query(query) {
    return {
      nodes: []
    };
  }

  update(batches) {
    return _.map(batches, batch => {
      let { domain, mutations } = batch;
      let graph = this._graphMap.get(domain);

      return {
        nodes: _.map(mutations, mutation => {
          let { id, mutations } = mutation;
          return graph.updateNode(id, mutations);
        })
      };
    });
  }
}
