//
// Copyright 2017 Alien Labs.
//

module.exports = {

  status: (event, context, callback) => {
    console.log('Status handler.');

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ message: 'OK' })
    });
  },
};
