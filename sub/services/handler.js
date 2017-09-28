//
// Copyright 2017 Alien Labs.
//

import { graphql } from 'graphql';

import { createSchema as createDatabaseSchema } from './src/db/resolvers';
import { createSchema as createRegistrySchema } from './src/registry/resolvers';

import { Database } from './src/db/database';
import { MemoryServiceRegistry } from './src/registry/registry';

const DatabaseSchema = createDatabaseSchema(new Database());
const RegistrySchema = createRegistrySchema(new MemoryServiceRegistry());

module.exports = {

  // https://github.com/boazdejong/serverless-graphql-api

  /**
   * Status.
   */
  status: (event, context, callback) => {
    let response = {
      version: process.env['VERSION']
    };

    console.log('Status:', JSON.stringify(response));

    // TODO(burdon): When invoking from sls invoke the body can be JSON.
    // From curl unless a string is returned we get 502 (Bad Gateway).
    // https://medium.com/@jconning/tutorial-aws-lambda-with-api-gateway-36a8513ec8e3

    callback(null, {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    });
  },

  /**
   * Registry Service.
   */
  registry: (event, context, callback) => {
    let { functionName, awsRequestId } = context;
    console.log(JSON.stringify({ functionName, awsRequestId }));

    let { body } = event;
    let { query, variables } = JSON.parse(body);

    let queryRoot = {};
    let queryContext = {};

    graphql(RegistrySchema, query, queryRoot, queryContext, variables).then(result => {
      let response = {
        version: process.env['VERSION'],
        result
      };

      callback(null, {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      });
    });
  },

  /**
   * Database Service.
   */
  database: (event, context, callback) => {
    let { functionName, awsRequestId } = context;
    console.log(JSON.stringify({ functionName, awsRequestId }));

    let { body } = event;
    let { query, variables } = JSON.parse(body);

    let queryRoot = {};
    let queryContext = {};

    graphql(DatabaseSchema, query, queryRoot, queryContext, variables).then(result => {
      let response = {
        version: process.env['VERSION'],
        result
      };

      callback(null, {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      });
    });
  }

};
