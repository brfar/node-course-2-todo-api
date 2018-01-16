var mongoose = require('mongoose');

/* Mongoose supports callbacks by default. The line below tells mongoose which promise library
we wanna use. Here we tell mongoose we wanna use the built in promise library */
mongoose.Promise = global.Promise;

// Very similar to MongoClient.connect()
// 'mongodb://localhost:27017/TodoApp' || 
process.env.MONGODB_URI = 'mongodb://bruno:nodenodenode@ds255767.mlab.com:55767/nodejsdevcourse' 
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp', {
		useMongoClient: true
	}
);

module.exports = { mongoose };
