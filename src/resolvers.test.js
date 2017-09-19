//
// Copyright 2017 Alien Labs.
//

import { concatenateTypeDefs, makeExecutableSchema } from 'graphql-tools';
import { graphql } from 'graphql';

import Schema from './gql/schema.graphql';

import { Resolvers } from './resolvers';

const createSchema = () => {
  return makeExecutableSchema({

    //
    typeDefs: concatenateTypeDefs([ Schema ]),

    // http://dev.apollodata.com/tools/graphql-tools/resolvers.html
    resolvers: new Resolvers().getMap()
  });
};

test('root.', () => {
  let schema = createSchema();

  let query = `
    query RootQuery {
      root {
        title
      }
    }
  `;

  return graphql(schema, query).then(result => {
    let { data } = result;
    let { root } = data;
    let { title } = root;

    expect(title).toBe('Root');
  });
});
