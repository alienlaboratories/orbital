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

  // TODO(burdon): Schema (property types)?
  static recordToItem(item) {
    return {
      id: _.get(item, 'DomainUri.S') + '/' + _.get(item, 'Key.S'),
      title: _.get(item, 'Data.M.title.S')
    };
  }

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
        return DynamoDatabase.recordToItem(item);
      });

      return {
        nodes
      };
    });
  }

  update(batches) {
    let promises = _.map(batches, batch => {
      let { mutations } = batch;

      let nodes = [];
      return AWSUtil.promisify(callback => {

        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchWriteItem-property
        this._dynamodb.batchWriteItem({
          RequestItems: {
            [DynamoDatabase.TABLE_NAME]: _.map(mutations, mutation => {
              let { id, mutations } = mutation;

              // TODO(burdon): Apply mutations.
              let data = {};
              _.each(mutations, mutation => {
                let { key, value } = mutation;
                data[key] = AWSUtil.Property.S(value);
              });

              let item = {
                'DomainUri': AWSUtil.Property.S(Database.DEFAULT_DOMAIN),
                'Key': AWSUtil.Property.S(id),
                'Data': {
                  M: data
                }
              };

              nodes.push(DynamoDatabase.recordToItem(item));

              return {
                PutRequest: {
                  Item: item
                }
              };
            })
          }
        }, callback);
      }).then(result => {
        return {
          nodes
        };
      });
    });

    return Promise.all(promises);
  }

  clear() {
    let { domain=Database.DEFAULT_DOMAIN } = {};

    // TODO(burdon): Page query.
    return AWSUtil.promisify(callback => {

      // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property
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
      return AWSUtil.promisify(callback => {
        let items = _.map(_.get(result, 'Items'));

        // TODO(burdon): Iterate (batch size is 25).
        items = _.slice(items, 0, 25);

        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchWriteItem-property
        this._dynamodb.batchWriteItem({
          RequestItems: {
            [DynamoDatabase.TABLE_NAME]: _.map(items, item => {
              let { Key, DomainUri } = item;

              return {
                DeleteRequest: {

                  // TODO(burdon): Disambiguate Key.
                  Key: {
                    Key,
                    DomainUri
                  }
                }
              };
            })
          }
        }, callback);
      });
    });
  }
}
