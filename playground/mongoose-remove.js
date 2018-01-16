const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

/* Todo.remove: you pass in a query, and that query matches multiple records removing all of them.
You CAN'T pass in an empty argument and expect all the documents to get removed. You gotta use {} */
Todo.remove({}).then(result => {
	console.log(result);
});

/* Those will return the deleted document, unlike .remove() which returns only 
the number of documents removed. */
Todo.findOneAndRemove({_id: '<id>'}).then(todo => {
	console.log(todo);
});

Todo.findByIdAndRemove('<id goes here>').then(todo => {
	console.log(todo);
});
