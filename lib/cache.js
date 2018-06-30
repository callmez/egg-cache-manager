'use strict'

const cacheManager = require('cache-manager')
const util = require('util')

function create (config = {}, app) {
  const cache = cacheManager.caching({
    store: 'memory',
    ...config,
  });

  if (!config.noPromises) { // replace
    Object.getOwnPropertyNames(cache).forEach(function(name) {
      if (['set', 'get', 'del', 'reset', 'keys', 'mset', 'mget'].indexOf(name) >= 0) {
        cache[name] = util.promisify(cache[name]);
      }
    });
  }

  return cache;
}

module.exports = app => {
  app.addSingleton('cache', create);
};
