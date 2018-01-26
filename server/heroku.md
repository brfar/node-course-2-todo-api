## Deploying to Heroku

### 1. Change port on `server.js`

```javascript
const port = process.env.PORT || 3000;
```

```javascript
app.listen(port, () => {
  console.log('server is running');
});
```

### 2. Change `package.json`

Tell Heroku how to start the project:
```json
  "scripts": {
    "start": "node server/server.js",
  }
```
Tell Heroku which Node version to use:
```json
  "engines": {
    "node": "v8.9.1"
  }
```

### 3. Setting a real MongoDB database

After creating a new database on mLab, go to `Users` then `Add datatabase user` then copy the link highlighted replacing `<dbuser>` and `<dbpassword>` with the one you just created.

![mLab](capture.png)

Now change this code on `mongoose.js`:
```javascript
mongoose.connect('mongodb://localhost:27017/TodoApp', {
		useMongoClient: true
	}
);
```

to:
```javascript
mongoose.connect('mongodb://bruno:nodenodenode@ds255767.mlab.com:55767/nodejsdevcourse', {
		useMongoClient: true
	}
);
```
### 4. Commit changes to GitHub

### 5. Push application to Heroku

```
$ git push heroku master
```

To open the app on the browser:
```
$ heroku open
```

To check the logs:
```
$ heroku logs
```
___

### Some useful Heroku commands

Show your config variables:
```
$ heroku config
```

Set an enviroment variable. As a test, we're setting a variable NAME equals to Bruno:
```
$ heroku config:set NAME=Bruno
```

Get the variable property. This will return "Bruno":
```
$ heroku config:get NAME
```

Removes an enviroment variable:
```
$ heroku config:unset NAME
```

We have to set the JWT_SECRET on Heroku, otherwise our app would break once its online. To do that we could do something like this:

```
$ heroku config:set JWT_SECRET=nodshfufkjgfl
```

Bingo!