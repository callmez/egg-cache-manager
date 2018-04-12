

## Usage Examples

```javascript

// [Project]/config/plugin.js
exports.cache = {
  enable: true,
  package: 'egg-cache-manager',
};

// @see [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager)
// [Project]/config/config.default.js  // Optional!

module.exports = appInfo => {
  const config = exports = {};

  ...
  
  config.cache = {
    client: {
      store: 'memory', // default store
      options: { 
        ... 
      }
    }
  }

  ...
  
  return config;
};


// [Project]/app/controller/home.js  // example
// all methods are promisified
await app.cache.set('a', 2)
let a = await app.cache.get('a')
```