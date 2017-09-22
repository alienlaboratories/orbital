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

  API_URL="https://psuwih37r6.execute-api.us-east-1.amazonaws.com/dev/status"
  curl ${API_URL}
  curl -i -X POST ${API_URL} -H "Content-Type: application/json" -d "{}"

  sls invoke -f status | jq

  sls logs -f status -t

  sls remove
~~~~
