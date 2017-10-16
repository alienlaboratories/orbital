#!/usr/bin/env bash

# http://docs.aws.amazon.com/cli/latest/reference/dynamodb/index.html#cli-aws-dynamodb
# http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html
# http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithTables.html#WorkingWithTables.primary.key

#
# Dashboard
# https://console.aws.amazon.com/dynamodb/home#tables
#

#
# Composite Primary Key:
# Partition Key:  Domain (hash for sharding).
# Sort Key:       Key: <Type-ID>
# http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey
#

# http://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html
# https://github.com/serverless/examples/tree/master/aws-node-rest-api-with-dynamodb
# https://github.com/serverless/examples/blob/master/aws-node-rest-api-with-dynamodb/todos/create.js

# TODO(burdon): Move to admin CLI?

ENDPOINT=""

ENDPOINT=0

for i in "$@"
do
case $i in

  --local)
  ENDPOINT="--endpoint-url http://localhost:8000"
  ;;

  delete)
  echo "Deleting (can take a minute...)"
  aws dynamodb delete-table ${ENDPOINT} --table-name Items
  ;;

  create)
  aws dynamodb create-table ${ENDPOINT} --cli-input-json file://./config/items.json
  ;;

  list)
  aws dynamodb list-tables ${ENDPOINT}
  ;;
esac
done
