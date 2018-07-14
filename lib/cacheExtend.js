'use strict';

const _ = require('lodash');
const { Policy } = require('catbox');
const Dependency = require('./depenency/Dependency');

const DEPENDENCIES = Symbol('Policy#Dependencies');

Policy.prototype[DEPENDENCIES] = {
  tag: require('./depenency/TagDependency'),
};

Policy.prototype.setDependencies = function(dependencies) {
  for (const type in dependencies) {
    const TypeDependency = dependencies[type];
    if (!TypeDependency.prototype.super !== Dependency.prototype) {
      throw new Error(`The dependency ${type} must be subclass of Dependency`);
    }
    this[DEPENDENCIES][type] = TypeDependency;
  }
};

Policy.prototype.getDependency = function(type) {
  if (!this[DEPENDENCIES].hasOwnProperty(type)) {
    throw new Error(`The type "${type}" of cache dependency is not valid.`);
  }
  return this[DEPENDENCIES][type];
};

/**
 * ```js
 *  cache.take({
 *    key: 'key',
 *    create: async () => 'value',
 *    format: async () => parseInt(value),
 *    ttl: 1000,
 *    force: true,
 *    dependency: { tag: { tags: [ 'xxx' ] } },
 *    // dependency: async value => { tag: { tags: [ 'xxx' ] } },
 *  );
 * ```
 * @param {string|object}key - cache key
 * @param {function} create - create data if cache is expired
 * @param {function} format - return format data from cache or created
 * @param {number} ttl - cache expire default 1 minute
 * @param {boolean} force - force get from create
 * @param {object|function} dependency - cache dependency
 * @return {Promise<*>}
 */
Policy.prototype.take = async function({ key, create, format, ttl, force, dependency } = {}) {
  let value = force === true ? null : await this.get(key);
  value = await this._resolveDependency(value);
  if (value === null && create) {
    value = await create();
    const cacheValue = dependency ? await this._evaluateDependency(value, dependency) : value;
    await this.set(key, cacheValue, ttl);
  } else {
    return value;
  }
  if (format) value = await format(value);
  return value;
};

Policy.prototype._resolveDependency = async function(value) {
  if (_.isPlainObject(value) && value.hasOwnProperty('cacheDependency')) {
    for (const type in value.cacheDependency) {
      const properties = JSON.parse(value.cacheDependency[type]); // unserialize instance properties
      const dependency = this._getDependencyInstance(type, properties);
      return await dependency.isChanged(this) ? null : value.value; // return mean only support one dependency by type
    }
  }
  return value;
};

Policy.prototype._evaluateDependency = async function(value, config) {
  if (typeof config === 'function') config = await config(value); // dynamic dependency
  if (!_.isPlainObject(config)) throw new Error('Dependency config must be plain object');
  for (const type in config) {
    const dependency = this._getDependencyInstance(type, config[type]);
    await dependency.evaluateDependency(this);
    const properties = JSON.stringify(dependency); // cache and serialize instance properties
    return { value, cacheDependency: { [type]: properties } }; // return mean only support one dependency by type
  }
  throw new Error('Dependency config is invalid.');
};

Policy.prototype._getDependencyInstance = function(type, properties) {
  const Dependency = this.getDependency(type);
  return new Dependency(properties);
};
