//
// Copyright 2017 Alien Labs.
//

// TODO(burdon): Serve Webpack App.
// TODO(burdon): Map serverless path to routes?
// https://github.com/awslabs/aws-serverless-express/blob/master/example/app.js

// TODO(burdon): AWS SAM?
// https://github.com/awslabs/serverless-application-model

// TODO(burdon): Swagger (OpenAPI)
// https://swagger.io/specification

// TODO(burdon): https://forum.serverless.com/t/serverless-vs-aws-sam-aws-serverless-express/2784

import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';

import { createApp } from './src/server';

let app = createApp(app => {
  app.use(awsServerlessExpressMiddleware.eventContext());
});

let server = awsServerlessExpress.createServer(app);

module.exports = {

  site: (event, context, callback) => {
    awsServerlessExpress.proxy(server, event, context);
  }
};
