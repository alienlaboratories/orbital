//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';

export class ReactUtil {

  /**
   * Default component properties.
   * @param props
   * @param defaults
   * @returns {{className: (string|_.LoDashExplicitWrapper<string>)}}
   */
  static defaultProps = (props, defaults={}) => {
    let { className } = props;

    return {
      className: _.compact([className, defaults.className]).join(' ') || undefined
    };
  };
}
