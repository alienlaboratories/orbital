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

  // ID by convention.
  state = {
    nodes: [
      { id: 'I1', title: 'Item 1' },
      { id: 'I2', title: 'Item 2' },
      { id: 'I3', title: 'Item 3' },
      { id: 'I4', title: 'Item 4' },
      { id: 'I5', title: 'Item 5' },
    ]
  };

  constructor() {
    super();

    this.group = null;

    // https://github.com/d3/d3-force
    // https://bl.ocks.org/shimizu/e6209de87cdddde38dadbb746feaf3a3
    this.simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .on('tick', () => {
        this.group.selectAll('circle')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      });
  }

  renderD3(root, data) {
    let center = { x: root.clientWidth / 2, y: root.clientHeight / 2 };

    // TODO(burdon): Init.
    if (!this.group) {
      this.group = d3.select(root).append('g');
      this.simulation.force('center', d3.forceCenter(center.x, center.y));
    }

    // TODO(burdon): When data changes. I.e., D3Canvas when properties change.
    let { nodes } = data;
    this.simulation.nodes(nodes);

    this.group
      .selectAll('circle')
        .data(this.simulation.nodes())
      .enter()
        .append('circle')
          .attr('id', d => d.id)
          .attr('r', d => 10 + Math.random() * 10)
      .exit()
        .remove();
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
