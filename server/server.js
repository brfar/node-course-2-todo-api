/* This is gonna be the root of the application; when we start the node app, this file is gonna run.*/
var express = require('express');
var bodyParser = require('body-parser'); /* Lets us send JSON to the server. 
It takes a string body and turns it into a JS object */
var { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user'); /* Pulls off the 'User' variable we're getting from the object
that comes back from a call to 'require', requiring ./models/user */

var app = express();
/* process.env.PORT is only gonna be set when the app is deployed. If it's running locally it'll be 3000 */
const port = process.env.PORT || 3000;

/* bodyParser takes JSON and convert it into object, attaching it on the 'req' object 
app.use takes the middleware. If we were writing a custom one it'd be a function, if we use a third party
middleware we usually just access something off of the library. In the case it'll be bodyParser.json()
getting called as a function. The return value from this JSON method is a function and that is the 
middleware we need to give to 'express' */
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	// console.log(req.body);
	var todo = new Todo({ // Creates an instance of 'Todo'
		text: req.body.text
	});
	
	todo.save().then(
		doc => {
			res.send(doc);
		},
		e => {
			res.status(400).send(e);
		}
	);
});

app.get('/todos', (req, res) => {
	Todo.find().then(
		todos => {
			res.send({ todos });
		},
		e => {
			res.status(400).send(e);
		}
	);
});

app.get('/todos/:id', (req, res) => {
	var id = req.params.id;

	if (!ObjectID.isValid(id)) return res.status(404).send();

	Todo.findById(id)
		.then(todo => {
			if (!todo) return res.status(404).send();

			res.send({ todo });
		})
		.catch(e => {
			res.status(400).send();
		});
});

app.listen(port, () => {
	console.log(`🔥  app is running 🔥  on port ${port}`);
});

module.exports = { app }; // For testing purposes

/* On package.json '"start": "node server/sever.js"' is responsible for telling heroku how to start
the project! */