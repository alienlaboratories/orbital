//
// Copyright 2017 Alien Labs.
//

// TODO(burdon): webpack-dev-server

import { get, plugins } from 'popsicle';

// TODO(burdon): React.
// TODO(burdon): Router.
// TODO(burdon): Apollo.

// https://github.com/99xt/serverless-react-boilerplate
// https://github.com/serverlessbuch/jwtAuthorizr

const config = window.config;

class App {

  init() {
    let { rootId, apiRoot } = config;

    get(apiRoot + '/status')
      .use(plugins.parse(['json', 'urlencoded']))
      .then(result => {
        document.getElementById(rootId).innerText = JSON.stringify(result);
      });
  }
}

new App().init();
