const { createClient } = require('redis');

class RedisClient {
  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      },
      password: process.env.REDIS_PWD || undefined,
      username: process.env.REDIS_USERNAME || undefined
    });

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      const pong = await this.client.ping();
      if (pong === 'PONG') {
        console.log('Redis connection successful');
        const info = await this.client.info('server');
        const version = info.match(/redis_version:(.+)/)[1].trim();
        console.log('Redis server version:', version);
      }
    } catch (err) {
      console.error('Redis connection failed:', err);
      throw err;
    }
  }

  async get(key) {
    return await this.client.get(key);
  }

  async set(key, value) {
    return await this.client.set(key, value);
  }

  async delete(key) {
    return await this.client.del(key);
  }

  async exists(key) {
    return await this.client.exists(key);
  }

  async zadd(key, value, score) {
    return await this.client.zAdd(key, [{ score, value }]);
  }

  async zrange(key, start, end) {
    return await this.client.zRange(key, start, end);
  }

  async zRangeWithScores(key, start, end) {
    return await this.client.zRangeWithScores(key, start, end, { REV: true });
  }

  async zScore(key, member) {
    return await this.client.zScore(key, member);
  }

  async zRevRank(key, member) {
    return await this.client.zRevRank(key, member);
  }

  async close() {
    await this.client.quit();
    console.log('Redis connection closed');
  }
}

module.exports = RedisClient;
