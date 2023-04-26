/**
 * format user response object
 * @param {response} object
 * @returns - formatted response
 */

module.exports = (object) => {
  const User = {
    id: object._id,
    firstName: object.firstName,
    lastName: object.lastName,
    email: object.email,
    role: object.role,
    appointments: object.appointments,
  };
  return User;
};
