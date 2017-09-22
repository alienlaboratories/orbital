//
// Copyright 2017 Alien Labs.
//

module.exports = {

  status: (event, context, callback) => {
    callback(null, {
      statusCode: 200,
      body: {
        version: process.env['VERSION']
      }
    });
  }

};
