//
// Copyright 2017 Alien Labs.
//

import uuidv4 from 'uuid/v4';

/**
 * ID Utils.
 */
export class ID {

  static createId() {
    return uuidv4();
  }

  static encodeKey(key) {
    let { type, id } = key;
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
}
