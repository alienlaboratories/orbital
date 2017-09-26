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

test('Basic query.', async () => {

  let database = new Database()
    .addGraph(new Graph('x'))
    .addGraph(new Graph('y'))
    .addGraph(new Graph('z'));

  let schema = createSchema(database);

  let root = {};

  {
    const query = `
      query TestQuery($query: Query!) {
        result: query(query: $query) {
          nodes {
            id
            title
          }
        }
      }
    `;

    let context = {
      domains: ['x', 'z']
    };

    let variables = {
      query: {}
    };

    let response = await graphql(schema, query, root, context, variables);
    let { data } = response;
    let { result } = data;
    let { nodes } = result;

    expect(nodes).toHaveLength(0);
  }

  {
    const query = `
      mutation TestMutation($nodes: [NodeInput]!) {
        nodes: updateNodes(nodes: $nodes) {
          id
          title
        }
      }
    `;

    let context = {};

    let variables = {
      nodes: []
    };

    let response = await graphql(schema, query, root, context, variables);
    let { data } = response;
    let { nodes } = data;

    expect(nodes).toHaveLength(0);
  }
});
