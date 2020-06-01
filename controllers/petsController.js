const Pet = require('../models/Pet');
const FamilyGroup = require('../models/FamilyGroup');
const { findUserInFamilyGroup } = require('../utils/sharedFunctions');

const createPet = async (req, res) => {
  const {
    userId,
    body: { name, birthdate },
    params: { familyGroupId }
  } = req;
  try {
    const familyGroup = await FamilyGroup.findById(familyGroupId);
    const findUser = findUserInFamilyGroup(familyGroup, userId);
    if (!findUser) {
      return res.status(401).send({ message: 'You are not authorized to access this information' });
    }
    const pet = new Pet({ name, birthdate, familyGroup });
    const savedPet = await pet.save();
    familyGroup.pets.push(savedPet);
    await familyGroup.save();
    const { _id: id, name: savedName, birthdate: savedBirthdate } = savedPet;
    return res.status(201).send({
      message: 'Pet created successfully',
      pet: { id, name: savedName, birthdate: savedBirthdate }
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const getPet = async (req, res) => {
  const {
    params: { petId }
  } = req;
  try {
    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).send({ message: 'Pet not found' });
    return res.status(200).send({ message: 'Pet successfully found', pet });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const getAllPets = async (req, res) => {
  const {
    userId,
    params: { familyGroupId }
  } = req;
  try {
    const startOfDay = new Date().setHours(0, 0, 0);
    const endOfDay = new Date().setHours(23, 59, 59);
    const familyGroup = await FamilyGroup.findById(familyGroupId).populate({
      path: 'pets',
      populate: {
        path: 'feds',
        match: { currentDateTime: { $gte: startOfDay, $lt: endOfDay } },
        populate: { path: 'user' }
      }
    });
    const findUser = findUserInFamilyGroup(familyGroup, userId);
    if (!findUser) {
      return res.status(401).send({ message: 'You are not authorized to access this information' });
    }
    return res.status(200).send({ message: 'Pets successfully found', pets: familyGroup.pets });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const updatePet = async (req, res) => {
  const {
    userId,
    body: { pet }
  } = req;
  try {
    const foundPet = await Pet.findById(pet.id).populate('familyGroup');
    if (!foundPet) return res.status(400).send({ message: 'Pet not found' });

    const { familyGroup } = foundPet;
    const findUser = findUserInFamilyGroup(familyGroup, userId);
    if (!findUser) {
      return res.status(401).send({ message: 'You are not authorized to access this information' });
    }

    if (!pet) return res.status(404).send({ message: 'Pet not found' });

    const { name, birthdate } = pet;
    foundPet.name = name;
    foundPet.birthdate = birthdate;
    const savedPet = await foundPet.save();
    return res.status(200).send({ message: 'Pet successfully updated', pet: savedPet });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const destroyPet = async (req, res) => {
  const {
    body: { petId }
  } = req;
  try {
    const pet = await Pet.findByIdAndDelete(petId);
    const familyGroup = await FamilyGroup.findById(pet.familyGroup);
    await familyGroup.removePetById(petId);
    if (!pet) return res.status(404).send({ message: 'Pet not found' });
    return res.status(200).send({ message: 'Pet successfully destroyed', pet });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  createPet,
  getPet,
  getAllPets,
  updatePet,
  destroyPet
};
