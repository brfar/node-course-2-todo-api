const mongoose = require('mongoose');
const validator = require('validator'); // Handles the email validation
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

/** We can't add methods to 'User', so we have to switch how we're generating the model. The first object
 * passed as argument to mongoose.Schema was literally cut from mongoose.model below so we can now add
 * methods. We now pass the variable UserSchema as the second argument to mongoose.model.
 */
var UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      unique: true /* Guarantees that emails don't be duplicated. You can't sign up for an account if the email is already in use.  */,
      validate: {
        // http://mongoosejs.com/docs/validation.html
        /* validate takes 'validator', a function that makes sure the value is valid, and a 'message' */
        validator:
          validator.isEmail /* Returns true or false
      ^ is the same as:
      validator: value => validator.isEmail(value); */,
        message: '{VALUE} is not a valid email'
      }
    },
    password: {
      type: String,
      required: true,
      minlength: 6 // Minimum length of the password 
    },
    tokens: [
      {
        access: {
          type: String,
          required: true
        },
        token: {
          type: String,
          required: true
        }
      }
    ]
  },
  { usePushEach: true } // Without this line an error is thrown by MongoDB
);

/** This method determines what exactly gets send back when a mongoose model is converted into a JSON value  */
UserSchema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject();
  /** toObject is responsible for taking your mongoose variable 'user' and converting it into a regular object
   * where only the properties available on the document exist. */

  return _.pick(userObject, ['_id', 'email']);
  /** With this, we'll be leaving off things like password and the tokens array which should not get returned. */
};

/** UserSchema.methods is an object and we can add on this object any method we like. These are gonna be
 * your instance methods. In our case we're gonna be adding an instance method called generateAuthToken.
 * Your instance methods do have access to the individual document
 */
UserSchema.methods.generateAuthToken = function() {
  // Not using arrow function because we'll need the 'this' keyword.
  /** When we call this generateAuthToken method, 'this' will be the document where the method was called on */
  var user = this;

  /** To create a new token (line 32) we need to get an access and token value  */
  var access = 'auth';
  /** As we've seen on hashing.js, jwt.sign takes an object we wanna sign and a secret value
   * The actual data we wanna sign is the user id. access is the other property we'll be adding on. */
  var token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString();

  /** Update the user tokens array with the necessary properties (line 32). This update the local
   * user modal but DO NOT save. */
  user.tokens.push({ access, token });

  /** Save it. In server.js we're gonna need access to this token returned below to add another .then()
   * and to something with it in the callback function. In order to allow server.js to chain on to the promise,
   * we're gonna need to return it first. */
  return user.save().then(() => {
    return token; // To save it, we return the token created above.
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: { token }
    }
  });
};

/** Instead of accessing .methods, we're gonna access .statics which is an object, kinda like .methods although everything you add onto it
 * turns into a model method as opposed to an instance method. */
UserSchema.statics.findByToken = function (token) {
  var User = this;
  /** Instance method get called with the individual document (line 67) 
   * but model model methods get called with the model as the 'this' binding */
  var decoded; 
  /** Is gonna store the decoded JWT values. This is gonna be the return result from jwt.verify which we used over hashing.js
   * The reason it's set to undefined is because the jwt.verify function will throw an error if anything goes wrong: if the secret
   * doesn't match the secret the token was created with or if the token value was manipulated. That means we wanna be able to catch
   * this error and do something with it. To do that we're gonna be using the try/catch block below.
  */

  try {
    /** If any errors happen in the try block, the code automatically stops execution and moves into the catch block.
     * Here, we wanna test jwt.verify. We wanna see if this throw an error. We're gonna pass the token we wanna decode + the secret. */
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
    /** This promise will get returned from findByToken, then over inside of server.js it'll get rejected so the 'then' success case
     * will never fire. The .catch will tho.
     * ^ same as:
     * return new Promise((resolve, reject) => {
     *   reject();
     * })
     */
  }
  
  /** If we're able to successfully decode the token that was passed in as the header, we're gonna call User.findOne to find the
   * associated user, if any. This is gonna return a promise and we are going to return THAT in order to add some chaining. That means
   * we can add a .then() call on to findByToken over in server.js
   * Inside of 'tokens' (line 33) we have an array with 'access' and 'token' properties and we need to find users whose values
   * match the ones we have. right */
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token, /** Find a user whose tokens array has an object where the token property equals the token property 
    we have right here (line 89) */
    'tokens.access': 'auth' /** Find a user where in their tokens array the access property is set to 'auth' */
  });
};

/** Takes an email/password as argument and return a promise with a user or an error if the user don't exist. */
UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  /** We need to try to find a user where the email equals the email that was passed in. It'd be nice if we could do that with the
   * password as well but we can't; we have the plain text password here, we do not have the plain text password stored in the database
   * so we can't query that data. In order to find a potential match we're gonna find the user that does have the email of the email 
   * passed in. */
  return User.findOne({email}).then((user) => {
    /** We're returning the line above because we're chaining this promise since we're added a .then/.catch call on server.js
     * The .then() on line above is because we have to verify that the password also matches. All of the is gonna happen inside
     * this .then() call */
    if (!user) return Promise.reject(); // Returns a rejected promise if there's no user

    /** bcrypt only support callbacks, it does not support promises. So, to keep working with promises, we have to return a new Promise 
     * where we're gonna pass 'resolve' and 'reject' in case something goes wrong. Inside this promise we'll use bcrypt.compare to 
     * compare the password on line 130 with the user.password property. That means inside serve.js we're gonna be able to do something
     * with the user when it comes back.
    */
    return new Promise((resolve, reject) => {
      /** Compares the password given to the hashed password. Since compare() returns true or false, we're checking
       * if res is true. If it is, then we'll resolve this promise. If not, we'll reject it. */
      bcrypt.compare(password, user.password, (err, res) => {
        res ? resolve(user) : reject();
      });
    });
  });
};

/** Mongoose middleware lets you run certain code before or after certain events. Eg an update event: we can run
 * some code before and/or after we update a model. In our case we wanna run some code before a document is ever 
 * saved to the database; We wanna make sure the hashed password is in place. 
 * pre() runs the code before the event. The event is saved and after that the code is run. We call next() when 
 * we're done and that's when the model gets saved to the database. Here we're gonna salt and hash the password
 * before saving it to the database: */
UserSchema.pre('save', function (next) {
  var user = this;

  /** There's gonna be times where we save the document and we're never gonna have to updated the password, which
   * means the password will already be hashed. Imagine I save a document with the plaintext password, then the
   * password gets hashed. Later on I update something that's not the password, like the email. This middleware
   * is gonna run again, that means we're gonna hash our hash and the program is gonna break. We're gonna use a 
   * method available on our instance called isModified() - it takes an individual property like "password" and
   * returns true if "password" is modified and false if it's not, and we only wanna encrypt the password if it
   * was just modified, this is why we're wrapping it inside the 'if': if it's just been modified, we're gonna
   * hash the password, if not, we just gonna call next() moving on with the middleware. 
   */
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash; // user.password just the plaintext. Here we override the value to the hashed version. 
        next(); // Move on to save the document
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

/* To illustrate how it works:
var user = new user({
  email: 'andrew@example.com    '
});

user.save().then(doc => {
  console.log('user saved', doc);
}, e => console.log('unable to save user', e));
 */

module.exports = { User };

