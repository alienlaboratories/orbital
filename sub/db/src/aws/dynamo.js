//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import AWS from 'aws-sdk';

import { Database, Transforms } from 'orbital-db-core';
import { AWSUtil } from 'orbital-node-util';
import { ID, TypeUtil } from 'orbital-util';

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

  static recordToItem(item) {
    let data = JSON.parse(_.get(item, 'Data.S'));

    return {
      key: {
        domain: _.get(item, 'DomainUri.S'),
        ...ID.decodeKey(_.get(item, 'ItemKey.S'))
      },

      ...data
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
    let { domains=[Database.DEFAULT_DOMAIN] } = query || {};

    return Promise.all(_.map(domains, domain => {
      return this._queryDomain(_.omit(query, 'domains'), domain);
    })).then(results => {
      // TODO(burdon): If multiple domains, then join.
      return TypeUtil.deepMerge({ items: [] }, ...results);
    });
  }

  /**
   * Query individual domain.
   * NOTE: Can't query across multiple HASH keys.
   */
  _queryDomain(query, domain) {
    console.assert(query && domain);

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
      let items = _.map(_.get(result, 'Items'), record => {
        return DynamoDatabase.recordToItem(record);
      });

      return {
        items
      };
    });
  }

  update(batches) {

    // TODO(burdon): babel-preset-env should allow async syntax?

    let promises = _.map(batches, batch => {
      let { domain=Database.DEFAULT_DOMAIN, mutations } = batch;

      // TODO(burdon): Query by ID.
      return this._queryDomain({}, domain).then(result => {
        let { items:currentItems } = result;
        let currentItemMap = _.keyBy(currentItems, 'key.id');

        let items = [];
        return AWSUtil.promisify(callback => {

          // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchWriteItem-property
          this._dynamodb.batchWriteItem({
            RequestItems: {
              [DynamoDatabase.TABLE_NAME]: _.map(mutations, mutation => {
                let { key, mutations } = mutation;
                let { id } = key;

                // TODO(burdon): Separate field for meta, data, etc.
                let data = _.omit(currentItemMap[id], 'key') || {};
                Transforms.applyObjectMutations({}, data, mutations);

                let record = {
                  'DomainUri': AWSUtil.Property.S(domain),
                  'ItemKey': AWSUtil.Property.S(ID.encodeKey(key)),
                  'Data': AWSUtil.Property.S(JSON.stringify(data))
                };

                items.push(DynamoDatabase.recordToItem(record));

                return {
                  PutRequest: {
                    Item: record
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
