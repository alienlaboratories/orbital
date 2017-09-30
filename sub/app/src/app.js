//
// Copyright 2017 Alien Labs.
//

import gql from 'graphql-tag';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient, createNetworkInterface } from 'apollo-client';
import React from 'react';
import ReactDOM from 'react-dom';
import { compose, graphql } from 'react-apollo';

const config = window.config;
let { rootId, apiRoot } = config;

// TODO(burdon): Redux.
// TODO(burdon): Router.

//
// Apollo Client.
//

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: apiRoot + '/db'
  })
});

//
// App.
//

class App extends React.Component {
  render() {
    let { result: { version } } = this.props;

    return (
      <div>DB: { version }</div>
    );
  }
}

const StatusQuery = gql`
  query StatusQuery {
    result: status {
      version
    }
  }
`;

const AppContainer = compose(graphql(StatusQuery, {

  options: (props) => {
    return {
      variables: {}
    };
  },

  props: ({ ownProps, data }) => {
    let { errors, loading, result={} } = data;
    return {
      errors, loading, result
    };
  }

}))(App);

const WrappedApp = (
  <ApolloProvider client={ client }>
    <AppContainer/>
  </ApolloProvider>
);

ReactDOM.render(WrappedApp, document.getElementById(rootId));
