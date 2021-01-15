const express = require('express');
const passport = require('passport');
// eslint-disable-next-line no-unused-vars
const passportConf = require('../passport');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const familyGroupsController = require('../controllers/familyGroupsController');
const petsController = require('../controllers/petsController');
const fedsController = require('../controllers/fedsController');
const { authUser, authRole } = require('../middlewares/authentication');
const { ROLES } = require('../models/User');

const { ADMIN } = ROLES;

const api = express.Router();

// Login
api.post('/signup', authController.signUp);
api.post('/signin', authController.signIn);
api.post('/signingoogle', authController.signInGoogle);
api.post(
  '/siginfacebook',
  passport.authenticate('facebookToken', { session: false }),
  authController.signInFacebook
);

// Users
api.get('/getusers', authUser, usersController.getUsers);
api.put('/updateuser/:id', authUser, usersController.updateUser);
api.post('/createuser', authUser, authRole(ADMIN), usersController.createUser);
api.delete('/deleteuser/:id', authUser, usersController.deleteUser);

// Family Group
api.post('/family/group', authUser, familyGroupsController.createFamilyGroup);
api.get('/family/groups', authUser, familyGroupsController.getFamilyGroups);
api.get('/family/groups/:groupId', authUser, familyGroupsController.getFamilyGroup);
api.put('/family/groups/:groupId', authUser, familyGroupsController.updateFamilyGroup);

api.delete('/family/groups/:groupId', authUser, familyGroupsController.destroyFamilyGroup);

// Pet
const { createPet, getPet, getAllPets, updatePet, destroyPet } = petsController;
api.post('/pet', authUser, createPet);
api.get('/pet/:petId', authUser, getPet);
api.get('/pets/:familyGroupId', authUser, getAllPets);
api.put('/pet', authUser, updatePet);
api.delete('/pet', authUser, destroyPet);

// Fed
const { createFed, getFed, destroyFed } = fedsController;
api.post('/fed', authUser, createFed);
api.get('/fed/:fedId', authUser, getFed);
api.delete('/fed', authUser, destroyFed);

module.exports = api;
