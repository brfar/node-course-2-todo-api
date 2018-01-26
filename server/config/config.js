var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  var config = require('./config.json');
  var envConfig = config[env]; /* config[test] vai puxar "test" no json. When you wanna use a
  variable to access a property, you have to use bracket notation like this. */
  
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
    // console.log(process.env[key]);
  });
  /** Object.keys takes an object, like 'envConfig'. It gets all of the keys and it returns
   * them as an array.
   */
}
