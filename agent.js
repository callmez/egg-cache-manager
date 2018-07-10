'use strict'

module.exports = agent => {
  if (agent.config.catbox.agent) require('./lib/cacheLoader')(agent);
}
