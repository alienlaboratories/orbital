//
// Copyright 2017 Alien Labs.
//

import PropTypes from 'prop-types';
import React from 'react';

import { DomUtil, ReactUtil } from './util';

/**
 * D3 canvas.
 */
export class D3Canvas extends React.Component {

  static propTypes = {
    data:       PropTypes.object,
    onInit:     PropTypes.func,
    onRender:   PropTypes.func,
    onResize:   PropTypes.func,
    className:  PropTypes.string
  };

  componentDidMount() {
    DomUtil.getResizeManager().addHandler(this._node, (element, size) => {
      let { onResize } = this.props;
      onResize && onResize(this._node, size);
    });

    let { onInit } = this.props;
    onInit && onInit(this._node);
  }

  componentWillUnmount() {
    DomUtil.getResizeManager().removeHandler(this._node);
  }

  componentWillReceiveProps(nextProps) {
    this.forceUpdate();
  }

  componentDidUpdate() {
    let { onRender, data } = this.props;
    onRender && onRender(data);
  }

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props, { className: 'orb-d3-canvas' });

    // ref callback is called after mount and unmount.
    // https://reactjs.org/docs/refs-and-the-dom.html
    return (
      <svg ref={ node => this._node = node } { ...defaultAttrs }/>
    );
  }
}
