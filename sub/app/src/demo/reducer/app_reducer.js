//
// Copyright 2017 Alien Labs.
//

/**
 * Main App reducer.
 */
export class AppReducer {

  static NS = 'app';

  static ACTION_SELECT = 'select';

  static state(state) {
    return _.get(state, AppReducer.NS);
  }

  static selectItem(key) {
    return {
      type: AppReducer.ACTION_SELECT,
      key
    };
  }

  _state = {
    selectedItem: null
  };

  get state() {
    return this._state;
  }

  reducer(initialState = {}) {
    return (state = initialState, action) => {
      switch (action.type) {
        case AppReducer.ACTION_SELECT: {
          let { key } = action;
          return _.assign({}, state, { selectedItem: key });
        }
      }

      return state;
    };
  }
}