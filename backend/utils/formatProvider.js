const formatProviderResponse = (object) => {
  return {
    id: object._id,
    fullName: object.fullName,
    bio: object.bio,
    specialty: object.specialty,
    location: object.location,
    availability: object.availability,
    yearOfExperience: object.yearOfExperience,
    numberOfPatientAttendedTo: object.numberOfPatientAttendedTo,
  };
};

module.exports = formatProviderResponse;
