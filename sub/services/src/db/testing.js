//
// Copyright 2017 Alien Labs.
//

import { graphql } from 'graphql';
import { print } from 'graphql/language/printer';

import { createSchema } from './resolvers';
import { Database, Graph } from './database';

/**
 * Test resolver.
 */
export class TestResolver {

  // TODO(burdon): Test database.
  database = new Database();

  schema = createSchema(this.database);

  root = {};

  context = {};

  constructor() {
    let graph = new Graph(Database.DEFAULT_DOMAIN);

    _.times(10, i => {
      graph.updateNode(`I-${i}`, [{ key: 'title', value: `Item ${i}` }]);
    });

    this.database.addGraph(graph);
  }

  exec(query, variables) {

    // https://github.com/graphql/graphql-js/blob/master/src/graphql.js
    return graphql(this.schema, print(query), this.root, this.context, variables);
  }
}
