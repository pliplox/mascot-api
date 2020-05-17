const mongodbUri =
  process.env.NODE_ENV === 'development'
    ? 'mongodb://localhost/mascotapp'
    : process.env.MONGODB_URI;

module.exports = mongodbUri;
