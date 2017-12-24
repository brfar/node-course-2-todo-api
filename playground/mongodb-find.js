/*eslint-disable*/
// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApi', (err, db) => {
	if (err) return console.log('unable to connect to mongodb server');

	console.log('connected to mongodb server');

	// db
	// 	.collection('Todo')
	// 	.find({ _id: new ObjectID('5a3eef6f4f0a8159429d86a3') })
	// 	.toArray()
	// 	.then(
	// 		docs => {
	// 			console.log('todos');
	// 			console.log(JSON.stringify(docs, undefined, 2));
	// 		},
	// 		err => {
	// 			console.log('unable to fetch todos', err);
	// 		}
	// 	);

	db
		.collection('Todo')
		.find()
		.count()
		.then(
			count => {
				console.log('todos count:' + count);
			},
			err => {
				console.log('unable to fetch todos', err);
			}
		);

	db
		.collection('Users')
		.find({ name: 'Bruno' })
		.toArray()
		.then(docs => {
			console.log('results: ')
			console.log(JSON.stringify(docs, undefined, 2));
		}, err => {
			console.log('unable');
		});

	// db.close();
});
