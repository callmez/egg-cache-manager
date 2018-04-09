'use strict'

const cacheManager = require('cache-manager')
const util = require('util')

function create (config = {}, app) {
  config = {
    store: 'memory',
    options: {},
    ...config
  }
  const cache = cacheManager.caching(config)

  if (!config.options.noPromises) { // replace
    Object.getOwnPropertyNames(cache).forEach(function(name){
      if (['set', 'get', 'del', 'reset', 'keys', 'mset', 'mget'].indexOf(name) >= 0) {
        cache[name] = util.promisify(cache[name]);
      }
    });
  }

  return cache
}

module.exports = app => {
  app.addSingleton('cache', create)
}