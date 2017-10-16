#!/usr/bin/env bash

PORT=8000

echo
echo "Starting... (use the following command to test)"
echo aws dynamodb list-tables --endpoint-url http://localhost:$PORT
echo

# http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.Endpoint.html

dynamodb-local -sharedDb -port $PORT
