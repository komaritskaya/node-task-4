const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const BearerStrategy = require('passport-http-bearer');
const jwt = require('jsonwebtoken')

const app = express();
const port = 8080;

const secret = 'TheOwlsAreNotWhatTheySeem';

mongoose.connect("mongodb://localhost:27017/lesson05", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const UserSchema = new mongoose.Schema({name: String, password: String, jwt: String});
const User = mongoose.model("User", UserSchema);

const localStrategy = new LocalStrategy(
  {
    usernameField: 'name',
    passwordField: 'password',
  }, (name, password, done) => {
    User.find({ name: name, password: password })
      .exec()
      .then((foundUsers) => {
        if (!foundUsers || !foundUsers.length) {
          done('Not found');
        } else {
          done(null, foundUsers[0]);
        }
      });
  }
);

const bearerStrategy = new BearerStrategy((token, done) => {
  User.findOne({ token: token })
    .exec()
    .then((foundUser) => {
      if (!foundUser) {
        done('Not found');
      }
      else {
        done(null, foundUser);
      }
  });
});

passport.serializeUser((user, done) => {
  const token = jwt.sign(
    { name: user.name },
    secret,
    { expiresIn: '48h' },
  );
  User.updateOne(
    { name: user.name },
    { jwt: token },
    (err, updatedUser) => {
      console.log('user >>>', updatedUser);
      console.log('err >>>', err);
      done(null, jwt);
    }
  )
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(bodyParser.json());
passport.use('local', localStrategy);
passport.use('bearer', bearerStrategy);
app.use(passport.initialize());

app.post('/token', passport.authenticate('local', {
  successRedirect: '/success',
  failureRedirect: '/failure',
}));

app.get('/:name', passport.authenticate('bearer', { session: false }),
(req, res) => {
  User.find({ name: req.params.name })
    .exec()
    .then((foundUsers) => {
      if (!foundUsers || !foundUsers.length) {
        const particularUser = new User({ name: req.params.name });
        particularUser.save((err, user) => {
          res.send(`Hello ${user.name}!`);
        });
      } else {
        res.send(`Hello ${foundUsers[0].name}!`);
      }
    })
})

app.listen(port, (err) => {
  if (err) {
    return console.log('The exception happened: ', err);
  }
  
  console.log(`Server listening on port ${port}`);
  
  User.find({}, (err, users) => {
    console.log("Currently in the room:\n", users.map(u => u.name + ' ' + u.jwt).join('\n'));
  })
})