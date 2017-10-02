//
// Copyright 2017 Alien Labs.
//

import PropTypes from 'prop-types';
import React from 'react';

import { ReactUtil } from '../util';

// TODO(burdon): Factor out renderer.
// http://bl.ocks.org/mbostock/1153292

/**
 * D3 canvas.
 */
export class D3Canvas extends React.Component {

  // TODO(burdon): onResize.

  static propTypes = {
    data:       PropTypes.object,
    renderer:   PropTypes.func,
    className:  PropTypes.string
  };

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  componentWillReceiveProps(nextProps) {
    this.forceUpdate();
  }

  update() {
    let { data, renderer } = this.props;
    renderer && this._node && renderer(this._node, data);
  }

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props, { className: 'orb-d3-canvas' });

    return (
      <svg ref={ node => this._node = node } { ...defaultAttrs }/>
    );
  }
}
