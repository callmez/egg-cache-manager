'use strict'

const Catbox = require('catbox');
const Singleton = require('egg/lib/core/singleton');
require('./cacheExtend');

const { Client, Policy } = Catbox;

module.exports = app => {
  app.Catbox = Catbox;

  // init catbox client
  {
    const config = app.config.catbox;
    if (!config.client && !config.clients) config.client = { };
    app.addSingleton('catbox', createCatbox);
  }

  // init catbox policy
  {
    const config = app.config.cache;
    if (!config.client && !config.clients) config.client = { };
    app.addSingleton('cache', createCache);
  }
};

// set memory as default store
function createCatbox ({ store = require('catbox-memory'), ...options }, app) {
  const client = new Client(store, options);

  app.beforeStart(async () => { await client.start(); });
  app.beforeClose(() => { client.stop(); });

  return client;
}

// set default segment to common
async function createCache({ catbox, dependencies,  segment = 'common', ...options }, app) {
  const isSingleton = app.catbox instanceof Singleton;
  let client;
  if (catbox) { // 指定client
    if (isSingleton) {
      client = app.catbox.get(catbox);
    } else {
      throw new Error(`the catbox is not multi clients, can not init cache with catbox ${catbox}`);
    }
  } else { // 不指定client
    if (isSingleton) {
      throw new Error(`the catbox is multi clients, can not init cache without catbox client name`);
    } else {
      client = app.catbox;
    }
  }
  const policy = new Policy(options, client, segment);
  dependencies && policy.setDependencies(dependencies);
  return policy;
}
