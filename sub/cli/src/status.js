//
// Copyright 2017 Alien Labs.
//

import request from 'request';

export const Status = (config) => {
  const { ApiEndpoint } = config;

  return {
    command: ['status', 'stat'],
    describe: 'Service status',
    handler: argv => {
      argv._result = new Promise((resolve, reject) => {

        request.get(ApiEndpoint + '/status', (error, response, body) => {
          console.log(JSON.stringify(JSON.parse(body)));
          resolve();
        });

      });
    }
  };
};
