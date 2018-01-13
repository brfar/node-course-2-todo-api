const mongoose = require('mongoose');

const User = mongoose.model('User', {
	email: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
	},
});

/* To illustrate how it works:
var user = new user({
	email: 'andrew@example.com    '
});

user.save().then(doc => {
	console.log('user saved', doc);
}, e => console.log('unable to save user', e));
 */

module.exports = { User };
