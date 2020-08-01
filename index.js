/* eslint-disable no-console */
const mongoose = require('mongoose');
const app = require('./app');
const mongodbUri = require('./config');
require('dotenv/config');

try {
  mongoose.connect(
    mongodbUri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    err => {
      if (err) {
        console.log(`Error trying to connect to the database: ${err}`);
      } else {
        console.log(`Starting on ${process.env.API_ENV} mode`);
        console.log('Connected to database: \x1b[32m%s\x1b[0m ', mongodbUri);
        app.listen(process.env.PORT, () => {
          console.log('Server running and listening in port: \x1b[32m%s\x1b[0m', process.env.PORT);
        });
      }
    }
  );
} catch (error) {
  console.log(error);
}
