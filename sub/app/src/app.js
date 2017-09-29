//
// Copyright 2017 Alien Labs.
//

// TODO(burdon): webpack-dev-server
// TODO(burdon): Apollo

// https://github.com/99xt/serverless-react-boilerplate
// https://github.com/serverlessbuch/jwtAuthorizr

// TODO(burdon): https://www.npmjs.com/package/popsicle#usage
const popsicle = require('popsicle');

class App {

  init() {
    const url = 'https://t2isk8i7ek.execute-api.us-east-1.amazonaws.com/dev/status';

    popsicle.get(url)
      .use(popsicle.plugins.parse(['json', 'urlencoded']))
      .then(result => {
        console.log(JSON.stringify(result));
      });
  }
}

new App().init();
