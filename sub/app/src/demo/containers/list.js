//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';

import { ReactUtil } from '../component/util';

/**
 * List of nodes.
 */
class List extends React.Component {

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props);
    let { result: { nodes } } = this.props;

    let list = _.map(nodes, ({ id, title }) => (
      <div key={ id }>{ title }</div>
    ));

    return (
      <div { ...defaultAttrs }>{ list }</div>
    );
  }
}

const NodeQuery = gql`
  query NodeQuery($query: Query!) {
    result: query(query: $query) {
      nodes {
        id
        title
      }
    }
  }
`;

export const ListContainer = compose(graphql(NodeQuery, {

  options: (props) => {
    let { pollInterval } = props;
    return {
      variables: {
        query: {}
      },
      pollInterval
    };
  },

  props: ({ ownProps, data }) => {
    let { errors, loading, result={} } = data;
    return {
      errors, loading, result
    };
  }

}))(List);
