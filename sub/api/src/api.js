//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';

import { DB } from './db/api';
import { Registry } from './registry/api';

/**
 * API config.
 */
class Config {

  static DEFAULTS = {
    url: 'https://api.orbitaldb.com'
  };

  _config = null;

  get properties() {
    return this._config;
  }

  /**
   * @param {{ verbose, url }} config
   */
  update(config) {
    console.assert(config && config.API_KEY, 'API_KEY must be set.');
    this._config = _.defaults(config, Config.DEFAULTS);
  }
}

/**
 * Root API class.
 */
export class Orb {

  static _config = new Config();

  static get config() {
    return Orb._config;
  }

  static DB() {
    return new DB(Orb._config.properties);
  }

  static Registry() {
    return new Registry(Orb._config.properties);
  }
}
