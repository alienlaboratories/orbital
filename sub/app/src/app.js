//
// Copyright 2017 Alien Labs.
//

import ApolloClient, { HttpLink } from 'apollo-client-preset';
import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { routerMiddleware, routerReducer } from 'react-router-redux';

import { Root } from './root';

const config = window.config;
let { rootId, apiRoot } = config;

//
// Apollo Client.
//

const client = new ApolloClient({
  link: new HttpLink({
    uri: apiRoot + '/database'
  })
});

//
// Store.
//

const reducers = combineReducers({
  routing: routerReducer,
  apollo: client.reducer()
});

const enhancers = compose(
  applyMiddleware(routerMiddleware(this._history)),
  applyMiddleware(client.middleware())
);

const store = createStore(reducers, enhancers);

//
// App.
//

const root = <Root history={ browserHistory } client={ client } store={ store }/>;

ReactDOM.render(root, document.getElementById(rootId));
