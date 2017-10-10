//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import AWS from 'aws-sdk';

/**
 * Queue wrapper (AWS).
 */
export class AWSUtil {

  /**
   * AWS config.
   * @param {{ aws }} config
   * @param user
   */
  static config(config, user) {
    console.assert(config && user);

    // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
    AWS.config.update({
      region: _.get(config, 'aws.region'),
      accessKeyId: _.get(config, `aws.users.${user}.aws_access_key_id`),
      secretAccessKey: _.get(config, `aws.users.${user}.aws_secret_access_key`)
    });
  }

  /**
   * Convert AWS API calls to promises.
   *
   * promisify(callback => { api.call(params, callback); }).then(result => {});
   *
   * @param apiCall
   */
  static promisify(apiCall) {
    return new Promise((resolve, reject) => {
      apiCall((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  static Property = {
    S: (value) => {
      return { S: value };
    }
  }
}
