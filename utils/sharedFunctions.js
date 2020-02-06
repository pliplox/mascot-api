const findUserInFamilyGroup = (familyGroup, userId) => {
  const { users } = familyGroup;
  return users.find(user => user.toString() === userId.toString());
};

module.exports = {
  findUserInFamilyGroup
};
