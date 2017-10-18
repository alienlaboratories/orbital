//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import { graphql } from 'graphql';
import path from 'path';
import yaml from 'node-yaml';

import { DynamoDatabase, MemoryDatabase } from 'orbital-db';
import { AWSUtil } from 'orbital-node-util';
import { TypeUtil } from 'orbital-util';

import { createSchema as createDatabaseSchema } from './src/db/resolvers';
import { createSchema as createRegistrySchema } from './src/registry/resolvers';

import { MemoryServiceRegistry } from './src/registry/registry';

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',         // Required for CORS support to work.
  'Access-Control-Allow-Credentials' : true   // Required for cookies, authorization headers with HTTPS.
};

const ENV = TypeUtil.defaults(_.assign({}, process.env), {
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

// TODO(burdon): Verbose config.
const verbose = false;

// Initialization promise.
const Init = config(ENV.CONFIG_DIR).then(config => {

  if (verbose) {
    console.log('ENV:', JSON.stringify(ENV, null, 2));
    console.log('CONFIG:', JSON.stringify(config, null, 2));
  }

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

  if (verbose) {
    console.log('Database:', database);
  }

  return {
    DatabaseSchema: createDatabaseSchema(database),
    RegistrySchema: createRegistrySchema(new MemoryServiceRegistry())
  };
});

module.exports = {

  /**
   * Status.
   */
  status: (event, context, callback) => {
    let response = {
      version: ENV.VERSION
    };

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
   * OAuth Service.
   * Register callback with Google APIs (see google.yml config).
   *    /oauth2/login/google
   *    /oauth2/callback/google
   */
  oauth: (event, context, callback) => {
    let { pathParameters: { path:service } } = event;
    let { path } = event;

    let action = path.match(/\/.+\/(.+)\/.+/)[1];

    // TODO(burdon): Must use express.
    // https://stackoverflow.com/questions/23376252/is-it-possible-to-use-passport-js-without-expressjs

    callback(null, {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ action, service })
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
