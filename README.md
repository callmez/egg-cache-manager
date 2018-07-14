

## Usage Examples

```javascript

// [Project]/config/plugin.js
exports.cache = {
  enable: true,
  package: 'egg-cache-manager',
};

// [Project]/config/config.default.js  // Optional!

module.exports = app => {
  const config = exports = {};

  ...
  
  config.catbox = {
    client: {
      store: require('catbox-redis'), // set cache store, default is catbox-memory
      // store options
    }
  }
  
  config.cache = { // catbox policy settings
    client: {
      catbox: 'xxx', // required for multi catbox clients (key by config.catbox.clients)
      segment: 'partition', // policy segment,
      // catbox policy options
    },
  };
  

  ...
  
  return config;
};


// [Project]/app/controller/home.js  // example
// all methods are promisified
await app.cache.set('a', 2);
let a = await app.cache.get('a');
// get cache value by 
// create function (if value expire), 
// format function (return formatted cache value), 
// dependency setting (tag cache dependency)
// inspired by PHP Yii2 cache component (currently on support tag dependency)
// @see [Yii2 Cache dependencies](https://github.com/yiisoft/yii2/blob/master/docs/guide/caching-data.md#cache-dependencies-)
let b = await cache.take({ 
  key: 'key',
  create: async () => 'value',
  format: async () => parseInt(value),
  ttl: 1000,
  force: true,
  dependency: { tag: { tags: [ 'xxx' ] } },
  // dependency: async value => { tag: { tags: [ 'xxx' ] } },
);
```