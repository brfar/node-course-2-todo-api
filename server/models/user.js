const mongoose = require('mongoose');
const validator = require('validator'); // Handles the email validation
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
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
