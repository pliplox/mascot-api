/* eslint-disable global-require */
require('dotenv/config');
const repl = require('repl');
const mongoose = require('mongoose');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const r = repl.start('skollapp > ');

  // If there are other models, that are not here, please add them.
  r.context.User = require('./models/User');
  r.context.FamilyGroup = require('./models/FamilyGroup');
  r.context.TimeZone = require('./models/TimeZone');
};

run();
