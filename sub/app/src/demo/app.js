//
// Copyright 2017 Alien Labs.
//

import PropTypes from 'prop-types';
import { ApolloProvider } from 'react-apollo';
import React from 'react';

import { DomainsContainer, EditorContainer, GraphContainer, ListContainer, StatusContainer } from './container';
import { QueryManager } from './framework/subscription';

import './app.less';

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
      <div className="orb-toolbar">
        <div className="orb-expand"/>
        <div>
          <button onClick={ this.handleRefetch.bind(this) }>Refresh</button>
        </div>
      </div>
    );
  }
}

/**
 * Main App Router.
 */
export class Application extends React.Component {

  static propTypes = {
    config: PropTypes.object.isRequired,
    client: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  };

  static childContextTypes = {
    queryManager: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      queryManager: new QueryManager()
    };
  }

  render() {
    let { config: { pollInterval }, client, store } = this.props;

    // TODO(burdon): Router.

    const nodeClassMapper = (key) => {
      let { domain='_' } = key;
      let parts = domain.split('/');
      if (parts.length === 2) {
        return 'app-domain-' + parts[1];
      }
    };

    return (
      <ApolloProvider client={ client } store={ store }>
        <div className="orb-panel orb-expand">
          <Header/>

          <div className="orb-x-panel orb-expand">
            <div className="app-sidebar orb-panel">
              <div className="orb-panel orb-expand">
                <DomainsContainer queryId="domains"/>

                <div className="orb-panel orb-expand">
                  <div className="orb-x-panel orb-header">
                    <h2 className="orb-expand">Items</h2>
                  </div>

                  <ListContainer className="app-items-list orb-expand"
                                 pollInterval={ pollInterval }
                                 queryId="list"/>

                  <EditorContainer/>
                </div>
              </div>
            </div>

            <GraphContainer className="orb-expand" pollInterval={ pollInterval } queryId="graph"
                            nodeClassMapper={ nodeClassMapper }/>
          </div>

          <StatusContainer className="app-status-bar"/>
        </div>
      </ApolloProvider>
    );
  }
}
