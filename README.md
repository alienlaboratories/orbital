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




## Issues

- yarn remove failes: https://github.com/yarnpkg/yarn/issues/4334
  - workaround: remove modules from sub package and run yarn install from root

- yarn global add (CLI) fails with workspace dependencies

- graphql plugin multiple schema files? Merge
