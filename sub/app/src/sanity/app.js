//
// Copyright 2017 Alien Labs.
//

import React from 'react';
import ReactDOM from 'react-dom';

import { Root } from './root';

const config = window.config;

let { rootId } = config;

// TODO(burdon): webpack-dev-server

// https://facebook.github.io/react/docs/components-and-props.html
ReactDOM.render(<Root config={ config }/>, document.getElementById(rootId));
