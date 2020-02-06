const Pet = require('../models/Pet');
const FamilyGroup = require('../models/FamilyGroup');
const { findUserInFamilyGroup } = require('../utils/sharedFunctions');

const createPet = async (req, res) => {
  const {
    userId,
    body: { name, birthdate },
    params: { groupId }
  } = req;
  try {
    const familyGroup = await FamilyGroup.findById(groupId);
    const findUser = findUserInFamilyGroup(familyGroup, userId);
    if (!findUser) {
      return res.status(401).send({ message: 'You are not authorized to access this information' });
    }
    const pet = new Pet({ name, birthdate, familyGroup });
    const savedPet = await pet.save();
    familyGroup.pets.push(savedPet);
    await familyGroup.save();
    const { name: savedName, birthdate: savedBirthdate } = savedPet;
    return res.status(201).send({
      message: 'Pet created successfuly',
      pet: { name: savedName, birthdate: savedBirthdate }
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const getPet = async (req, res) => {

};

const getAllPets = async (req, res) => {

};

const updatePet = async (req, res) => {

};

const destroyPet = async (req, res) => {

};

module.exports = {
  createPet,
  getPet,
  getAllPets,
  updatePet,
  destroyPet
};
