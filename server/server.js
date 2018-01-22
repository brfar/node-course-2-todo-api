/* This is gonna be the root of the application; when we start the node app, this file is gonna run.*/
require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser'); /* Lets us send JSON to the server. 
It takes a string body and turns it into a JS object */
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user'); /* Pulls off the 'User' variable we're getting from the object
that comes back from a call to 'require', requiring ./models/user */
var { authenticate } = require('./middleware/authenticate');

var app = express();
/* process.env.PORT is only gonna be set when the app is deployed. If it's running locally it'll be 3000 */
const port = process.env.PORT;

/* bodyParser takes JSON and convert it into object, attaching it on the 'req' object 
app.use takes the middleware. If we were writing a custom one it'd be a function, if we use a third party
middleware we usually just access something off of the library. In the case it'll be bodyParser.json()
getting called as a function. The return value from this JSON method is a function and that is the 
middleware we need to give to 'express' */
app.use(bodyParser.json());

app.post('/todos', (req, res) => { 
  // console.log(req.body); 
  var todo = new Todo({  
    // Creates an instance of 'Todo' 
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

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) return res.status(404).send(); // Validates id

  Todo.findByIdAndRemove(id)
    .then(todo => {
      if (!todo) return res.status(404).send();

      res.send({ todo });
    })
    .catch(e => {
      res.status(404).send();
    });
});

/* Route that lets you update a todo item; whether you wanna change the text or toggle it as completed.
'patch' is what you use when you wanna update a resource. */
app.patch('/todos/:id', (req, res) => {
  var id = req.params.id; // Grab the id.

  /* The request body is where the updates are gonna be stored. If I wanna set a todo's text to something else, I'd make a patch
  request and set the text property equal to whatever I wanted the todo text to be. The problem is that someone can send any
  property along - they could send along properties that aren't on the todo items or properties we don't want them to update.
  In order to pull off just the properties we want users to update, we're gonna be using the 'pick' method from lodash. 
  'pick' takes an object and an array of properties that you wanna pull off IF they exist. Eg, if the 'text' property exists,
  we wanna pull that off of 'req.body' adding it to 'body'. 'text' and 'completed' are the only thing users can update. */
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) return res.status(404).send(); // Validates id

  /* Checks the 'completed' value and use that value to set 'completed' at. If a user sets 'completed' to true, we wanna set
  'completed' to a timestamp, if they set it to false we wanna clear that timestamp because the todo won't be completed. */
  if (_.isBoolean(body.completed) && body.completed) {
    // If it is a boolean AND it's 'true':
    /* Everything we set on 'body' is eventually gonna be updated in the model. We don't want the user to update everything, so
    we've picked off some certain ones from req.body, but right here we can make some modifications of our own, setting this 
    equal to the current timestamp: */
    body.completedAt = new Date().getTime();
  } else {
    // Not a boolean OR not true
    body.completed = false;
    body.completedAt = null; // Clear body.completedAt
  }

  /* http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate 
     Model.findByIdAndUpdate(id, [update], [options], [callback])
  $set ~> We can't just set key value pairs, we have the use MongoDB operators. $set takes a set of key value pairs and these
  are gonna get set. Here it'll be 'body'. 'new' returns the updated object. */
  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(todo => {
      if (!todo) return res.status(404).send();

      res.send({ todo });
    })
    .catch(e => {
      res.status(400).send();
    });
});

// POST /users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']); // Line 91 explains wtf that does
  var user = new User(body); /* Creates new instance of the User model. This takes an object with the email
  and password properties. Since those properties are on "body" already, we can just put "body" here. */

  user
    .save() // Tries to save the document to the database
    .then(() => {
      return user.generateAuthToken(); // Return it since it we're expecting a chaining promise
    })
    .then(token => {
      // 'token' is what's returned on generateAuthToken() [user.js line 74]
      res.header('x-auth', token).send(user);
      /** We have to add on the header. We have to send the token back as an HTTP response header, which is the
       * real goal here. To do that, we call .header on the response object. header() takes as arguments key value pairs:
       * they key is the header name and value is the value you wanna set the header to. Our header name will be x-auth.
       * When you prefix a header with x-auth, you're creating a custom header, which it's not necessarily a header that
       * HTTP supports by default. It's a header you're using for our specific purposes. This application for example, we're
       * using a JWT token scheme, so we're creating a custom header to store that value.
       * Next, we can pass in the value which is just going to be the token argument up above...
       */
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

/** This route is going to require authentication, which means you're gonna need to provide a valid x-auth token.
 * It's gonna find the associated user and it's gonna send that user back
 */
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// POST /users/login {email, password}
/** Set up a dedicated route for logging in existing users. Without it the only way to get an x-auth token back is on the Sing Up call.
 * If you lose the token or sign in from a different device, of course you're gonna wanna be able to get a new one and without the block
 * below it's just not possible. When you make a post request to this route, you'll be sending along an email and password. This means
 * we're gonna need to try to find a user in the database who has en email matching the email sent and a hashed password equals the plain
 * text password. We're not gonna be using the authenticate middleware because we don't have a token. You're trying to get one, that's the
 * whole purpose of this call.  */
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  /** We need to verify that a user exists with that email. Then we're gonna get its password property and pass that through
   * bcrypt.compare()  */
  User.findByCredentials(body.email, body.password)
    .then(user => {
      /** We're retuning the code below to keep the chain alive, so if we run into any errors inside of the .then() the 
       * .catch() will be called. When we do find the user, instead of responding, we're gonna call generateAuthToken. 
       * This method is gonna generate a token which we can use on the .then call. */
      return user.generateAuthToken().then(token => {
        res.header('x-auth', token).send(user);
        /** The only thing we need to do here is respond. Here we use res.header to seth the x-auth header,
         * We set it equal to the token we just created. And finally send the response body back as the user. */
      });
    })
    .catch(e => { // If the user wasn't found
      res.status(400).send();
    });
});

app.listen(port, () => {
  console.log(`🔥  app is running 🔥  on port ${port}`);
});

module.exports = { app }; // For testing purposes

/* On package.json '"start": "node server/sever.js"' is responsible for telling heroku how to start
the project! */
