//
// Copyright 2017 Alien Labs.
//

import { graphql } from 'graphql';

import { MemoryDatabase } from './database';
import { createSchema } from './resolvers';

// TODO(burdon): Configure query with multiple graph domains (context).
// TODO(burdon): Graph schema with PK/FK.
// TODO(burdon): Agent subscriptions (called on mutation).
// TODO(burdon): Mutate graph.

test('Basic query.', async () => {

  // TODO(burdon): Test DB.
  let database = new MemoryDatabase();

  let schema = createSchema(database);

  let root = {};

  let context = {};

  //
  // Clear
  //
  {
    // TODO(burdon): Clear.
    const query = `
      mutation Mutation {
        result: clear
      }
    `;

    let variables = {};

    let response = await graphql(schema, query, root, context, variables);
    let { data: { result } } = response;
    expect(result).toBe(0);
  }

  //
  // Mutate
  //
  {
    const query = `
      mutation TestMutation($batches: [Batch]!) {
        result: update(batches: $batches) {
          items {
            type
            id
            title
          }
        }
      }
    `;

    let variables = {
      batches: [
        {
          domain: 'x',
          mutations: [              // TODO(burdon): Rename batch
            {
              type: 'test',
              id: 'Item-1',
              mutations: [
                {
                  key: 'title',
                  value: 'Item 1'
                }
              ]
            }
          ]
        }
      ]
    };

    let response = await graphql(schema, query, root, context, variables);
    let { data: { result } } = response;
    expect(result).toHaveLength(1);

    let batch = result[0];
    let { items } = batch;
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Item 1');
  }

  //
  // Query
  //
  {
    const query = `
      query TestQuery($query: Query!) {
        result: query(query: $query) {
          items {
            type
            id
            title
          }
        }
      }
    `;

    let variables = {
      query: {
        domains: ['x', 'z']
      }
    };

    let response = await graphql(schema, query, root, context, variables);
    let { data: { result } } = response;
    let { items } = result;

    expect(items).toHaveLength(1);
  }
});
