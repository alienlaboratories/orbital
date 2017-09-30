//
// Copyright 2017 Alien Labs.
//

import React from 'react';
import PropTypes from 'prop-types';
import { get, plugins } from 'popsicle';

import './root.less';

// TODO(burdon): Redux/Router.
// TODO(burdon): Apollo.
// TODO(burdon): https://github.com/99xt/serverless-react-boilerplate
// TODO(burdon): https://github.com/serverlessbuch/jwtAuthorizr

/**
 * Root component.
 */
export class Root extends React.Component {

  static propTypes = {
    config: PropTypes.object.isRequired
  };

  state = {};

  handleClick() {
    let { config: { apiRoot } } = this.props;

    get(apiRoot + '/status')
      .use(plugins.parse(['json', 'urlencoded']))
      .then(result => {
        this.setState({
          result
        });
      });
  }

  render() {
    let { result } = this.state;

    return (
      <div>
        <div>
          <button onClick={ this.handleClick.bind(this) }>Test</button>
        </div>

        { result &&
        <div>{ JSON.stringify(result) }</div>
        }
      </div>
    );
  }
}
