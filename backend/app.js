const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const providerRouter = require('./routes/providerRouter');
const appointementRouter = require('./routes/appointementRouter');

// APP
const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Development logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger Documentation config
const file = fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(file);

const options = {
  explorer: true,
  customSiteTitle: 'Vhealth',
};
app.use(
  '/api/v1/vhealth/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, options)
);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/providers', providerRouter);
app.use('/api/v1/appointments', appointementRouter);

app.use('*', (req, res, next) =>
  res.status(404).json({ Error: 'This route was not defined on this server' })
);

module.exports = app;
