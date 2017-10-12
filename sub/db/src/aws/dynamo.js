//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import AWS from 'aws-sdk';

import { AWSUtil } from 'orbital-node-util';
import { Database } from 'orbital-db-core';

/**
 * DynamoDB implementation.
 */
export class DynamoDatabase extends Database {

  static MAX_BATCH_SIZE = 25;

  // Key Structure
  // http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey
  //
  // item {
  //   domain       google.com/mail/team-X
  //   type         contact
  //   id           x-123
  // }
  //
  // Permalink:     google.com/mail/team-X:contact/x-123

  static encodeKey(type, id) {
    console.assert(type && id);
    return type + '/' + id;
  }

  static decodeKey(key) {
    console.assert(key);
    let [ type, id ] = key.split('/');
    return {
      type, id
    };
  }

  // TODO(burdon): Schema (property types)?
  static recordToItem(item) {
    return {
      domain: _.get(item, 'DomainUri.S'),

      ...DynamoDatabase.decodeKey(_.get(item, 'ItemKey.S')),

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

      // TODO(burdon): Sort by timestamp.
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
      let items = _.map(_.get(result, 'Items'), item => {
        return DynamoDatabase.recordToItem(item);
      });

      return {
        items
      };
    });
  }

  update(batches) {
    let promises = _.map(batches, batch => {
      let { mutations } = batch;

      let items = [];
      return AWSUtil.promisify(callback => {

        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchWriteItem-property
        this._dynamodb.batchWriteItem({
          RequestItems: {
            [DynamoDatabase.TABLE_NAME]: _.map(mutations, mutation => {
              let { type, id, mutations } = mutation;

              // TODO(burdon): Apply mutations.
              let data = {};
              _.each(mutations, mutation => {
                let { key, value } = mutation;
                data[key] = AWSUtil.Property.S(value);
              });

              let item = {
                'DomainUri': AWSUtil.Property.S(Database.DEFAULT_DOMAIN),
                'ItemKey': AWSUtil.Property.S(DynamoDatabase.encodeKey(type, id)),
                'Data': {
                  M: data
                }
              };

              items.push(DynamoDatabase.recordToItem(item));

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
          items
        };
      });
    });

    return Promise.all(promises);
  }

  clear() {
    let { domain=Database.DEFAULT_DOMAIN } = {};

    // TODO(burdon): Page query (max 1M results).
    // http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#Query.Pagination

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
      let chunks = _.chunk(_.get(result, 'Items'), DynamoDatabase.MAX_BATCH_SIZE);

      return Promise.all(_.map(chunks, items => {

        return AWSUtil.promisify(callback => {

          // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchWriteItem-property
          this._dynamodb.batchWriteItem({
            RequestItems: {
              [DynamoDatabase.TABLE_NAME]: _.map(items, item => {
                let { ItemKey, DomainUri } = item;

                return {
                  DeleteRequest: {
                    Key: {
                      DomainUri,
                      ItemKey
                    }
                  }
                };
              })
            }
          }, callback);
        });

      }));
    });
  }
}
