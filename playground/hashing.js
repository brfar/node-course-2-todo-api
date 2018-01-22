const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
/** 'jwt' replaces the whole song-and-dance we have to do on lines 18 and above. This variable
 * essentially gives it 2 functions: one to create the token and one to verify it. Instead of
 * adding all the code with the if/else, we just simply call these two utility functions.
 */
const bcrypt = require('bcryptjs');

var password = '123abc!';

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash);
  });
});

var hashedPassword = '$2a$10$huAU4qTnQuGPifHEXfV9cOmPJ7p61oKaoXrY1WviiDAznE/rW8oLK';

bcrypt.compare(password, hashedPassword, (err, res) => {
  console.log(res);
});

//////////////////////////////////
// 👾 USING JSON WEB TOKEN 👾 //

var data = {
	id: 10
};

/** jwt.sign takes the object and it takes our secret. The call to sign() is gonna return
 * our token, that's why we're storing it in a variable called 'token'. This is the
 * value we're gonna send back to the user when they either sign up or log in. It's also
 * the value we're gonna store inside of that tokens array on user.js
 */
var token = jwt.sign(data, '123abc');
console.log(token);

/** jwt.verify does the opposite of sign(): it takes that token and the secret and it makes sure
 * that data was not manipulated.
 */
var decoded = jwt.verify(token, '123abc');
console.log('decoded', decoded);

/////////////////////////////
// 👾 USING CRYPTO-JS 👾 //

var message = 'I am user number 3'; // Value to be hashed

/* To hash a value, all we have to do is pass it into the SHA256 function.
The result is an object. To convert it to a string we use the toString() method: */
var hash = SHA256(message).toString();

console.log(`Message: ${message}`);
console.log(`Hash: ${hash}`); // Hash: 9da4d19e100809d42da806c2b7df5cf37e72623d42f1669eb112e23f5c9d45a3

/** 💡 Hashing is a one-way algorithm. Meaning that given this message I am always going to get this result,
 * but I cannot get the original message back if I have the result. The hash is always going to be identical
 * for that specific message. Hashing is used, for example, for storing passwords in a database, since it's
 * a bad idea to store plain text passwords in a db. Hashing is a way to obfuscate the actual plain text password:
 * When someone goes to log in later, they pass the plaintext password, we hash it getting their result and we
 * compare that result to the result in the database. If the two hashes in are identical, then the password is
 * correct. This is not gonna prevent someone in the middle from seeing the value. We'll be using HTTPS for that.
 * This is going to prevent someone on the client who gets the value from manipulating the ID and changing it
 * to something else.
 */

var data = {
	id: 4
	/** This is gonna be equal to the user's ID inside of the user.js file. This is going to let us know
	 * which user should be able to make that request. Eg: if I'm trying to delete a todo with an ID of 3 but the
	 * user who created that doesn't match the ID of the token, then I know they shouldn't be able to delete that
	 * because it's not their data. data.id is what we wanna send back to the client. The important part is to
	 * make sure the client doesn't set 4 to 5, send the token back to us and say "hey go ahead and delete all the
	 * todos for user number 5". That would be a big security flaw. So, instead, what we're gonna do is to create
	 * a separate variable called "token"
	 */
};

var token = {
	data,
	hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
	/** This is what we're gonna send back to the user. This token variable contain a data property that
	 * set equal to the data object defined above. Then we're gonna set a hash property, which will be the
	 * hash value of that data. If the data changes later on and we rehash it, we're not gonna get the same
	 *  value back, so we'll be able to tell the data was manipulated by the client and we shouldn't expect
	 *  it to be valid. The 'somesecret' part of line 48 is what's called "salting the hash". That means
	 *  you add something on to the hash that is unique that changes the value. Eg: if I hash the string
	 * 'password', I'm gonna get the same result every time, but if I hash it with some sort of randomly
	 * generated value, I'm gonna get a different result. As long as I use a different salt every single
	 * time, I'm never going to get the same hash twice. The reason we're salting the hash here is because
	 * without it, the token is not foolproof: let's say the user changes the data id property to 5. All
	 * they have to do is rehash that data, add it on to the rash properties, send the token back and they
	 * technically would trick us.
	 * We wanna have a secret added onto the end, like 'somescret' and this is gonna salt our hash. Now the
	 * user is not gonna be able to manipulate this data anymore. They could change the ID from 4 to 5, they
	 * could try to rehash, but they're not gonna have the secret, so their hash is gonna be bad. When we then
	 * try to verify the hash later on, we're gonna se that the data and hash don't add up because the person
	 * who manipulated it didn't have the secret and we'll be able to deny access for that request.
	 */
};

/** Simulate changing the data: someone might try to change token.data.id to 5, then the person would
 * also create the hash. This is where the salt comes into play: they person in the middle, the one
 * trying to manipulate the data, they do not have access to the same salt. They don't know that secret
 * because the secret is only on the server, which means when they try to rehash and update token.hash
 * to a new value, it's not gonna match the hash that we create later on and we'll be able to tell the
 * data was changed.
 */

token.data.id = 5;
token.hash = SHA256(JSON.stringify(token.data)).toString();

var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
/** Here, we're creating a variable holding the original hash, using the salt only we know. If the user
 * tries to manipulate token.hash we can compare it to this variable to see if the hashes matches or not.
 */

if (resultHash === token.hash) {
	console.log('Data was not changed');
} else {
	console.log('Data was changed. Do not trust!');
}
