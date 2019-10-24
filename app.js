const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const api = require('./routes');

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Set all routes to start with 'api'
app.use('/api', api);

module.exports = app;