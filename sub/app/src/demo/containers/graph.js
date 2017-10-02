//
// Copyright 2017 Alien Labs.
//

import * as d3 from 'd3';
import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';

import { ReactUtil } from '../util';
import { D3Canvas } from '../component/d3';

// TODO(burdon): Contact network from email service.
// TODO(burdon): Extract text from email messages. Topics.

/**
 * Graph of nodes.
 */
class Graph extends React.Component {

  renderD3(node, data) {
    let center = { x: node.clientWidth / 2, y: node.clientHeight / 2 };
    console.log('!!!', center);

    let nodes = [
      { id: 'I1', title: 'Item 1' },
      { id: 'I2', title: 'Item 2' },
      { id: 'I3', title: 'Item 3' },
    ];

    // https://github.com/d3/d3-force
    let force = d3.forceSimulation(nodes);

    console.log(node);

    d3.select(node).append('g')
      .selectAll('circle')
        .data(force.nodes())
        .enter()
      .append('circle')
        .attr('r', 6);
  }

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props);

    return (
      <D3Canvas { ...defaultAttrs } data={ this.state } renderer={ this.renderD3.bind(this) }/>
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
