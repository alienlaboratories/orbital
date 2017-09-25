//
// Copyright 2017 Alien Labs.
//

import request from 'request';

export const Registry = (config) => {
  const { ApiEndpoint } = config;

  return {
    command: ['registry', 'reg'],
    describe: 'Registry API.',
    builder: yargs => yargs

      // TODO(burdon): Set/add/update service.

      .command({
        command: 'list',
        describe: 'List services',
        handler: argv => {
          argv._result = new Promise((resolve, reject) => {

            // Testing.
            // url: 'http://graphql.org/swapi-graphql',
            // http://graphql.org/swapi-graphql/?query=%7B%0A%20%20allFilms%20%7B%0A%20%20%20%20films%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&operationName=null

            const query = `
              query RootQuery($query: ServiceQuery!) {
                getServices(query: $query) {
                  id
                  provider
                  title
                }
              }
            `;

            let variables = {
              query: {
                provider: 'test.com'
              }
            };

            const options = {
              url: ApiEndpoint + '/registry',

              headers: {
                'User-Agent': 'orbital-cli',
                'Content-Type': 'application/json',
                'Accept': '*/*',
//              'Authorization': 'None'
              },

              body: JSON.stringify({
                query,
                variables
              })
            };

//          console.log(JSON.stringify(options, 0, 2));

            // Errors:
            // {"message":"Missing Authentication Token"} Bad URL or method.
            // curl -i -X POST https://t2isk8i7ek.execute-api.us-east-1.amazonaws.com/dev/registry -H "Content-Type: application/json" -d "{ query:\"\" }"

            // TODO(burdon):
            // https://github.com/serverless/serverless-graphql-apollo

            request.post(options, (error, response, body) => {
              if (error) {
                reject(error);
              } else {
                if (argv.verbose) {
                  let { headers } = response;
                  console.log(JSON.stringify({ headers }, null, 2));
                }

                let json = JSON.parse(body);
                console.log(JSON.stringify(json, null, 2));
                resolve();
              }
            });
          });
        }
      })

      .help()
  };
};
