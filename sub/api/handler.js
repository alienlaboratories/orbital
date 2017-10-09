//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import { graphql } from 'graphql';
import path from 'path';
import yaml from 'node-yaml';

import { Util } from './src/util';
import { AWSUtil } from './src/util/aws';

import { createSchema as createDatabaseSchema } from './src/db/resolvers';
import { createSchema as createRegistrySchema } from './src/registry/resolvers';

import { MemoryDatabase } from './src/db/database';
import { DynamoDatabase } from './src/db/aws/dynamo';

import { MemoryServiceRegistry } from './src/registry/registry';

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',         // Required for CORS support to work.
  'Access-Control-Allow-Credentials' : true   // Required for cookies, authorization headers with HTTPS.
};

const ENV = Util.defaults(_.assign({}, process.env), {
  CONFIG_DIR:   '../../config',
  DATABASE:     'memory',
  AWS_USER:     'testing',
  AWS_CONFIG:   'aws-dev.yml'
});

// NOTE: Takes several seconds to read file (on startup).
async function config(baseDir) {
  return await {
    'aws': await yaml.read(path.join(baseDir, ENV.AWS_CONFIG))
  };
}

// Initialization promise.
const Init = config(ENV.CONFIG_DIR).then(config => {
  console.log('ENV:', JSON.stringify(ENV, null, 2));
  console.log('CONFIG:', JSON.stringify(config, null, 2));

  let database;
  switch (ENV.DATABASE) {
    case 'memory': {
      database = new MemoryDatabase();
      break;
    }

    case 'dynamodb':
    default: {
      AWSUtil.config(config, ENV.AWS_USER);
      database = new DynamoDatabase();
    }
  }

  console.log('Database:', database);

  return {
    DatabaseSchema: createDatabaseSchema(database),
    RegistrySchema: createRegistrySchema(new MemoryServiceRegistry())
  };
});

module.exports = {

  // https://github.com/boazdejong/serverless-graphql-api

  /**
   * Status.
   */
  status: (event, context, callback) => {
    let response = {
      version: ENV.VERSION
    };

    console.log('Status:', JSON.stringify(response));

    // TODO(burdon): When invoking from `sls invoke` the body can be JSON.
    // From curl unless a string is returned we get 502 (Bad Gateway).
    // https://medium.com/@jconning/tutorial-aws-lambda-with-api-gateway-36a8513ec8e3

    callback(null, {
      statusCode: 200,
      headers: HEADERS,
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

    Promise.resolve(Init).then(({ RegistrySchema }) => {
      graphql(RegistrySchema, query, queryRoot, queryContext, variables).then(result => {
        let { errors, data } = result;

        let response = {
          version: ENV.VERSION,
          errors,
          data
        };

        callback(null, {
          statusCode: 200,
          headers: HEADERS,
          body: JSON.stringify(response)
        });
      }).catch(error => {
        console.error(error);
        callback(error);
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

    Promise.resolve(Init).then(({ DatabaseSchema }) => {
      graphql(DatabaseSchema, query, queryRoot, queryContext, variables).then(result => {
        let { errors, data } = result;

        let response = {
          version: ENV.VERSION,
          errors,
          data
        };

        callback(null, {
          statusCode: 200,
          headers: HEADERS,
          body: JSON.stringify(response)
        });
      }).catch(error => {
        console.error(error);
        callback(error);
      });
    });
  }
};
