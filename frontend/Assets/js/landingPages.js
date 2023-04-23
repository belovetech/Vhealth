// Get all book appointment buttons
var bookAppointmentButtons = document.querySelectorAll('.book-appointment');

// Get the modal and close button
var modal = document.getElementById('myModal');
var closeButton = modal.querySelector('.close');

// Flag variable to check if appointment elements have already been added
var appointmentAdded = false;

// When the user clicks on a book appointment button, open the modal
bookAppointmentButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    openModal();
  });
});

// When the user clicks on the close button or outside of the modal, close it
closeButton.addEventListener('click', closeModal);
window.addEventListener('click', function(event) {
  if (event.target == modal) {
    closeModal();
  }
});

// Function to open modal
function openModal() {
  modal.style.display = 'block';
  if (!appointmentAdded) {
    bookAppointment();
  }
}

// Function to close modal
function closeModal() {
  modal.style.display = 'none';
  var calendarContainer = document.querySelector('.calendar-container');
  if (calendarContainer) {
    calendarContainer.removeChild(document.getElementById("appointment-date"));
    calendarContainer.removeChild(document.getElementById("appointment-time"));
    calendarContainer.removeChild(document.getElementById("done-button"));
    appointmentAdded = false;
  }
}

// book appointment
function bookAppointment() {
  // Create a new date object and add 7 days to it
  var appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 7);

  // Get the month, day, and year from the date object
  var appointmentMonth = appointmentDate.getMonth() + 1;
  var appointmentDay = appointmentDate.getDate();
  var appointmentYear = appointmentDate.getFullYear();

  // Create the date and time input elements
  var dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.id = "appointment-date";
  dateInput.name = "appointment-date";
  dateInput.value = appointmentYear + "-" + appointmentMonth + "-" + appointmentDay;

  var timeInput = document.createElement("input");
  timeInput.type = "time";
  timeInput.id = "appointment-time";
  timeInput.name = "appointment-time";

  // Create the "Done" button and add it to the container
  var doneButton = document.createElement("button");
  doneButton.id = "done-button";
  doneButton.innerHTML = "Done";
  doneButton.addEventListener("click", function() {
    var dateValue = dateInput.value;
    var timeValue = timeInput.value;
    if (dateValue && timeValue) {
      alert("Appointment booked successfully!");
    } else {
      alert("Please fill in all fields.");
    }
  });

  // Find the calendar container element and add the input elements and "Done" button
  var calendarContainer = document.querySelector(".calendar-container");
  if (calendarContainer) {
    calendarContainer.appendChild(dateInput);
    calendarContainer.appendChild(timeInput);
    calendarContainer.appendChild(doneButton);
    appointmentAdded = true;
  }
}
