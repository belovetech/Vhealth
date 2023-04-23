const formatResponse = (object) => {
  const User = {
    id: object._id,
    firstName: object.firstName,
    lastName: object.lastName,
    email: object.email,
    role: object.role,
  };
  return User;
};

module.exports = formatResponse;
