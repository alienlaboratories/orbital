//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';

import { ReactUtil } from '../util';

// TODO(burdon): Factor out renderer.
// http://bl.ocks.org/mbostock/1153292

// TODO(burdon): Contact network from email service.
// TODO(burdon): Extract text from email messages. Topics.

/**
 * Graph of nodes.
 */
class Graph extends React.Component {

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props, { className: 'orb-d3-canvas' });
    // let { result: { nodes } } = this.props;

    return (
      <svg ref={ node => this.node = node } { ...defaultAttrs }/>
    );
  }
}

const GraphQuery = gql`
  query GraphQuery($query: Query!) {
    result: query(query: $query) {
      nodes {
        id
        title
      }
    }
  }
`;

export const GraphContainer = compose(graphql(GraphQuery, {

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

}))(Graph);
