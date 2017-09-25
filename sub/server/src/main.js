//
// Copyright 2017 Alien Labs.
//

import express from 'express';

const app = express();

const port = 3000;

app.post('/', (req, res) => {
  let { method, baseUrl, params, query, headers } = req;

  let response = {
    method,
    headers,
    baseUrl,
    params,
    query
  };

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(response, null, 2));

  console.log(JSON.stringify(response, null, 2));
});

app.listen(port, () => {
  console.log('http://localhost:' + port);
});
