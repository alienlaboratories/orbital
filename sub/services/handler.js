//
// Copyright 2017 Alien Labs.
//

module.exports = {

  hello: (event, context, callback) => {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Orbital OK.',
        input: event,
      }),
    });
  }

};
