//
// Copyright 2017 Alien Labs.
//

import PropTypes from 'prop-types';
import React from 'react';

// TODO(burdon): Factor out.
// TODO(burdon): Subscriptions: http://dev.apollodata.com/react/receiving-updates.html#Subscriptions
// TODO(burdon): Polling spools up additional instance. Back-off?

/**
 * Query manager.
 */
export class QueryManager {

  _queryMap = new Map();

  refetch() {
    this._queryMap.forEach((refetch, queryId) => {
      refetch().then(r => {
        console.log('Updated:', queryId);
      });
    });
  }

  registerQuery(queryId, refetch) {
    console.assert(queryId, 'Invalid queryID');
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
      let { queryId } = this.props;
      let { queryManager } = this.context;
      queryManager.registerQuery(queryId, () => {
        // TODO(burdon): If many queries, then name and list them.
        let { refetch } = this.props;
        console.assert(refetch, 'Return refetch property in graphql HOC.');
        return refetch();
      });
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
