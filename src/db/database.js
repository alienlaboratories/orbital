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
  }

  get domain() {
    return this._domain;
  }

  query() {}
}

/**
 *
 */
export class Database {

  _graphMap = new Map();

  addGraph(graph) {
    this._graphMap.set(graph.domain, graph);
    return this;
  }

  getRoot(domains) {
    return {
      title: 'Root'
    };
  }
}
