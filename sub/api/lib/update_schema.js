#!/usr/bin/env babel-node --optional es7.asyncFunctions

//
// Transpiles GraphQL schema.
//

import fs from 'fs';
import path from 'path';

import { graphql }  from 'graphql';
import { introspectionQuery } from 'graphql/utilities';
import { concatenateTypeDefs, makeExecutableSchema } from 'graphql-tools';

import { Schema } from 'orbital-db-core';

import DatabaseSchema from '../gql/api.graphql';
import RegistrySchema from '../src/registry/gql/schema.graphql';

const dist = path.join(__dirname, '../dist');
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}

//
// Creates JSON schema definition for Pycharm GraphQL plugin.
//

const createSchema = async (schema, filename) => {
  console.log('Creating schema:', filename);
  try {
    const execSchema = makeExecutableSchema({
      typeDefs: concatenateTypeDefs(schema)
    });

    let result = await (graphql(execSchema, introspectionQuery));
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
  await createSchema(Schema.concat(DatabaseSchema), path.join(dist, 'database.json'));
  await createSchema([ RegistrySchema ], path.join(dist, 'registry.json'));
})();
