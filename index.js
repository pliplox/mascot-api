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
    }

    app.listen(process.env.PORT, () => {
      console.log(`Server running and listening in port: ${process.env.PORT}`);
    });
  }
);
