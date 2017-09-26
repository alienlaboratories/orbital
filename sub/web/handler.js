//
// Copyright 2017 Alien Labs.
//

// TODO(burdon): Test templates.
// TODO(burdon): Map serverless path to routes?
// https://github.com/awslabs/aws-serverless-express/blob/master/example/app.js

import awsServerlessExpress from 'aws-serverless-express';

import express from 'express';

const app = express();

app.get('/home', (req, res) => {
  res.json({ test: true });
});

const server = awsServerlessExpress.createServer(app);

module.exports = {

  home: (event, context, callback) => {
    awsServerlessExpress.proxy(server, event, context);
  }

};
