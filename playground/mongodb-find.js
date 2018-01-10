const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApi', (err, db) => {
	if (err) return console.log('unable to connect to mongodb server');

	console.log('connected to mongodb server');

	db
		.collection('Todos')
		.find({ _id: new ObjectID('5a3eef6f4f0a8159429d86a3') }) /* We can't just copy the id because what's inside the id property
		is not a string, it's an ObjectID. That's why we have the ObjectID var on line 1 */
		.toArray() // find() returns a cursor, so this method converts it into an array. toArray() returns a promise!
		.then(
			docs => {
				console.log('Todos');
				console.log(JSON.stringify(docs, undefined, 2));
			},
			err => {
				console.log('unable to fetch todos', err);
			}
		);

	db
		.collection('Todos')
		.find() // Fetch every single Todo since there's no arguments. find() returns a cursor.
		.count() // Counts the # of Todos.
		.then(
			count => {
			console.log(`todos count: ${count}`);
			},
			err => {
				console.log('unable to fetch todos', err);
			}
		);

	db
		.collection('Users')
		.find({ name: 'Bruno' })
		.toArray()
		.then(
			docs => {
				console.log('results: ');
				console.log(JSON.stringify(docs, undefined, 2));
			},
			err => {
				console.log('unable');
			}
		);

	// db.close();
});
