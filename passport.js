const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');

passport.use(
  'facebookToken',
  new FacebookTokenStrategy(
    {
      clientID: 257039545760849,
      clientSecret: '85e797095d542cc7a6ad9cfa80cc3a77',
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('profile', profile);
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);

        // if (req.user) {
        //   // We're already logged in, time for linking account!
        //   // Add Facebook's data to an existing account
        //   req.user.methods.push('facebook');
        //   req.user.facebook = {
        //     id: profile.id,
        //     email: profile.emails[0].value
        //   };
        //   await req.user.save();
        //   return done(null, req.user);
        // } else {
        //   // We're in the account creation process
        //   let existingUser = await User.findOne({ 'facebook.id': profile.id });
        //   if (existingUser) {
        //     return done(null, existingUser);
        //   }

        //   // Check if we have someone with the same email
        //   existingUser = await User.findOne({ 'local.email': profile.emails[0].value });
        //   if (existingUser) {
        //     // We want to merge facebook's data with local auth
        //     existingUser.methods.push('facebook');
        //     existingUser.facebook = {
        //       id: profile.id,
        //       email: profile.emails[0].value
        //     };
        //     await existingUser.save();
        //     return done(null, existingUser);
        //   }

        //   const newUser = new User({
        //     methods: ['facebook'],
        //     facebook: {
        //       id: profile.id,
        //       email: profile.emails[0].value
        //     }
        //   });

        //   await newUser.save();
        //   done(null, newUser);
        // }
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);
