//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';

/**
 * General utils.
 */
export class Util {

  static defaults(obj, defaults) {
    _.each(defaults, (defaultValue, key) => {
      obj[key] = _.get(obj, key, defaultValue);
    });

    return obj;
  }
}
