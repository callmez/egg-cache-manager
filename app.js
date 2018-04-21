'use strict'

module.exports = app => {
  if (app.config.cache.app) require('./lib/cache')(app);
}
