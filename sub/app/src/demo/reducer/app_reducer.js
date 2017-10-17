//
// Copyright 2017 Alien Labs.
//

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

  static selectDomain(uri) {
    return {
      type: AppReducer.ACTION_DOMAIN_SELECT,
      uri
    };
  }

  static selectedActive(uri, active) {
    return {
      type: AppReducer.ACTION_DOMAIN_STATE,
      uri,
      active
    };
  }

  _state = {
    selectedItem: null,
    selectedDomain: '_',
    activeDomains: [ '_' ]
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
          let { uri } = action;
          return _.assign({}, state, { selectedDomain: uri || '_' });
        }

        case AppReducer.ACTION_DOMAIN_STATE: {
          let { uri, active } = action;
          let { activeDomains } = state;

          let domains;
          if (active) {
            domains = _.union(activeDomains, [uri]);
          } else {
            domains = _.without(activeDomains, uri);
          }

          return _.assign({}, state, { activeDomains: domains });
        }
      }

      return state;
    };
  }
}
