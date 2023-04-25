# Vhealth

<!-- redis://red-ch3thqiut4m1v1o79lq0:6379 -->

Vhealth is a consultation web tool that allows patients and health care providers to meet, plan a meeting, and join a video conference at the time of the appointment.

Its goal is to give Telehealth services to patients who want to discuss health issues with professional health service providers without leaving their homes.

### Technologies

Node.js, Javascript, Redis, MongoDB, BullMq, Mailgun

### How to Use

- clone the Vhealth repository
- cd backend/
- run `npm install` - to install all the dependencies
- run `npm run start` - to start the server
- open your web browser and enter http://localhost:5050/api/v1/vhealth/docs/

### Important Information

The development of this project is ongoing. The main backend logic has only been implemented for the most crucial functionalities of the project which includes.

- Authentication of the User - signup, login and logout
- Authorization of admin to perform some crucial adminitrative work
- CRUD operation on User's Table
- CRUD operation on Provider's Table by the Admin and moderator
- Search health service provider by location and specialty
- Booking an appointment with providers by choosing from time availability of the providers
- Background worker that handles the appointment notification service

A team of four people—two frontend developers and two backend programmers—was meant to build the project. As one of the two backend guys, I was left to create the project's basic backend functionalities after the rest of the team ceased responding.

The video conference directory contains the code I wrote along while learning WebRTC - Web Real-Time Communication - which I aim to integrate into the backend. As a result, I cannot claim sole ownership of the code.

The frontend directory contains the litte work one of the frontend guys did before she stopped responding as well.
