'use strict';

const _ = require('lodash');

let reusableData = {};
class Dependency {
  constructor(config) {
    if (!_.isPlainObject(config)) throw new Error('The parameter config is not plain object.');
    config = {
      data: undefined,
      reusable: false,
      ...config,
    };
    for (const property in config) this[property] = config[property];
  }

  async evaluateDependency(cache) {
    if (this.reusable) {
      const hash = this.generateReusableHash();
      if (!reusableData.hasOwnProperty(hash)) {
        reusableData[hash] = await this.generateDependencyData(cache);
      }
      this.data = reusableData[hash];
    } else {
      this.data = await this.generateDependencyData(cache);
    }
  }

  async isChanged(cache) {
    let data;
    if (this.reusable) {
      const hash = this.generateReusableHash();
      if (!reusableData.hasOwnProperty(hash)) {
        reusableData[hash] = await this.generateDependencyData(cache);
      }
      data = reusableData[hash];
    } else {
      data = await this.generateDependencyData(cache);
    }
    return !_.isEqual(data, this.data);
  }

  static resetReusableData() {
    reusableData = {};
  }

  generateReusableHash() {
    const data = this.data;
    this.data = null;
    const key = JSON.stringify(this);
    this.data = data;
    return key;
  }

  async generateDependencyData(cache) {
    throw new Error('The generateDependencyData method is not overwrite.');
  }
}

module.exports = Dependency;
