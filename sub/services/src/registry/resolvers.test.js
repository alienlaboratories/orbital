//
// Copyright 2017 Alien Labs.
//

import { graphql } from 'graphql';

import { createSchema} from './resolvers';
import { ServiceRegistry } from './registry';

// TODO(burdon): Serverless/Lambda GQL service endpoint.
// TODO(burdon): CLI with Lokka.
// TODO(burdon): End-to-end testing.

test('Basic registry.', async () => {

  let schema = createSchema(new ServiceRegistry());

  let root = {};

  let context = {};

  {
    let variables = {
      service: {
        id: 'test',
        provider: 'test.com',
        title: 'Test'
      }
    };

    const mutation = `
      mutation RootMutation($service: ServiceInput!) {
        updateService(service: $service) {
          uri
          title
        }
      }
    `;

    let mutationResult = await graphql(schema, mutation, root, context, variables);
    let { data: { updateService:service } } = mutationResult;
    console.log('Updated:', service);
    expect(service.uri).toBe('test.com/test');
  }

  {
    let variables = {
      query: {
        provider: 'test.com'
      }
    };

    const query = `
      query RootQuery($query: ServiceQuery!) {
        getServices(query: $query) {
          id
          provider
          title
        }
      }
    `;

    let queryResult = await graphql(schema, query, root, context, variables);
    let { data: { getServices:services } } = queryResult;
    console.log('Services:', services);
    expect(services).toHaveLength(1);
  }
});
