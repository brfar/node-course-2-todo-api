/* Object destructuring lets you pull out properties from an object creating variables. In the example below, we require 'mongodb'
and inside mongodb there are those properties: MongoClient and ObjectID. We're saving those properties into those variables
of the same name! Eg:
const MongoClient = require('mongodb').MongoClient; // Old way
const {MongoClient} = require('mongodb'); // Destructuring way */
const {MongoClient, ObjectID} = require('mongodb');

/* This method connects to the database and it takes two arguments: the url where your db lives. In a
production example, this might be an Amazon Web Services url or a Heroku url. In this case it'll be the
localhost url. The second argument is the callback function, which will fire after the connection has
succeeded or failed. The 'db' argument in the callback function is an object; this is what we can use 
to issue commands to read and write data. */
MongoClient.connect('mongodb://localhost:27017/TodoApi', (err, db) => {
	if (err) return console.log('unable to connect to mongodb server');

	console.log('connected to mongodb server');

	/* Insert data into the 'Todo' collection. It takes as its only argument the string name for the
	collection you wanna insert into. insertOne() is a method available on our collection which lets us
	insert a new document in our collection. It takes 2 arguments: an object and a callback */
	db.collection('Todos').insertOne({
		text: 'Something to do',
		completed: false,
	}, (err, result) => {
		if (err) return console.log('unable to insert todo', err);

		// Result pretty-printed. The '.ops' stores all the docs that were inserted
		console.log(JSON.stringify(result.ops, undefined, 2)); 
	});

	db.collection('Users').insertOne({
		name: 'Bruno',
		age: 28,
		location: 'Recife'
	}, (err, result) => {
		if (err) return console.log('unable to insert user', err);
		
		console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
		// getTimestamp() is a method inside the object id that returns the time the document was added to the db
	});

	db.close(); // Closes the connection with the db server.
});
