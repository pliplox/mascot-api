const FamilyGroup = require('../models/FamilyGroup');
const FamilyMember = require('../models/FamilyMember');
const User = require('../models/User');

const getFamilyGroups = async (req, res) => {
  const familyGroups = await FamilyGroup.find();
  try {
    res.status(200).send(familyGroups);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getFamilyGroup = async (req, res) => {
  const {
    params: { groupId }
  } = req;
  try {
    const familyGroup = await FamilyGroup.findById(groupId);
    return res.status(200).send(familyGroup);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const createFamilyGroup = async (req, res) => {
  const {
    userId,
    body: { name }
  } = req;

  const familyGroup = new FamilyGroup({ name });
  const familyMember = new FamilyMember({ user: userId, familyGroup });
  try {
    const savedFamilyGroup = await familyGroup.save();
    const savedFamilyMember = await familyMember.save();

    savedFamilyGroup.familyMembers.push(familyMember);
    const updatedFamilyGroup = await savedFamilyGroup.save();
    const user = await User.findById(userId);
    user.familyMembers.push(familyMember);
    const savedUser = await user.save();
    return res.status(201).send({
      message: 'Family Group created successfuly',
      familyGroup: updatedFamilyGroup,
      familyMember: savedFamilyMember,
      user: savedUser
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};

const updateFamilyGroup = async (req, res) => {
  const {
    params: { groupId },
    body: { name }
  } = req;
  try {
    const familyGroup = await FamilyGroup.findById(groupId);
    familyGroup.name = name;
    await familyGroup.save();
    return res.status(200).send(familyGroup);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const destroyFamilyGroup = async (req, res) => {
  const {
    params: { groupId }
  } = req;
  try {
    const familyGroup = await FamilyGroup.findById(groupId);
    if (!familyGroup) {
      return res.status(404).send({ message: 'Family Group not found' });
    }
    return res.status(200).send({ message: 'Family Group destroyed successfuly' });
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports = {
  createFamilyGroup,
  getFamilyGroups,
  getFamilyGroup,
  updateFamilyGroup,
  destroyFamilyGroup
};
