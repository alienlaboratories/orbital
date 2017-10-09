# Orbital

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



## Domains

- https://serverless.com/blog/api-gateway-multiple-services

1. Register name and cert with AWS.
  - http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/registrar.html
  - https://serverless.com/blog/serverless-api-gateway-domain
  - Approve email

NOTE: Takes about an hour for sls delete_domain to release CERT.


## Tools

// TODO(burdon): babel-preset-env; remove stage-0


// const slsw = require('serverless-webpack');
// sls local testing


## Issues

- yarn remove failes: https://github.com/yarnpkg/yarn/issues/4334
  - workaround: remove modules from sub package and run yarn install from root

- yarn global add (CLI) fails with workspace dependencies

- graphql plugin multiple schema files? Merge

- Object.defineProperty(exports, '__esModule'

