//
// Copyright 2017 Alien Labs.
//

import * as d3 from 'd3';
import PropTypes from 'prop-types';
import React from 'react';

import { ID, ReactUtil } from 'orbital-util';

import { D3Canvas } from './d3';

import './graph.less';

/**
 * Graph of nodes.
 */
export class Graph extends React.Component {

  // WOW! Sparse Force Graph.
  // https://bl.ocks.org/syntagmatic/c334d4293b72a2d1b8827c70e88d4d4f

  static propTypes = {
    selectedItem: PropTypes.object,
    onDrop:       PropTypes.func
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
      // TODO(burdon): ???
      .alphaTarget(0.1)

      .force('charge', d3.forceManyBody().strength(-1000))

      .force('link', d3.forceLink()
        .id(function(d) { return ID.encodeKey(d.key); })     // How to identify nodes (must be string).
        .distance(100)
        .strength(1))

        // TODO(burdon): ???
      // .force('x', d3.forceX())
      // .force('y', d3.forceY())

      .on('tick', this.handleTick.bind(this));

    // d3.range(100).forEach(this._simulation.tick);
  }

  componentWillReceiveProps(nextProps) {
    let { items } = nextProps;

    // TODO(burdon): Note type-specific adapter (e.g., links from properties).
    const adapter = (items) => {

      // Existing nodes.
      let currentNodeMap = _.keyBy(this._simulation.nodes(), node => node.key.id);

      // Merge nodes.
      let nodes = _.map(items, item => {
        let { key: { id } } = item;
        let node = currentNodeMap[id];
        if (!node) {
          node = _.pick(item, 'key', 'title');
        }

        return node;
      });

//    console.log('Nodes', JSON.stringify(items, 0, 2));

      // Links.
      let links = [];
      _.each(items, item => {
        let { items:linkedItems } = item;

        _.each(linkedItems, linkedItem => {

          // Linking by ID requires forceLink().id() method.
          links.push({
            source: ID.encodeKey(item.key),
            target: ID.encodeKey(linkedItem.key)
          });
        });
      });

//    console.log('LINKS', JSON.stringify(links, 0, 2));
      return { nodes, links };
    };

    this.setState(adapter(items));
  }

  handleInit(root) {
    this._dragGroup = d3.select(root).append('svg:g');
    this._linkGroup = d3.select(root).append('svg:g');
    this._nodeGroup = d3.select(root).append('svg:g');

    this._dragController = new DragController(root, this._dragGroup)
      .on('drop', (event) => {
        let { onDrop } = this.props;
        let { source, target } = event;
        onDrop && onDrop({
          source: ID.decodeKey(source),   // TODO(burdon): Get from adapter.
          target: target && ID.decodeKey(target)
        });
      });

    // TODO(burdon): On resize.
    let center = { x: root.clientWidth / 2, y: root.clientHeight / 2 };
    this._simulation.force('center', d3.forceCenter(center.x, center.y));
    console.log(center);
  }

  handleRender(root) {
    let { nodes=[], links=[] } = this.state;
    let self = this;

    // TODO(burdon): Causes jitter.
    // https://bl.ocks.org/HarryStevens/bc938c8d45008d99faed47039fbe5d49
    this._simulation
      .nodes(nodes)
      .force('link')
        .links(links);

    //
    // Links.
    //

    let linkSelection = this._linkGroup.selectAll('line')
      .data(links);

    linkSelection.enter()
      .append('svg:line');

    linkSelection.exit()
      .remove();

    //
    // Nodes and Labels.
    //

    let nodeSelection = this._nodeGroup.selectAll('g.orb-node')
      .data(this._simulation.nodes(), function(d) { return ID.encodeKey(d.key); });

    let enter = nodeSelection.enter()
      .append('svg:g')
      .attr('class', 'orb-node')

      // TODO(burdon): Scope by graph's ID to make unique. Change to data/datum.
      // TODO(burdon): http://bl.ocks.org/hugolpz/824446bb2f9bc8cce607
      .attr('id', function(d) { return ID.encodeKey(d.key); })
      // .datum(d => d.key)

      .on('mouseover', function(d) {
        d3.select(this).classed('orb-active', true);
        self._dragController.highlight(d3.select(this));
      })
      .on('mouseout', function(d) {
        d3.select(this).classed('orb-active', false);
        self._dragController.highlight();
      })

      .call(this._dragController.drag);

    // Nodes
    enter
      .append('svg:circle')
      .classed('orb-node', true)

      // TODO(burdon): Initial position?
      // .attr('x', function(d) { return 0; })
      // .attr('y', function(d) { return 0; })
      // .attr('fixed', true)

      .attr('r', function(d) { return 20; });

    // Labels
    enter
      .append('svg:text')
        .attr('x', 24)
        .attr('y', 8)
        .text(function (d) {
          return d.title;
        });

    nodeSelection.exit()
      .remove();

    //
    // Selection
    //

    // TODO(burdon): Rename key.
    let { selectedItem } = this.props;
    this._nodeGroup.selectAll('circle')
      .classed('orb-selected', d => d.key.id === _.get(selectedItem, 'id'));
  }

