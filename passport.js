require('dotenv/config');
const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');

const CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const CLIENT_SECRET = process.env.FACEBOOK_APP_SECRET;

passport.use(
  'facebookToken',
  new FacebookTokenStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        done(null, profile);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);
