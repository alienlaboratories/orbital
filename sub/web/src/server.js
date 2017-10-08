//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import express from 'express';
import favicon from 'serve-favicon';
import handlebars from 'express-handlebars';
import path from 'path';

const ENV = {
  VIEWS_DIR: './views',
  STATIC_DIR: './static'
};

const config = {
  appConfig: {
    rootId: 'orb-root',
    apiRoot: 'https://t2isk8i7ek.execute-api.us-east-1.amazonaws.com/dev'
  },

  appBundle: {
    css: 'https://s3.amazonaws.com/orbital-web-assets/app.css',
    js: 'https://s3.amazonaws.com/orbital-web-assets/app.bundle.js'
  }
};

/**
 * Create App.
 *
 * @param {Function} init
 */
export const createApp = init => {
  let app = express();

  init(app);

  //
  // Static files.
  // https://expressjs.com/en/starter/static-files.html
  //

  app.use(favicon(path.join(ENV.STATIC_DIR, 'favicon.ico')));

  app.use('/static', express.static(ENV.STATIC_DIR));

  //
  // Middleware.
  //

  app.use((req, res, next) => {
    _.assign(res.locals, {
      req,
      event: req.apiGateway.event,
      root: '/'

      // TODO(burdon): Only from non domain URL.
//    root: '/' + req.apiGateway.event.requestContext.stage
    });

    next();
  });

  //
  // Handlebars.
  //

  app.engine('hbs', handlebars({
    extname: '.hbs',
    layoutsDir: path.join(ENV.VIEWS_DIR, '/layouts'),
    partialsDir: path.join(ENV.VIEWS_DIR, '/partials'),
    defaultLayout: 'main',
    helpers: {

      // {{#section 'body'}}
      section: function(name, options) {
        this.sections = this.sections || {};
        this.sections[name] = options.fn(this);
      },

      // {{{ json var }}}
      json: function(object, indent=0) {
        return JSON.stringify(object, null, indent);
      }
    }
  }));

  app.set('view engine', 'hbs');
  app.set('views', ENV.VIEWS_DIR);

  //
  // Routes.
  //

  app.get('/', (req, res) => {
    res.render('home');
  });

  app.get('/app', (req, res) => {
    let { pollInterval } = req.apiGateway.event.queryStringParameters || {};
    res.render('app', _.merge({}, config, {
      appConfig: {
        pollInterval: parseInt(pollInterval) || 0
      }
    }));
  });

  app.get('/debug', (req, res) => {
    res.json(req.apiGateway.event);
  });

  return app;
};
