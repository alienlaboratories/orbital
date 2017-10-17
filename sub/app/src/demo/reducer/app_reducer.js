//
// Copyright 2017 Alien Labs.
//

import { TypeUtil } from 'orbital-util';

/**
 * Main App reducer.
 */
export class AppReducer {

  static NS = 'app';

  static ACTION_ITEM_SELECT     = 'item.select';
  static ACTION_DOMAIN_SELECT   = 'domain.select';
  static ACTION_DOMAIN_STATE    = 'domain.state';

  static state(state) {
    return _.get(state, AppReducer.NS);
  }

  /**
   * @param {String} key Encoded key.
   */
  static selectItem(key) {
    return {
      type: AppReducer.ACTION_ITEM_SELECT,
      key
    };
  }

  static selectDomain(key) {
    return {
      type: AppReducer.ACTION_DOMAIN_SELECT,
      key
    };
  }

  static setDomainState(key, state) {
    return {
      type: AppReducer.ACTION_DOMAIN_STATE,
      key,
      state
    };
  }

  _state = {
    selectedItem: null,
    selectedDomain: null,
    domainStates: {}
  };

  get state() {
    return this._state;
  }

  reducer(initialState = {}) {
    return (state = initialState, action) => {
      switch (action.type) {

        case AppReducer.ACTION_ITEM_SELECT: {
          let { key } = action;
          return _.assign({}, state, { selectedItem: key });
        }

        case AppReducer.ACTION_DOMAIN_SELECT: {
          let { key } = action;
          return _.assign({}, state, { selectedDomain: key });
        }

        case AppReducer.ACTION_DOMAIN_STATE: {
          let { key, state:domainState } = action;
          let { domainStates } = state;
          // TODO(burdon): TypeUtil merge?
          _.set(domainStates, key, domainState);
          return _.assign({}, state, { domainStates });
        }
      }

      return state;
    };
  }
}
