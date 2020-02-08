const Fed = require('../models/Fed');
const Pet = require('../models/Pet');

const createFed = async (req, res) => {
  const {
    body: { petId }
  } = req;

  try {
    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).send({ message: 'Pet not found' });

    const fed = await Fed.create({ pet });
    return res.status(201).send({ message: 'Fed added successfully', fed });
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
    if (!fed) return res.status(404).send({ message: 'Fed not found' });
    return res.status(200).send({ message: 'Fed successfully found', fed });
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
    if (!pet) return res.status(404).send({ message: 'Fed not found' });
    return res.status(200).send({ message: 'Fed successfully destroyed', fed });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = { createFed, getFed, destroyFed };
