const formatProviderResponse = (object) => {
  return {
    id: object._id,
    fullName: object.fullName,
    bio: object.bio,
    specialty: object.specialty,
    yearOfExperience: object.yearOfExperience,
    numberOfPatientAttendedTo: object.numberOfPatientAttendedTo,
  };
};

module.exports = formatProviderResponse;
