'use strict';

const _ = require('lodash');
const Dependency = require('./Dependency');

class TagDependency extends Dependency {

  constructor(config) {
    super(config);
    if (!this.tags) throw new Error('The tags property of class TagDependency mus be set.');
    if (!Array.isArray(this.tags)) this.tags = [ this.tags ];
  }

  async generateDependencyData(cache) {
    let timestamps = await this.getTimestamps(cache, this.tags);
    const newKeys = [];
    for (const key in timestamps) {
      const timestamp = timestamps[key];
      if (timestamp === null) newKeys.push(key);
    }

    if (newKeys.length) {
      timestamps = Object.assign(timestamps, await TagDependency._touchKeys(cache, newKeys));
    }
    return timestamps;
  }

  async isChanged(cache) {
    const timestamps = await this.getTimestamps(cache, this.tags);
    return !_.isEqual(timestamps, this.data);
  }

  static async invalidate(cache, tags) {
    const keys = [];
    if (!Array.isArray(tags)) tags = [ tags ];
    for (const tag of tags) {
      keys.push(TagDependency._buildKey(tag));
    }
    await TagDependency._touchKeys(cache, keys);
  }

  static async _touchKeys(cache, keys) {
    const items = {};
    for (const key of keys) {
      const timestamp = new Date().valueOf();
      await cache.set(key, timestamp, 31536000000); // expire after one year
      items[key] = timestamp;
    }
    return items;
  }

  async getTimestamps(cache, tags) {
    if (!tags.length) return [];
    const timestamps = {};
    for (const tag of tags) {
      const key = TagDependency._buildKey(tag);
      timestamps[key] = await cache.get(key);
    }
    return timestamps;
  }

  static _buildKey(key) {
    return `TagDependency:${key}`;
  }
}

module.exports = TagDependency;
