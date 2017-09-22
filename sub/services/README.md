# Orbital Framework Services (Serverless)

Module created via:

~~~~
  sls create --template aws-nodejs --path sub/services
~~~~

## Getting Started

TODO(burdon): Set-up AWS instructions.

~~~~
  sls deploy -v
  sls deploy function -f status
  
  aws lambda list-functions

  sls invoke -f status | jq

  sls logs -f status -t

  sls remove
~~~~
