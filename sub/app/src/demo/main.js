//
// Copyright 2017 Alien Labs.
//

import { ApolloClient, createNetworkInterface } from 'apollo-client';
import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';

import { TestDataGenerator, TestNetworkInterface } from 'orbital-api/testing';

import { AppReducer } from './reducer/app_reducer';
import { Application } from './app';

// TODO(burdon): TypeScript/Flow
// http://dev.apollodata.com/react/using-with-types.html
// http://dev-blog.apollodata.com/a-stronger-typed-react-apollo-c43bd52be0d8
// http://discuss.reactjs.org/t/if-typescript-is-so-great-how-come-all-notable-reactjs-projects-use-babel/4887

/**
 * App.
 */
class App {

  constructor(config) {
    console.assert(config);
    this._config = config;
  }

  get config() {
    return this._config;
  }

  get client() {
    return this._client;
  }

  get store() {
    return this._store;
  }

  // TODO(burdon): Regenerator runtime error for asyn.
  init() {
    return this.createNetworkInterface().then(networkInterface => {

      //
      // Apollo client.
      // http://dev.apollodata.com/core/apollo-client-api.html#constructor
      //

      this._client = new ApolloClient({
        networkInterface,
        queryDeduplication: true
      });

      //
      // Redux.
      // http://dev.apollodata.com/react/redux.html
      // TODO(burdon): Add reducers and get state.
      // TODO(burdon): connect() state (use util from beta to make object).
      //

      const appReducer = new AppReducer();

      this._store = createStore(
        combineReducers({
          apollo: this._client.reducer(),
          [AppReducer.NS]: appReducer.reducer()
        }),
        {
          [AppReducer.NS]: appReducer.state
        },
        compose(
          applyMiddleware(this._client.middleware()),

          // TODO(burdon): Devtools.
          (typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined') ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
        )
      );

      return this;
    });
  }

  /**
   * Apollo network interface.
   */
  createNetworkInterface() {
    let { apiRoot, network } = this.config;

    switch (network) {
      case 'local': {
        let networkInterface = new TestNetworkInterface();
        return new TestDataGenerator(networkInterface.database).addItems(8).then(() => {
          // setInterval(() => {
          //   generator.addItems(1);
          // }, 5000);

          return networkInterface;
        });
      }

      default: {
        // http://dev.apollodata.com/core/network.html#createNetworkInterface
        let networkInterface = createNetworkInterface({
          uri: apiRoot + '/db'  // TODO(burdon): Const.
        });

        return Promise.resolve(networkInterface);
      }
    }
  }
}

const config = window.config;

const app = new App(config);

app.init().then(app => {
  let { rootId } = app.config;

  let App = (
    <Application
      config={ app.config }
      client={ app.client }
      store={ app.store }/>
  );

  ReactDOM.render(App, document.getElementById(rootId));
});
