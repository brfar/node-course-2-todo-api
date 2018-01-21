var { User } = require('./../models/user');

/** Middleware function we use on our routes to make them private. */
var authenticate = (req, res, next) => {
	var token = req.header('x-auth');
	/** req.header is very similar to res.header. res lets us set a header, req is getting the value, so we only need to pass in the key.
	 * The x-auth header variable is the value we wanna fetch. */

	/** When some code is going to be used in multiple places, it's good to turn into the user schema and create a model method.
	 * The model method is gonna be accessed via User.findByToken, which is gonna take the token value and it's gonna find the appropriate
	 * user related to that token, returning it inside of your promise callbacks. This means we'll be able to do something with the document
	 * of the user associated with the token. */
	User.findByToken(token)
		.then(user => {
			if (!user) {
				return Promise.reject();
				/** Usually we would copy the exact same thing on line 26, but we can return Promise.reject() and the 'catch'
				 * block on line 27 will be called. So we don't have to duplicate code.
				 */
			}

			req.user = user; // Modifies req.user to the user we just found
			req.token = token; // Same as above
			/** Now that we have 'request' modified, we're gonna be able to use that data by accessing it over server.js (line 156) */
			next(); // We MUST call next() otherwise the actual route is not going to run!
		})
		.catch(e => {
			res.status(401).send(); // All it does is send a 401 status
		});
};

module.exports = { authenticate };
