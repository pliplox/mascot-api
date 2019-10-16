const express = require('express');
const usersController = require('../controllers/usersController');

const api = express.Router();

api.post('/signup', usersController.signUp)
//  TO DO
// api.post('/signin', usersController.signIn)

module.exports = api;