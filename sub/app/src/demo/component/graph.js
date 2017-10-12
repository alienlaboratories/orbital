//
// Copyright 2017 Alien Labs.
//

import * as d3 from 'd3';
import PropTypes from 'prop-types';
import React from 'react';

import { D3Canvas } from './d3';
import { ReactUtil } from './util';

import './graph.less';

/**
 * Drag controller.
 */
class DragController {

  _eventHandlers = new Map();

  _dragNode = null;
  _dropNode = null;
  _dragCircle = null;
  _dragLine = null;

  constructor(dragGroup) {
    console.assert(dragGroup);
    this._dragGroup = dragGroup;

    let self = this;

    // TODO(burdon): SHIFT to drag node.

    // https://bl.ocks.org/mbostock/22994cc97fefaeede0d861e6815a847e
    this._drag = d3.drag()

      .on('start', function(d) {
        self._dragNode = d3.select(this).raise().classed('orb-active', true);

        self._dragCircle = self._dragGroup.append('circle')
          .classed('orb-drag', true)
          .attr('r', function(d) { return 5; })
          .attr('cx', function(d) { return self._dragNode.attr('cx'); })
          .attr('cy', function(d) { return self._dragNode.attr('cy'); });

        self._dragLine = self._dragGroup.append('line')
          .attr('x1', function(d) { return self._dragNode.attr('cx'); })
          .attr('y1', function(d) { return self._dragNode.attr('cy'); })
          .attr('x2', function(d) { return self._dragNode.attr('cx'); })
          .attr('y2', function(d) { return self._dragNode.attr('cy'); });
      })

      .on('drag', function(d) {
        let [ mx, my ] = d3.mouse(this);

        self._dragCircle
          .attr('cx', function(d) { return mx; })
          .attr('cy', function(d) { return my; });

        self._dragLine
          .attr('x2', function(d) { return mx; })
          .attr('y2', function(d) { return my; });

        // TODO(burdon): Deterine link (pass in nodes).
      })

      .on('end', function(d) {
        d3.select(this).classed('orb-active', false);

        // Callback.
        let handler = self._eventHandlers.get('drop');
        handler && handler({
          start: self._dragNode.attr('id'),
          end: self._dropNode && self._dropNode.attr('id')
        });

        self._dragNode = null;
        self._dragCircle.remove();
        self._dragCircle = null;
        self._dragLine.remove();
        self._dragLine = null;
      });
  }

  update() {
    if (this._dragNode) {
      let [ x1, y1 ] = [ this._dragNode.attr('cx'), this._dragNode.attr('cy') ];

      this._dragLine
        .attr('x1', function(d) { return x1; })
        .attr('y1', function(d) { return y1; });
    }
  }

  highlight(node) {
    this._dropNode = node;
  }

  on(event, handler) {
    this._eventHandlers.set(event, handler);
    return this;
  }

  get drag() {
    return this._drag;
  }
}

/**
 * Graph of nodes.
 */
export class Graph extends React.Component {

  static propTypes = {
    onDrop: PropTypes.func
  };

  constructor() {
    super();

    // Force layout.
    // http://github.com/d3/d3-force
    // https://bl.ocks.org/shimizu/e6209de87cdddde38dadbb746feaf3a3 (Simple example).

    // Graph with labels.
    // http://bl.ocks.org/curran/9b73eb564c1c8a3d8f3ab207de364bf4

    // Graph editor.
    // http://bl.ocks.org/rkirsling/5001347

    // Sticky layout.
    // http://bl.ocks.org/mbostock/3750558

    // More complex (links for force, paths for advanced rendering).
    // http://bl.ocks.org/shimizu/e6209de87cdddde38dadbb746feaf3a3
    // http://blockbuilder.org/mbostock/c034d66572fd6bd6815a
    // http://blockbuilder.org/tarekrached/a7628dd96c62155068dd

    this._simulation = d3.forceSimulation()
      .alphaTarget(1)
      .force('charge', d3.forceManyBody().strength(-1000))

      .force('link', d3.forceLink().id(function(d) { return d.index; })
        .distance(100)
        .strength(1))

      .force('x', d3.forceX())
      .force('y', d3.forceY())

      .on('tick', () => {
        console.assert(this._nodeGroup);
        this._nodeGroup.selectAll('circle')
          .attr('cx', function(d) { return d.x; })
          .attr('cy', function(d) { return d.y; });

        console.assert(this._linkGroup);
        this._linkGroup.selectAll('line')
          .attr('x1', function(d) { return d.source.x; })
          .attr('y1', function(d) { return d.source.y; })
          .attr('x2', function(d) { return d.target.x; })
          .attr('y2', function(d) { return d.target.y; });

        this._dragController.update();
      });
  }

  componentWillReceiveProps(nextProps) {
    let { nodes } = nextProps;

    // TODO(burdon): Note type-specific adapter (e.g., links from properties).
    // TODO(burdon): Create mutation via adapter.

    let adapter = (nodes) => {
      nodes = _.map(nodes, n => _.pick(n, 'id', 'title'));
      let links = [
        { source: nodes[0], target: nodes[1], left: false, right: true }
      ];

      return { nodes, links };
    };

    this.setState(adapter((nodes)));
  }

  handleInit(root) {
    this._dragGroup = d3.select(root).append('svg:g');
    this._nodeGroup = d3.select(root).append('svg:g');
    this._linkGroup = d3.select(root).append('svg:g');

    this._dragController = new DragController(this._dragGroup)
      .on('drop', (event) => {
        let { onDrop } = this.props;
        onDrop && onDrop(event);
      });

    let center = { x: root.clientWidth / 2, y: root.clientHeight / 2 };
    this._simulation.force('center', d3.forceCenter(center.x, center.y));
  }

  handleRender(root) {
    let self = this;

    let { nodes=[], links=[] } = this.state;

    this._simulation
      .nodes(nodes)
      .force('link')
        .links(links);

    //
    // Links
    //

    let linkSelection = this._linkGroup.selectAll('line')
      .data(links);

    linkSelection.enter()
      .append('line');

    linkSelection.exit()
      .remove();

    //
    // Nodes
    //

    let nodeSelection = this._nodeGroup.selectAll('circle')
      .data(this._simulation.nodes());

    nodeSelection.enter()
      .append('circle')
      .classed('orb-node', true)
      .attr('id', function(d) { return d.id; })
      .attr('r', function(d) { return 20; })

      .on('mouseover', function(d) {
        d3.select(this).classed('orb-active', true);
        self._dragController.highlight(d3.select(this));
      })
      .on('mouseout', function(d) {
        d3.select(this).classed('orb-active', false);
        self._dragController.highlight();
      })

      .call(this._dragController.drag);

    nodeSelection.exit()
      .remove();
  }

  handleResize(root, size) {
    this._simulation.force('center', d3.forceCenter(size.width / 2, size.height / 2));
  }

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props, { className: 'orb-graph' });

    return (
      <D3Canvas {...defaultAttrs}
                onInit={this.handleInit.bind(this)}
                onRender={this.handleRender.bind(this)}
                onResize={this.handleResize.bind(this)}/>
    );
  }
}