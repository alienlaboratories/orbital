//
// Copyright 2017 Alien Labs.
//

import express from 'express';
import favicon from 'serve-favicon';
import handlebars from 'express-handlebars';
import path from 'path';

const ENV = {
  VIEWS_DIR: './views',
  STATIC_DIR: './static'
};

export const app = express();

//
// Static files.
// https://expressjs.com/en/starter/static-files.html
//

app.use(favicon(path.join(ENV.STATIC_DIR, 'favicon.ico')));

app.use('/static', express.static(ENV.STATIC_DIR));

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
    }
  }
}));

app.set('view engine', 'hbs');
app.set('views', ENV.VIEWS_DIR);

//
// Routes.
//

app.get('/home', (req, res) => {
  res.render('home');
});

app.get('/app', (req, res) => {
  res.render('app', {
    config: {
      root: 'root'
    },

    // TODO(burdon): sls client deploy.
    bundle: 'https://s3.amazonaws.com/orbital-web-assets/app.js'
  });
});
