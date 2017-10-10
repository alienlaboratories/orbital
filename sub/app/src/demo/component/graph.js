//
// Copyright 2017 Alien Labs.
//

import React from 'react';
import * as d3 from 'd3';

import { D3Canvas } from './d3';
import { ReactUtil } from './util';

/**
 * Graph of nodes.
 */
export class Graph extends React.Component {

  constructor() {
    super();

    this._group = null;

    // https://github.com/d3/d3-force
    // https://bl.ocks.org/shimizu/e6209de87cdddde38dadbb746feaf3a3
    this._simulation = d3.forceSimulation()
      .alphaTarget(1)
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .on('tick', () => {
        console.assert(this._group);
        this._group.selectAll('circle')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      });
  }

  componentWillReceiveProps(nextProps) {
    let { nodes } = nextProps;

    console.log('::::::::::', JSON.stringify(nodes, null, 2));

    // TODO(burdon): Adapter.
    this.setState({
      nodes: _.map(nodes, n => _.pick(n, 'id', 'title'))
    });
  }

  handleInit(root) {
    this._group = d3.select(root).append('g');

    let center = { x: root.clientWidth / 2, y: root.clientHeight / 2 };
    this._simulation.force('center', d3.forceCenter(center.x, center.y));
  }

  handleRender(root) {
    let { nodes = [] } = this.state;
    console.log('handleRender', _.size(nodes));

    let circles = this._group
      .selectAll('circle')
      .data(this._simulation.nodes());

    circles
      .enter()
        .append('circle')
        .attr('id', d => d.id)
        .attr('r', d => 10 + Math.random() * 10);

    circles
      .exit()
        .remove();
  }

  handleResize(root, size) {
    this._simulation.force('center', d3.forceCenter(size.width / 2, size.height / 2));
  }

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props);

    return (
      <D3Canvas {...defaultAttrs}
                onInit={this.handleInit.bind(this)}
                onRender={this.handleRender.bind(this)}
                onResize={this.handleResize.bind(this)}/>
    );
  }
}