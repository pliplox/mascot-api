const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer();

/**
 * Connect to the in-memory database.
 */
const openConnection = async () => {
  const uri = await mongod.getConnectionString();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  await mongoose.connect(uri, mongooseOpts);
};

/**
 * Drop database, close the connection and stop mongod.
 */
const closeConnection = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

/**
 * Remove all the data for all db collections.
 */
const deleteCollections = async () => {
  const { collections } = mongoose.connection;

  const collectionNames = Object.keys(collections);
  collectionNames.forEach(async collectionName => {
    const collection = collections[collectionName];
    await collection.deleteMany();
  });
};

module.exports = { openConnection, closeConnection, deleteCollections };
