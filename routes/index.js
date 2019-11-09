const express = require('express');
const usersController = require('../controllers/usersController');

const api = express.Router();

api.post('/signup', usersController.signUp);
api.post('/signin', usersController.signIn);
api.get('/getusers', usersController.getUsers);

module.exports = api;
