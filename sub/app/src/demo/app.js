//
// Copyright 2017 Alien Labs.
//

import { ApolloClient, createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import React from 'react';
import ReactDOM from 'react-dom';

import { StatusContainer } from './containers/status';
import { ListContainer } from './containers/list';

const config = window.config;
let { rootId, apiRoot } = config;

// TODO(burdon): Redux.
// TODO(burdon): Router.
// TODO(burdon): Subscriptions: http://dev.apollodata.com/react/receiving-updates.html#Subscriptions

//
// Apollo Client.
//

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: apiRoot + '/db'
  })
});

//
// Root App.
//

const WrappedApp = (
  <ApolloProvider client={ client }>
    <div>
      <StatusContainer/>
      <ListContainer pollInterval={ 1000 }/>
    </div>
  </ApolloProvider>
);

ReactDOM.render(WrappedApp, document.getElementById(rootId));
