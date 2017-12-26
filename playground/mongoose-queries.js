/*eslint-disable*/
const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

const id = '5a419a87bf7f9434b480140e11';

// if (!ObjectID.isValid(id)) {
// 	console.log('ID not valid!');
// }

// Todo.find({
// 	_id: id
// }).then(todos => {
// 	console.log('todos', todos);
// });

// Todo.findOne({
// 	_id: id
// }).then(todo => {
// 	console.log('todo', todo);
// });

// Todo.findById(id).then(todo => {
// 	if (!todo) return console.log('id not found');
// 	console.log('todo by id', todo);
// }).catch(e => console.log(e));

User.findById('5a40695e844fa917c0d30216')
	.then(user => {
		if (!user) return console.log('user not found');
		console.log(JSON.stringify(user, undefined, 2));
	})
	.catch(e => console.log(e));