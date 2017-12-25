/*eslint-disable*/
// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApi', (err, db) => {
	if (err) return console.log('unable to connect to mongodb server');

	console.log('connected to mongodb server');

	// db
	// 	.collection('Todo')
	// 	.findOneAndUpdate(
	// 		{
	// 			_id: new ObjectID("5a404bfc2f64025f2fdb0cbb")
	// 		},
	// 		{
	// 			$set: {
	// 				completed: false
	// 			}
	// 		},
	// 		{
	// 			returnOriginal: false
	// 		}
	// 	)
	// 	.then(result => {
	// 		console.log(result);
  //   });
    
    db
      .collection('Users')
      .findOneAndUpdate({
        _id: new ObjectID('5a3dd6933b83d118685f2a51')
      }, {
        $set: {
          name: 'Breno'
        },
        $inc: {
          age: 1
        }
      })
      .then(result => {
        console.log(result);
      });

	// db.close();
});
