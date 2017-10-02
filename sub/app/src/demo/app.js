//
// Copyright 2017 Alien Labs.
//

import { ApolloClient, createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import React from 'react';
import ReactDOM from 'react-dom';

import { GraphContainer } from './containers/graph';
import { ListContainer } from './containers/list';
import { StatusContainer } from './containers/status';

import './app.less';

const config = window.config;
let { rootId, apiRoot } = config;

// TODO(burdon): Redux.
// TODO(burdon): Router.
// TODO(burdon): Subscriptions: http://dev.apollodata.com/react/receiving-updates.html#Subscriptions
// TODO(burdon): Polling spools up additional instance.

//
// Apollo Client.
//

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: apiRoot + '/db'
  })
});

const pollInterval = 0;

//
// Root App.
//

const WrappedApp = (
  <ApolloProvider client={ client }>
    <div className="orb-panel">
      <div className="orb-x-panel">
        <ListContainer className="app-list" pollInterval={ pollInterval }/>
        <GraphContainer className="orb-expand" pollInterval={ pollInterval }/>
      </div>
      <StatusContainer/>
    </div>
  </ApolloProvider>
);

ReactDOM.render(WrappedApp, document.getElementById(rootId));
