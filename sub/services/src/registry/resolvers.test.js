//
// Copyright 2017 Alien Labs.
//

import { graphql } from 'graphql';

import { createSchema } from './resolvers';
import { MemoryServiceRegistry } from './registry';

// TODO(burdon): Serverless/Lambda GQL service endpoint.
// TODO(burdon): End-to-end testing.

test('Basic registry.', async () => {

  let schema = createSchema(new MemoryServiceRegistry());

  let root = {};

  let context = {};

  {
    const mutation = `
      mutation RootMutation($service: ServiceInput!) {
        updateService(service: $service) {
          uri
          name
        }
      }
    `;

    let variables = {
      service: {
        id: 'test',
        provider: 'test.com',
        name: 'Test'
      }
    };

    let mutationResult = await graphql(schema, mutation, root, context, variables);
    let { data: { updateService:service } } = mutationResult;
    console.log('Updated:', service);
    expect(service.uri).toBe('test.com/test');
  }

  {
    const query = `
      query RootQuery($query: ServiceQuery!) {
        getServices(query: $query) {
          id
          provider
          name
        }
      }
    `;

    let variables = {
      query: {
        provider: 'test.com'
      }
    };

    let queryResult = await graphql(schema, query, root, context, variables);
    let { data: { getServices:services } } = queryResult;
    console.log('Services:', services);
    expect(services).toHaveLength(1);
  }

  {
    const query = `
      mutation Reset {
        reset
      }
    `;

    await graphql(schema, query, root, context);
  }
});
