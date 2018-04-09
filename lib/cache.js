'use strict'

const cacheManager = require('cache-manager')

function create (config = {}, app) {
  if (!config.hasOwnProperty('store')) {
    config.store = 'memory'
  }
  return cacheManager.caching(config)
}

module.exports = app => {
  app.addSingleton('cache', create)
}