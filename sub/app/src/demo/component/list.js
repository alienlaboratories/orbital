//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { DomUtil, ReactUtil } from 'orbital-util';

/**
 * List of items.
 */
export class List extends React.Component {

  static propTypes = {
    selectedItem: PropTypes.object,
    selectItem:   PropTypes.func
  };

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props);
    let { result: { items }, selectedItem, selectItem } = this.props;

    let list = _.map(items, ({ key, title }) => {
      let { id } = key;

      let selected = _.get(selectedItem, 'id') === id;

      return (
        <div key={ id }
             className={ DomUtil.className(selected && 'orb-selected') }
             onClick={ () => selectItem && selectItem(selected ? undefined: key) }>{ title }</div>
      );
    });

    return (
      <div { ...defaultAttrs }>{ list }</div>
    );
  }
}
