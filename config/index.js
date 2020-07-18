const mongodbUri = () => {
  const processObject = {
    local: 'mongodb://localhost/mascotapp',
    staging: process.env.MONGODB_URI_STAGING,
    production: process.env.MONGODB_URI_PRODUCTION
  };

  return processObject[process.env.API_ENV];
};

module.exports = mongodbUri();
