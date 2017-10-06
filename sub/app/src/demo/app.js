//
// Copyright 2017 Alien Labs.
//

import { ApolloClient, createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import React from 'react';
import ReactDOM from 'react-dom';

import { TestNetworkInterface } from 'orbital-services/testing';

import { GraphContainer } from './containers/graph';
import { ListContainer } from './containers/list';
import { StatusContainer } from './containers/status';

import './app.less';

const config = window.config;
let { rootId, apiRoot, network, pollInterval } = config;

// TODO(burdon): TypeScript/Flow
// http://dev.apollodata.com/react/using-with-types.html
// http://dev-blog.apollodata.com/a-stronger-typed-react-apollo-c43bd52be0d8
// http://discuss.reactjs.org/t/if-typescript-is-so-great-how-come-all-notable-reactjs-projects-use-babel/4887

// TODO(burdon): Redux.
// TODO(burdon): Router.

// TODO(burdon): Refresh button.
// TODO(burdon): Subscriptions: http://dev.apollodata.com/react/receiving-updates.html#Subscriptions
// TODO(burdon): Polling spools up additional instance.

//
// Apollo Client.
//

let networkInterface;
switch (network) {
  case 'local': {
    networkInterface = new TestNetworkInterface();
    break;
  }

  default: {
    // http://dev.apollodata.com/core/network.html#createNetworkInterface
    networkInterface = createNetworkInterface({
      uri: apiRoot + '/db'
    });
  }
}

// http://dev.apollodata.com/core/apollo-client-api.html#constructor
const client = new ApolloClient({
  networkInterface,
  queryDeduplication: true
});

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

      <StatusContainer className="app-status-bar"/>
    </div>
  </ApolloProvider>
);

ReactDOM.render(WrappedApp, document.getElementById(rootId));
