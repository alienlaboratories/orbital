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
- Command line interface (using Lokka for GraphQL queries).
- Extensible service registry (implemented as Lambda service).
- Users able to deploy service agents as Lambda services, and then register these services with the database (via CLI).
- Third-party services are triggered by database mutations; services can query and mutate the graph.
