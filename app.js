'use strict'

module.exports = app => {
  if (app.config.catbox.app) require('./lib/cacheLoader')(app);
}
