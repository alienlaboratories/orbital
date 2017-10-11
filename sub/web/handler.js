//
// Copyright 2017 Alien Labs.
//

import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';

import { createApp } from './src/server';

// https://github.com/awslabs/aws-serverless-express/blob/master/example/app.js

let app = createApp(app => {
  app.use(awsServerlessExpressMiddleware.eventContext());
});

let server = awsServerlessExpress.createServer(app);

module.exports = {

  site: (event, context) => {
    awsServerlessExpress.proxy(server, event, context);
  }
};