  handleTick() {
    console.assert(this._nodeGroup);
    this._nodeGroup.selectAll('g.orb-node')
      .attr('transform', function(d) { return `translate(${d.x}, ${d.y})`; });

    console.assert(this._linkGroup);
    this._linkGroup.selectAll('line')
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    this._dragController.update();
  }

  handleResize(root, size) {
    this._simulation.force('center', d3.forceCenter(size.width / 2, size.height / 2));
  }

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props, { className: 'orb-graph' });

    return (
      <D3Canvas { ...defaultAttrs }
                onInit={this.handleInit.bind(this)}
                onRender={this.handleRender.bind(this)}
                onResize={this.handleResize.bind(this)}/>
    );
  }
}

/**
 * Drag controller.
 */
class DragController {

  _eventHandlers = new Map();

  _root = null;

  _dragNode = null;
  _dropNode = null;
  _dragCircle = null;
  _dragLine = null;

  constructor(root, dragGroup) {
    console.assert(root && dragGroup);
    this._root = root;
    this._dragGroup = dragGroup;

    let self = this;

    // TODO(burdon): SHIFT to drag node.

    // https://bl.ocks.org/mbostock/22994cc97fefaeede0d861e6815a847e
    this._drag = d3.drag()

      //
      // Start
      //
      .on('start', function(d) {

        self._dragNode = d3.select(this).raise().classed('orb-active', true);

        self._dragCircle = self._dragGroup.append('circle')
          .classed('orb-drag', true)
          .attr('r', function(d) { return 5; })
          .attr('cx', function(d) { return self._dragNode.attr('cx'); })
          .attr('cy', function(d) { return self._dragNode.attr('cy'); });

        self._dragLine = self._dragGroup.append('line')
          .attr('x2', function(d) { return self._dragNode.attr('cx'); })
          .attr('y2', function(d) { return self._dragNode.attr('cy'); });

        self.update();
      })

      //
      // Drag
      //
      .on('drag', function(d) {
        // TODO(burdon): Relative to center.
        let [ mx, my ] = d3.mouse(self._root);

        self._dragCircle
          .attr('cx', function(d) { return mx; })
          .attr('cy', function(d) { return my; });

        self._dragLine
          .attr('x2', function(d) { return mx; })
          .attr('y2', function(d) { return my; });
      })

      //
      // End
      //
      .on('end', function(d) {
        d3.select(this).classed('orb-active', false);

        // Callback.
        // TODO(burdon): Provide mouse position to drop new node.
        let handler = self._eventHandlers.get('drop');
        handler && handler({
          source: self._dragNode.attr('id'),
          target: self._dropNode && self._dropNode.attr('id')
        });

        self._dragNode = null;
        self._dragCircle.remove();
        self._dragCircle = null;
        self._dragLine.remove();
        self._dragLine = null;
        self._dropNode = null;
      });
  }

  // Called when force updates (since drag node may have moved).
  update() {
    if (this._dragNode) {
      // TODO(burdon): Get center of transformed group?
      let t = this._dragNode.attr('transform');
      let match = t.match(/translate[(]([0-9.]+), ([0-9.]+)[)]/);
      let x1 = parseFloat(match[1]);
      let y1 = parseFloat(match[2]);

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
