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

  /**
   * @param {{ domain, type, id }} key
   * @return {string} E.g., example.com/red:test:xxx
   */
  static encodeKey(key) {
    let { domain, type, id } = key;
    console.assert(type && id);
    let str = type + ':' + id;
    return domain ? (domain + ':' + str) : str;
  }

  static decodeKey(key) {
    console.assert(key);
    let parts = key.split(':');
    if (parts.length === 2) {
      let [ type, id ] = parts;
      console.assert(type && id);
      return {
        type, id
      };
    } else {
      let [ domain, type, id ] = parts;
      console.assert(domain && type && id);
      return {
        domain, type, id
      };
    }
  }
}
