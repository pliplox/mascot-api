const express = require('express');
const usersController = require('../controllers/usersController');
const loginController = require('../controllers/loginController');

const api = express.Router();

// Login
api.post('/signup', loginController.signUp);
api.post('/signin', loginController.signIn);
api.post('/signingoogle', loginController.signInGoogle);
api.get('/signingithub', loginController.signInGitHub);

// Users
api.get('/getusers', usersController.getUsers);
api.put('/updateuser/:id', usersController.updateUser);
api.post('/createuser', usersController.createUser);
api.delete('/deleteuser/:id', usersController.deleteUser);


module.exports = api;