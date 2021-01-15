const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const api = require('./routes');

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, PATCH, PUT, GET, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Set all routes to start with 'api'
app.use('/api', api);

module.exports = app;
