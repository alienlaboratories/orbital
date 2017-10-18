# OrbitalDB

## Demo

https://www.orbitaldb.com


## Getting Started

~~~~
  yarn install
  jest
~~~~


## Purpose

- Multi-dimensional Graph Database with GraphQL API.
- Implemented as Lambda service.
- DynamoDB backend + Elasticsearch backend (or other tech?)
- Command line interface (GraphQL queries).
- Extensible service registry (implemented as Lambda service).
- Users able to deploy service agents as Lambda services, and then register these services with the database (via CLI).
- Third-party services are triggered by database mutations; services can query and mutate the graph.


## Troubleshooting

### Tools
- `yarn remove` fails: https://github.com/yarnpkg/yarn/issues/4334
  - workaround: remove modules from sub package and run yarn install from root.
- `yarn global add` fails with workspace dependencies.
- Pycharm graphql plugin doesn't handle multiple schema files?

### Compile
- NOTE: GraphQL files are cached: `jest --no-cache` (or rm -rf /tmp/jest)
- `You may need an appropriate loader to handle this file type.`
  - Ensure `.babelrc` in each module.
  - Ensure `babel-loader` rule configured in webpack for each submodule.
- `module initialization error: ReferenceError`
  - Check babel configuration (e.g., missing plugin to adapt to browser/node version.)

### Runtime
- `Unable to import module 'handler': Error`
  - Ensure packate.json up-to-date.


## IDEAS

- Serverless Services (e.g., thumbnails)
  - https://github.com/serverless/serverless#services-v10
- Serverless Plugins
  - https://github.com/serverless/serverless#plugins-v10
  
// TODO(burdon): Swagger (OpenAPI)
// https://swagger.io/specification
// https://github.com/boazdejong/serverless-graphql-api
