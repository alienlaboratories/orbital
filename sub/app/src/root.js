//
// Copyright 2017 Alien Labs.
//

import React from 'react';
import PropTypes from 'prop-types';

import { get, plugins } from 'popsicle';

// TODO(burdon): Router.
// TODO(burdon): Apollo.

// https://github.com/99xt/serverless-react-boilerplate
// https://github.com/serverlessbuch/jwtAuthorizr

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
        <button onClick={ this.handleClick.bind(this) }>Test</button>

        { result &&
        <div>{ JSON.stringify(result) }</div>
        }
      </div>
    );
  }
}
