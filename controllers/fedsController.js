const Fed = require('../models/Fed');
const Pet = require('../models/Pet');
const { User } = require('../models/User');

const createFed = async (req, res) => {
  const {
    userId,
    body: { petId }
  } = req;

  try {
    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).send({ message: 'Mascota no encontrada' });

    const user = await User.findById(userId);
    const fed = await Fed.create({ pet, user });
    pet.feds.push(fed);
    await pet.save();
    return res.status(201).send({ message: 'Alimentación agregada con éxito', fed });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const getFed = async (req, res) => {
  const {
    params: { fedId }
  } = req;

  try {
    const fed = await Fed.findById(fedId);
    if (!fed) return res.status(404).send({ message: 'Alimentación no encontrada' });
    return res.status(200).send({ message: 'Alimentación encontrada con éxito', fed });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const destroyFed = async (req, res) => {
  const {
    body: { fedId }
  } = req;
  try {
    const fed = await Fed.findByIdAndDelete(fedId);
    const pet = await Pet.findById(fed.pet);
    await pet.removeFedById(fedId);
    if (!pet) return res.status(404).send({ message: 'Alimentación no encontrada' });
    return res.status(200).send({ message: 'Alimentación eliminada con éxito', fed });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = { createFed, getFed, destroyFed };
