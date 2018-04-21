'use strict'

module.exports = agent => {
  if (agent.config.cache.agent) require('./lib/cache')(agent);
}
