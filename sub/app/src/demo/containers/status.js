//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';

/**
 *
 */
class Status extends React.Component {
  render() {
    let { result: { version } } = this.props;

    return (
      <div>DB: { version }</div>
    );
  }
}

const StatusQuery = gql`
  query StatusQuery {
    result: status {
      version
    }
  }
`;

export const StatusContainer = compose(graphql(StatusQuery, {

  options: (props) => {
    let { pollInterval } = props;
    return {
      variables: {},
      pollInterval
    };
  },

  props: ({ ownProps, data }) => {
    let { errors, loading, result={} } = data;
    return {
      errors, loading, result
    };
  }

}))(Status);
