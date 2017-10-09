//
// Copyright 2017 Alien Labs.
//

import { ApolloClient, createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import React from 'react';
import ReactDOM from 'react-dom';

import { TestDataGenerator, TestNetworkInterface } from 'orbital-api';

import { GraphContainer } from './containers/graph';
import { ListContainer } from './containers/list';
import { StatusContainer } from './containers/status';

import { QueryManager } from './component/util';

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
    let generator = new TestDataGenerator(networkInterface.database).addItems(10);
    setInterval(() => {
      generator.addItems(1);
    }, 5000);
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

// TODO(burdon): Pass into context.
const queryManager = new QueryManager();

// TODO(burdon): Factor out toolbars (refresh and create).

const WrappedApp = (
  <ApolloProvider client={ client }>
    <div className="orb-panel orb-expand">
      <div className="orb-x-panel orb-toolbar">
        <div className="orb-expand"/>
        <div>
          <button onClick={ queryManager.refetch.bind(queryManager) }>Refresh</button>
        </div>
      </div>

      <div className="orb-x-panel orb-expand">
        <div className="app-sidebar orb-panel">
          <ListContainer className="app-list orb-expand" pollInterval={ pollInterval } queryId="X" queryManager={ queryManager }/>
          <div className="orb-toolbar">
            <button>Create</button>
          </div>
        </div>
        <GraphContainer className="orb-expand" pollInterval={ pollInterval }/>
      </div>

      <StatusContainer className="app-status-bar"/>
    </div>
  </ApolloProvider>
);

ReactDOM.render(WrappedApp, document.getElementById(rootId));
