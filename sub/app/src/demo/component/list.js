//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { DomUtil, ID, ReactUtil } from 'orbital-util';

/**
 * List of items.
 */
export class List extends React.Component {

  // TODO(burdon): Move UX to separate sub projects.

  static DefaultKeyMapper = (item) => {
    let { key } = item;
    return ID.encodeKey(key);
  };

  static DefaultListItem = ({ item, onClick }) => {
    let { title } = item;
    return (
      <div onClick={ onClick }>{ title }</div>
    );
  };

  static propTypes = {
    items:          PropTypes.array,
    keyMapper:      PropTypes.func,
    renderer:       PropTypes.func,
    selectedKey:    PropTypes.string,     // TODO(burdon): Rename selectedKey
    onSelect:       PropTypes.func
  };

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props, { className: 'orb-list' });
    let { keyMapper=List.DefaultKeyMapper, renderer=List.DefaultListItem, items, selectedKey, onSelect } = this.props;

    const ListItem = renderer;

    let list = _.map(items, item => {
      let key = keyMapper(item);

      let selected = selectedKey === key;

      return (
        <div key={ key } className={ DomUtil.className('orb-list-item', selected && 'orb-selected') }>
          <ListItem key={ key } item={ item } onClick={ () => onSelect && onSelect(selected ? undefined: key) }/>
        </div>
      );
    });

    return (
      <div { ...defaultAttrs }>{ list }</div>
    );
  }
}
