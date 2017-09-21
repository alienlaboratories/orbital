//
// Copyright 2017 Alien Labs.
//

import { graphql } from 'graphql';

import { Database, Graph } from './database';
import { createSchema } from './resolvers';

// TODO(burdon): Configure query with multiple graph domains (context).
// TODO(burdon): Graph schema with PK/FK.
// TODO(burdon): Agent subscriptions (called on mutation).
// TODO(burdon): Mutate graph.

test('Basic query.', () => {

  let database = new Database()
    .addGraph(new Graph('x'))
    .addGraph(new Graph('y'))
    .addGraph(new Graph('z'));

  let schema = createSchema(database);

  const query = `
    query RootQuery {
      root {
        title
      }
    }
  `;

  let root = {};

  let context = {
    domains: [ 'x', 'z' ]
  };

  let variables = {};

  return graphql(schema, query, root, context, variables).then(result => {
    let { data } = result;
    let { root } = data;
    let { title } = root;

    expect(title).toBe('Root');
  });
});
