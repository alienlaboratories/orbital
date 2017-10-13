//
// Copyright 2017 Alien Labs.
//

import { ApolloClient, createNetworkInterface } from 'apollo-client';
import PropTypes from 'prop-types';
import { ApolloProvider } from 'react-apollo';
import React from 'react';
import ReactDOM from 'react-dom';

import { TestDataGenerator, TestNetworkInterface } from 'orbital-api/testing';

import { EditorContainer, GraphContainer, ListContainer, StatusContainer } from './container';
import { QueryManager } from './container/subscription';

import './app.less';

const config = window.config;
let { rootId, apiRoot, network } = config;

// TODO(burdon): TypeScript/Flow
// http://dev.apollodata.com/react/using-with-types.html
// http://dev-blog.apollodata.com/a-stronger-typed-react-apollo-c43bd52be0d8
// http://discuss.reactjs.org/t/if-typescript-is-so-great-how-come-all-notable-reactjs-projects-use-babel/4887

// TODO(burdon): Redux.
// TODO(burdon): Router.

// TODO(burdon): Async set-up. App class.

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

/**
 * Header component.
 */
class Header extends React.Component {

  static contextTypes = {
    queryManager: PropTypes.object.isRequired
  };

  handleRefetch() {
    let { queryManager } = this.context;
    queryManager.refetch();
  }

  // TODO(burdon): Searchbar.

  render() {
    return (
      <div className="orb-x-panel orb-toolbar">
        <div className="orb-expand"/>
        <div>
          <button onClick={ this.handleRefetch.bind(this) }>Refresh</button>
        </div>
      </div>
    );
  }
}

class Application extends React.Component {

  static childContextTypes = {
    queryManager: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      queryManager: new QueryManager()
    };
  }

  render() {
    let { config: { pollInterval }, client } = this.props;

    return (
      <ApolloProvider client={ client }>
        <div className="orb-panel orb-expand">
          <Header/>

          <div className="orb-x-panel orb-expand">
            <div className="app-sidebar orb-panel">
              <div className="orb-panel orb-expand">
                <ListContainer className="app-list orb-expand"
                               pollInterval={ pollInterval }
                               queryId="list"/>

                <EditorContainer/>
              </div>
            </div>

            <GraphContainer className="orb-expand" pollInterval={ pollInterval } queryId="graph"/>
          </div>

          <StatusContainer className="app-status-bar"/>
        </div>
      </ApolloProvider>
    );
  }
}

ReactDOM.render(
  <Application
    config={ config }
    client={ client }/>,
  document.getElementById(rootId));
