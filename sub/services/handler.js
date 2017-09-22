//
// Copyright 2017 Alien Labs.
//

module.exports = {

  status: (event, context, callback) => {
    let message = {
      version: process.env['VERSION']
    };

    console.log('Status:', JSON.stringify(message));

    // TODO(burdon): When invoking from sls invoke the body can be JSON.
    // From curl unless a string is returned we get 502 (Bad Gateway).
    // https://medium.com/@jconning/tutorial-aws-lambda-with-api-gateway-36a8513ec8e3

    callback(null, {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  }

};
