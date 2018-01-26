const mongoose = require('mongoose');

/* Inside of MongoDB, your collections can store anything. I could have a collection with a document that
has an 'age' property  and that's  it. I  could have a different  document in  the same collection with a 
property 'name' and that's it. These two documents are different but they're both in the same collection.
Mongoose likes to  keep things more  organized. We're gonna create a model for everything we wanna store.
In this example we'll  be creating a 'todo' model; a 'todo' is  gonna have certain attributes: it's gonna 
have a text attribute  (a string),  a completed attribute (a boolean) and these are things we can define. 
The block below is a mongoose model, so mongoose knows how to store our data. */
const Todo = mongoose.model('Todo', {
  /* mongoose.model() takes as arguments, a string name and and object that defines the various
  properties for a model. 
  http://mongoosejs.com/docs/validation.html */
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Number,
    default: null,
  },
  _creator: {
    /** Store the id of the user who created the todo. This is gonna let us make sure the user does
     * indeed have access to manage this data. 'type' is the ObjectId
    */
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

/* To illustrate how to create instances of this: The name of the variable is not  important.  What's 
important is that you run the 'Todo' function above, and since it's a constructor function we have to 
use 'new' to create a new instance 'Todo'. The Todo constructor function takes as  argument an object 
where we can specify some of the properties set on Todo

  var newTodo = new Todo({
    text: 'Cook dinner'
  });

Creating an new instance alone does not update the MongoDB database. What we need to do is call
a method on 'newTodo'. save() is gonna be responsible for saving this to the MongoDB database. 

 newTodo.save().then(doc => {
  console.log('saved todo', doc);
 }, e => console.log('unable to save todo'));
*/

module.exports = { Todo };
