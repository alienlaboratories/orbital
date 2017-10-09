//
// Copyright 2017 Alien Labs.
//

import React from 'react';

import { ReactUtil } from './util';

/**
 * List of nodes.
 */
export class List extends React.Component {

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props);
    let { result: { nodes } } = this.props;

    let list = _.map(nodes, ({ id, title }) => (
      <div key={id}>{title}</div>
    ));

    return (
      <div {...defaultAttrs}>{list}</div>
    );
  }
}