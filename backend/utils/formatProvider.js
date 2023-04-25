const formatProviderResponse = (object) => {
  return {
    id: object._id,
    fullName: object.fullName,
    bio: object.bio,
    specialty: object.specialty,
    location: object.location,
    availability: object.availability,
    unavailability: object.unavailability,
    yearOfExperience: object.yearOfExperience,
    numberOfPatientAttendedTo: object.numberOfPatientAttendedTo,
    appointments: object.appointments,
  };
};

module.exports = formatProviderResponse;
