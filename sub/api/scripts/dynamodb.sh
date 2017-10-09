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

# TODO(burdon): DynamoDB
# http://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html
# https://github.com/serverless/examples/tree/master/aws-node-rest-api-with-dynamodb
# https://github.com/serverless/examples/blob/master/aws-node-rest-api-with-dynamodb/todos/create.js

for i in "$@"
do
case $i in
  delete)
  echo "Deleting (can take a minute...)"
  aws dynamodb delete-table --table-name Items
  ;;
  create)
  aws dynamodb create-table --cli-input-json file://./config/items.json
  ;;
  update)
  aws dynamodb update-table --cli-input-json file://./config/items_update.json
  ;;
  list)
  aws dynamodb list-tables
  ;;
esac
done
