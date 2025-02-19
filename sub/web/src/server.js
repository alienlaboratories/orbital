//
// Copyright 2017 Alien Labs.
//

import _ from 'lodash';
import bodyParser from 'body-parser';
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
    apiRoot: 'https://api.orbitaldb.com'
  },

  appBundle: {
    css: 'https://s3.amazonaws.com/orbital-web-assets/app.css',
    js: 'https://s3.amazonaws.com/orbital-web-assets/app.bundle.js'
  }
};

/**
 * Initialize App.
 */
export const init = (app) => {

  // TODO(burdon): Break into routers.

  //
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

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
      root: ''

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

  {
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
  }

  {
    let loginRouter = express.Router();

    loginRouter.get('/:providerId', (req, res) => {
      let { providerId } = req.params;
      res.json({
        providerId
      });
    });

    app.use('/login', loginRouter);
  }

  return app;
};
