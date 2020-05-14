const mongodbUri =
  process.env.NODE_ENV === 'development' ? 'mongodb://127.0.0.1:27017' : process.env.MONGODB_URI;

module.exports = mongodbUri;
