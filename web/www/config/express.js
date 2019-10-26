'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const i18nConfig = require('./i18n');

module.exports = (app) => {
  app.set('view engine', 'pug');
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
  app.use(require('cookie-parser')());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  // Set up internationalization for the backend
  //i18nConfig(app);

  // // Set up security features if running in the cloud
  // if (process.env.VCAP_APPLICATION) {
  //   require('./security').default(app);
  // }
};
