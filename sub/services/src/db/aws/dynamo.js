//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import AWS from 'aws-sdk';

import { AWSUtil } from '../../util/aws';

import { Database } from '../database';

/**
 * DynamoDB implementation.
 */
export class DynamoDatabase extends Database {

  static TABLE_NAME = 'Items';

  // https://console.aws.amazon.com/dynamodb/home#tables:selected=Items

  // https://aws.amazon.com/sdk-for-node-js
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html

  constructor() {
    super();
    this._dynamodb = new AWS.DynamoDB();
  }

  test() {
    return AWSUtil.promisify(callback => {
      this._dynamodb.listTables({}, callback);
    }).then(result => {
      console.assert(-1 !== _.indexOf(_.get(result, 'TableNames'), DynamoDatabase.TABLE_NAME),
        'Missing table:', DynamoDatabase.TABLE_NAME);
      return true;
    });
  }

  query(query) {
    let { domain=Database.DEFAULT_DOMAIN } = query || {};

    return AWSUtil.promisify(callback => {

      // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property
      // http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html
      this._dynamodb.query({
        TableName: DynamoDatabase.TABLE_NAME,
        KeyConditionExpression: 'DomainUri = :v1',
        ExpressionAttributeValues: {
          ':v1': {
            S: domain
          }
        }
      }, callback);
    }).then(result => {
      let nodes = _.map(_.get(result, 'Items'), item => {

        // TODO(burdon): Schema (property types)?
        return {
          id: _.get(item, 'DomainUri.S') + '/' + _.get(item, 'Key.S'),
          title: _.get(item, 'Data.M.title.S')
        };
      });

      return {
        nodes
      };
    });
  }

  update(batches) {
    let promises = _.map(batches, batch => {
      let { mutations } = batch;

      return AWSUtil.promisify(callback => {

        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchWriteItem-property
        this._dynamodb.batchWriteItem({
          RequestItems: {
            [DynamoDatabase.TABLE_NAME]: _.map(mutations, mutation => {
              let { id, mutations } = mutation;

              // TODO(burdon): Apply mutations.
              // TODO(burdon): Schema (property types)?
              let data = {};
              _.each(mutations, mutation => {
                let { key, value } = mutation;
                data[key] = AWSUtil.Property.S(value);
              });

              return {
                PutRequest: {
                  Item: {
                    'DomainUri': AWSUtil.Property.S(Database.DEFAULT_DOMAIN),
                    'Key': AWSUtil.Property.S(id),
                    'Data': {
                      M: data
                    }
                  }
                }
              };
            })
          }
        }, callback);
      }).then(result => {

        // TODO(burdon): Update mutated nodes.
        return {
          nodes: []
        };
      });
    });

    return Promise.all(promises);
  }

  clear() {
    // TODO(burdon): Query items then BatchWriteItem.
  }
}
