//
// Copyright 2017 Alien Labs.
//

import React from 'react';

import { ReactUtil } from './util';

/**
 * List of items.
 */
export class List extends React.Component {

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props);
    let { result: { items } } = this.props;

    let list = _.map(items, ({ key: { id }, title }) => (
      <div key={ id }>{ title }</div>
    ));

    return (
      <div { ...defaultAttrs }>{ list }</div>
    );
  }
}