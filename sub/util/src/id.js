//
// Copyright 2017 Alien Labs.
//

import uuidv4 from 'uuid/v4';

export class ID {

  static createId() {
    return uuidv4();
  }
}
