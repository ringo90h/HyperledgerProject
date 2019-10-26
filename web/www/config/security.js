'use strict';

const expressRateLimit = require('express-rate-limit');
const csrf = require('csurf');
const helmet = require('helmet');

module.exports = (app) =>{
  app.enable('trust proxy');

  app.use(helmet({
    noCache: false,
    frameguard: false
  }));

  app.use(['shop/api/', 'police/api/', 'repair-shop/api/', 'insurance/api/'],
  expressRateLimit({
    windowMs: 30 * 1000,
    delayMs: 0,
    max: 50
  }));

  const csrfProtection = csrf({
    cookie: true
  });

  app.get('/*', csrfProtection, (req, res, next) => {
    if (!res.locals) {
      res.locals = {};
    }
    res.locals.ct = req.csrfToken();
    next();
  });

};
