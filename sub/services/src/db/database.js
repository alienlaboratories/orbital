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

  queryNodes(query) {
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

  static DEFAULT_DOMAIN = 'default';

  _graphMap = new Map();

  // TODO(burdon): Context defines domains (default from CLI).
  // TODO(burdon): Ignore joins and other domains for now.

  addGraph(graph) {
    this._graphMap.set(graph.domain, graph);
    return this;
  }

  getOrCreateGraph(domain) {
    let graph = this._graphMap.get(domain);
    if (!graph) {
      graph = new Graph(domain);
      this._graphMap.set(domain, graph);
    }

    return graph;
  }

  query(query) {
    let { domains=[Database.DEFAULT_DOMAIN] } = query;

    // TODO(burdon): Ordered.
    let results = new Map();

    _.each(domains, domain => {
      let graph = this.getOrCreateGraph(domain);
      console.log(domain, graph);

      // TODO(burdon): Data model.
      // TODO(burdon): Merge (nodes should have a map of domain specific sub-nodes).
      let nodes = graph.queryNodes(query);
      _.each(nodes, node => {
        results.set(node.id, node);
      });
    });

    return {
      nodes: Array.from(results.values())
    };
  }

  update(batches) {
    return _.map(batches, batch => {
      let { domain=Database.DEFAULT_DOMAIN, mutations } = batch;

      let graph = this.getOrCreateGraph(domain);

      return {
        nodes: _.map(mutations, mutation => {
          let { id, mutations } = mutation;
          return graph.updateNode(id, mutations);
        })
      };
    });
  }
}
