const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRouter = require('./routes/authRouter');
const patientRouter = require('./routes/patientRouter');

// APP
const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const corOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};
app.use(cors(corOptions));

// Development logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/auth', authRouter);
app.use('/patients', patientRouter);

app.use('*', (req, res, next) =>
  res.status(404).json({ Error: 'This route was not defined on this server' })
);

module.exports = app;
