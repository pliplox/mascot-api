const mongoose = require('mongoose');
require('dotenv/config');

/**
 * Connect to database
 */
module.exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(
      'There was an error trying to connect to the database, see the full error below: ',
      error
    );
  }
};

/**
 * Close Database connection
 */
module.exports.close = async () => {
  await mongoose.connection.close();
};

/**
 * Remove all the data for all database collections
 */
module.exports.clearAll = async () => {
  const collectionNames = Object.keys(mongoose.connection.collections);
  collectionNames.forEach(async collectionName => {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  });
};
