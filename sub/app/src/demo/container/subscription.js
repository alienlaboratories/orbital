//
// Copyright 2017 Alien Labs.
//

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Query manager.
 */
export class QueryManager {

  _queryMap = new Map();

  refetch() {
    this._queryMap.forEach((refetch, queryId) => {
      refetch();
    });
  }

  registerQuery(queryId, refetch) {
    console.assert(queryId && refetch);
    this._queryMap.set(queryId, refetch);
  }

  unregisterQuery(queryId) {
    console.assert(queryId);
    this._queryMap.remove(queryId);
  }
}

/**
 * Subscription HOC.
 * @param WrappedComponent
 */
export const subscribe = (WrappedComponent) => {

  return class extends React.Component {

    static contextTypes = {
      queryManager: PropTypes.object.isRequired
    };

    componentDidMount() {
      let { queryId, refetch } = this.props;
      let { queryManager } = this.context;
      queryManager.registerQuery(queryId, refetch);
    }

    componentWillUnmount() {
      let { queryId } = this.props;
      let { queryManager } = this.context;
      queryManager.unregisterQuery(queryId);
    }

    render() {
      return <WrappedComponent { ...this.props }/>;
    }
  };
};
