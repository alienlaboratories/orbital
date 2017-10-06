//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';

import { ReactUtil } from '../component/util';

/**
 * Statusbar.
 */
class Status extends React.Component {

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props);
    let { result: { version } } = this.props;

    return (
      <div { ...defaultAttrs }>Version: { version }</div>
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
