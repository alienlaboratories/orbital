//
// Copyright 2017 Alien Labs.
//

import PropTypes from 'prop-types';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { Redirect, Router, Route } from 'react-router';

class TestingActivity extends React.Component {
  render() {
    return (
      <div>TESTING</div>
    );
  }
}

/**
 * Apollo root component.
 */
export class Root extends React.Component {

  static propTypes = {
    client:   PropTypes.object.isRequired,
    history:  PropTypes.object.isRequired
  };

  render() {
    let { client, history } = this.props;

    // https://github.com/ReactTraining/react-router

    return (
      <ApolloProvider client={ client }>
        <Router history={ history }>
          {/* v4: <Switch> */}

          <Route exact path="/" component={ TestingActivity }/>
          <Redirect from="*" to="/"/>

          {/* </Switch> */}
        </Router>
      </ApolloProvider>
    );
  }
}
