//
// Copyright 2017 Alien Labs.
//

import request from 'request';

/**
 * GraphQL Client.
 */
export class ApiClient {

  constructor(config) {
    this._config = config;
  }

  query(query, variables, options={}) {
    let { url, apiKey } = this._config;

    const args = {
      url,

      headers: {
        'User-Agent': 'orbital-cli',
        'Content-Type': 'application/json',
        'Accept': '*/*',

        // https://swagger.io/docs/specification/authentication/api-keys
        'X-API-Key': apiKey,

//      'Authorization': ''   // JWT
      },

      body: JSON.stringify({
        query,
        variables
      })
    };

//  console.log(JSON.stringify(options, 0, 2));

    // Errors:
    // {"message":"Missing Authentication Token"} Bad URL or method.
    // curl -i -X POST https://t2isk8i7ek.execute-api.us-east-1.amazonaws.com/dev/registry -H "Content-Type: application/json" -d "{ query:\"\" }"

    // TODO(burdon):
    // https://github.com/serverless/serverless-graphql-apollo

    return new Promise((resolve, reject) => {
      request.post(args, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          if (options.verbose) {
            let { headers } = response;
            console.log(JSON.stringify({ headers }, null, 2));
          }

          switch (response.statusCode) {
            case 200: {
              resolve(JSON.parse(body));
              break;
            }

            default: {
              reject(response.statusCode);
            }
          }
        }
      });
    });
  }
}
