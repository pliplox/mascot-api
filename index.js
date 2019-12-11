const mongoose = require('mongoose');
const app = require('./app');
require('dotenv/config');

mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  err => {
    if (err) {
      console.log(`Error trying to connect to the database: ${err}`);
    } else {
      console.log('Connect to database: \x1b[32m%s\x1b[0m ', process.env.MONGODB_URI);

      app.listen(process.env.PORT, () => {
        console.log('Server running and listening in port: \x1b[32m%s\x1b[0m', process.env.PORT);
      });
    }
  }
);
