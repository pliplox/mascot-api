/* eslint-disable global-require */
require('dotenv/config');
const repl = require('repl');
const mongoose = require('mongoose');
const mongodbUri = require('./config');

const run = async () => {
  await mongoose.connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const r = repl.start('mascotapp > ');

  // If there are other models, that are not here, please add them.
  r.context.User = require('./models/User');
  r.context.FamilyGroup = require('./models/FamilyGroup');
  r.context.TimeZone = require('./models/TimeZone');
  r.context.Pet = require('./models/Pet');
  r.context.Fed = require('./models/Fed');
};

run();
