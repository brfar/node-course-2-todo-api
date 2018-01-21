const mongoose = require('mongoose');
const validator = require('validator'); // Handles the email validation
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
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
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
},{ usePushEach : true});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};

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
