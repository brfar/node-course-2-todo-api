/*eslint-disable*/
// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApi', (err, db) => {
	if (err) return console.log('unable to connect to mongodb server');

	console.log('connected to mongodb server');

	// delete many
	// db
	// 	.collection('Todo')
	// 	.deleteMany({ text: 'eat lunch' })
	// 	.then(result => {
	// 		console.log(result);
  //   });
    
  //delete one
  // db
  //   .collection('Todo')
  //   .deleteOne({text: 'eat lunch'})
  //   .then(result => {
  //     console.log(result);
  //   });

  // find one and delete
  // db
  //   .collection('Todo')
  //   .findOneAndDelete({completed: true})
  //   .then(result => {
  //     console.log(result);
  //   });

  // db
  //   .collection('Users')
  //   .deleteMany({ name: 'Bruneidson' })
  //   .then(result => {
  //     console.log(result);
  //   });

  // 
  db
    .collection('Users')
    .findOneAndDelete({ _id: new ObjectID("5a3dd549f6cf5623b4c15313") })
    .then(result => {
      console.log(result);
    });

	// db.close();
});
