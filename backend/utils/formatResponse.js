const formatResponse = (object) => {
  const User = {
    id: object._id,
    fullName: object.firstName,
    email: object.email,
    role: object.role,
  };
  return User;
};

module.exports = formatResponse;
