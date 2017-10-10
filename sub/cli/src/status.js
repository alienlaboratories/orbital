//
// Copyright 2017 Alien Labs.
//

import { Orb } from 'orbital-api';

import request from 'request';

export const Status = (config) => {
  let { url } = Orb.config.properties;

  return {
    command: ['status', 'stat'],
    describe: 'Service status',
    handler: argv => {
      argv._result = new Promise((resolve, reject) => {
        request.get(url + '/status', (error, response, body) => {
          console.log(JSON.stringify(JSON.parse(body)));
          resolve();
        });
      });
    }
  };
};
