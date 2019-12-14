const FamilyGroup = require('../models/FamilyGroup');
const User = require('../models/User');

const getFamilyGroups = async (req, res) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId).populate('familyGroups');
    const { familyGroups } = user;
    const familyGroupsArray = familyGroups.map(familyGroup => {
      return { id: familyGroup._id, name: familyGroup.name };
    });
    res.status(200).send(familyGroupsArray);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getFamilyGroup = async (req, res) => {
  const {
    userId,
    params: { groupId }
  } = req;
  try {
    const familyGroup = await FamilyGroup.findById(groupId);
    const { users } = familyGroup;
    const findUser = users.find(user => user.toString() === userId);
    if (!findUser) {
      return res.status(401).send({ message: 'You are not authorized to access this information' });
    }
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
  try {
    const user = await User.findById(userId);
    familyGroup.users.push(user);
    const savedFamilyGroup = await familyGroup.save();
    user.familyGroups.push(savedFamilyGroup);
    await user.save();
    const { _id, users } = savedFamilyGroup;
    const usersArray = users.map(u => {
      return { id: u._id, name: u.name };
    });
    return res.status(201).send({
      message: 'Family Group created successfuly',
      familyGroup: { id: _id, name, users: usersArray }
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};

// to-do: refactor this to recognize when removing, adding one or more users from this family group
// and remove or add the familygroup from those users, yikes
const updateFamilyGroup = async (req, res) => {
  const {
    userId,
    params: { groupId },
    body: updatedFamilyGroup
  } = req;
  if (!updatedFamilyGroup) {
    return res.status(400).send({ message: 'Empty Family Group' });
  }
  try {
    const foundFamilyGroup = await FamilyGroup.findById(groupId);
    const { users } = foundFamilyGroup;
    const findUser = users.find(user => user.toString() === userId);
    if (!findUser) {
      return res.status(401).send({ message: 'You are not authorized to access this information' });
    }

    // when removing all users from family group
    if (!updatedFamilyGroup.users || updatedFamilyGroup.users.length === 0) {
      foundFamilyGroup.users.forEach(async userIdObject => {
        const u = await User.findById(userIdObject);
        const filteredFamilyGroups = u.familyGroups.filter(
          familyGroupObjectId => familyGroupObjectId.toString() !== groupId
        );
        u.familyGroups = filteredFamilyGroups;
        // by the time, never save the current changes, until confidence of this working
        // await u.save();
      });
    }
    foundFamilyGroup.users = updatedFamilyGroup.users;
    foundFamilyGroup.name = updatedFamilyGroup.name;
    // by the time, never save the current changes, until confidence of this working
    // const savedFamilyGroup = await foundFamilyGroup.save();
    return res
      .status(200)
      .send({ message: 'Family Group updated successfuly', familyGroup: 'savedFamilyGroup' });
  } catch (error) {
    return res.status(500).send(error);
  }
};

// to-do: refactor this to remove all family groups referenced from users
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
