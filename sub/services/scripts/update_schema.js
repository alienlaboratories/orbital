#!/usr/bin/env babel-node --optional es7.asyncFunctions

//
// Transpiles GraphQL schema.
//

import fs from 'fs';
import path from 'path';

import { graphql }  from 'graphql';
import { introspectionQuery } from 'graphql/utilities';
import { concatenateTypeDefs, makeExecutableSchema } from 'graphql-tools';

import DatabaseSchema from '../src/db/gql/schema.graphql';
import RegistrySchema from '../src/registry/gql/schema.graphql';

const dist = path.join(__dirname, '../dist');
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}

//
// Creates JSON schema definition for Pycharm GraphQL plugin.
//

const createSchema = async (schemaX, filename) => {
  console.log('Creating schema:', filename);
  try {
    const schema = makeExecutableSchema({
      typeDefs: concatenateTypeDefs(schemaX)
    });

    let result = await (graphql(schema, introspectionQuery));
    if (result.errors) {
      console.error('Schema Error', JSON.stringify(result.errors, null, 2));
    } else {
      fs.writeFileSync(filename, JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log('Error Creating Schema:', error);
  }
};

(async () => {
  await createSchema([ DatabaseSchema ], path.join(dist, 'database.json'));
  await createSchema([ RegistrySchema ], path.join(dist, 'registry.json'));
})();
