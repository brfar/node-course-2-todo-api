const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApi', (err, db) => {
	if (err) return console.log('unable to connect to mongodb server');

	console.log('connected to mongodb server');

	// http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#findOneAndUpdate
	db
		.collection('Todos')
		.findOneAndUpdate(
			{
				_id: new ObjectID("5a404bfc2f64025f2fdb0cbb")
			},
			{
				$set: {
					// https://docs.mongodb.com/manual/reference/operator/update/
					completed: false
				}
			},
			{
				returnOriginal: false
			}
		)
		.then(result => {
			console.log(result);
    });
    
    db
      .collection('Users')
      .findOneAndUpdate({
        _id: new ObjectID('5a3dd6933b83d118685f2a51')
      }, {
        $set: {
          name: 'Breno'
        },
        $inc: {
					// https://docs.mongodb.com/manual/reference/operator/update/inc/#up._S_inc
          age: 1
        }
      })
      .then(result => {
        console.log(result);
      });

	// db.close();
});
