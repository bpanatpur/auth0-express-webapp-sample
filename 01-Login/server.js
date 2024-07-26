const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const logger = require('morgan');
const path = require('path');
const router = require('./routes/index');
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');

dotenv.load();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const config = {
  authRequired: false,
  auth0Logout: true,
//  baseURL: 'http://localhost:3000',
  clientID: 'K0WRzQR5MswQbcBBFBsbl5zDlbF98PZH',
  issuerBaseURL: 'https://dev-iun0bpsfz4ilbb73.us.auth0.com',
  secret: 'b9d8c9974bda2ef1e53bbaa1fed160bec765725ebeefdd6a0320def7710b9019'
  };

const port = process.env.PORT || 3000;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `https://shiny-lamp-v6gg47gv7q7gfx-3000.app.github.dev/`;
}

app.use(auth(config));

app.get('/', (req, res) => {
res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
});

app.get('/profile', requiresAuth(), (req, res) => {
res.send(JSON.stringify(req.oidc.user));
});

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
  res.locals.user = req.oidc.user;
  next();
});

app.use('/', router);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: process.env.NODE_ENV !== 'production' ? err : {}
  });
});

http.createServer(app)
  .listen(port, () => {
    console.log(`Listening on ${config.baseURL}`);
  });
