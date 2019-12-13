const FamilyMember = require('../models/FamilyMember');
const FamilyGroup = require('../models/FamilyGroup');
const User = require('../models/User');

const getFamilyMembers = async (req, res) => {
  const familyMembers = await FamilyMember.find();
  try {
    return res.status(200).send(familyMembers);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const getFamilyMember = async (req, res) => {
  const {
    params: { memberId }
  } = req;
  try {
    const familyMember = await FamilyMember.findById(memberId);
    return res.status(200).send(familyMember);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const createFamilyMember = async (req, res) => {
  const {
    userId,
    body: { familyGroupId }
  } = req;

  const familyMember = new FamilyMember({
    user: userId,
    familyGroup: familyGroupId
  });

  try {
    const user = await User.findById(userId);
    user.familyMembers.push(familyMember);
    const savedUser = await user.save();
    const familyGroup = await FamilyGroup.findById(familyGroupId);
    familyGroup.familyMembers.push(familyMember);
    const savedFamilyGroup = await FamilyGroup.save();
    const savedFamilyMember = await familyMember.save();
    return res.status(201).send({
      message: 'Family Member created successfuly',
      familyMember: savedFamilyMember,
      user: savedUser,
      familyGroup: savedFamilyGroup
    });
  } catch (error) {
    return res.status(400).send(error);
  }
};

const destroyFamilyMember = async (req, res) => {
  const {
    params: { memberId }
  } = req;
  try {
    await FamilyMember.findByIdAndDelete(memberId);
    return res.status(200).send({ message: 'Family Member destroyed successfuly' });
  } catch (error) {
    return res.status(500).send(error);
  }
};

const updateFamilyMember = async (req, res) => {
  const {
    params: { memberId }
  } = req;
  try {
    const familyMember = await FamilyMember.findById(memberId);
    return res.status(201).send(familyMember);
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports = {
  createFamilyMember,
  getFamilyMembers,
  getFamilyMember,
  updateFamilyMember,
  destroyFamilyMember
};
