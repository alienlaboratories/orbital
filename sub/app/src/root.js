//
// Copyright 2017 Alien Labs.
//

import PropTypes from 'prop-types';
import React from 'react';
import { ApolloProvider } from 'react-apollo';

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
    store:    PropTypes.object.isRequired,
    history:  PropTypes.object.isRequired
  };

  render() {
    let { client, store, history } = this.props;

    // https://github.com/ReactTraining/react-router

    return (
      <ApolloProvider client={ client } store={ store }>
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
