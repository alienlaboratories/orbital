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

  // TODO(burdon): ListItem renderer from beta.
  static DefaultMapper = (item) => {
    let { key, title:label } = item;
    return { key: ID.encodeKey(key), label };
  };

  static DefaultRenderer = (item, attrs) => {
    let { label } = attrs;
    return (
      <div>{ label }</div>
    );
  };

  static propTypes = {
    items:          PropTypes.array,
    selectedItem:   PropTypes.string,
    onSelect:       PropTypes.func,
    mapper:         PropTypes.func,
    renderer:       PropTypes.func
  };

  render() {
    let defaultAttrs = ReactUtil.defaultProps(this.props, { className: 'orb-list' });
    let { mapper=List.DefaultMapper, renderer=List.DefaultRenderer, items, selectedItem, onSelect } = this.props;

    let list = _.map(items, item => {
      let attrs = mapper(item);
      let { key } = attrs;

      let selected = selectedItem === key;

      let content = renderer(item, attrs);

      return (
        <div key={ key }
             className={ DomUtil.className('orb-list-item', selected && 'orb-selected') }
             onClick={ () => onSelect && onSelect(selected ? undefined: key) }>
          { content }
        </div>
      );
    });

    return (
      <div { ...defaultAttrs }>{ list }</div>
    );
  }
}
