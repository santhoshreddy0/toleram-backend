const { createClient } = require("redis");

class RedisClient {
  static pool = null;
  static isInitializing = false;

  static async ensureInitialized() {
    if (!RedisClient.pool && !RedisClient.isInitializing) {
      RedisClient.isInitializing = true;

      const pool = createClient({
        socket: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        },
        password: process.env.REDIS_PWD || undefined,
        username: process.env.REDIS_USERNAME || undefined,
      });

      pool.on("error", (err) => {
        console.error("Redis pool error:", err);
      });

      await pool.connect();

      const pong = await pool.ping();
      if (pong === "PONG") {
        console.log("Redis pool connection successful");
        const info = await pool.info("server");
        const version = info.match(/redis_version:(.+)/)[1].trim();
        console.log("Redis server version:", version);
      }

      RedisClient.pool = pool;
      RedisClient.isInitializing = false;
    }
  }

  static async get(key) {
    await this.ensureInitialized();
    return RedisClient.pool.get(key);
  }

  static async set(key, value) {
    await this.ensureInitialized();
    return RedisClient.pool.set(key, value);
  }

  static async delete(key) {
    await this.ensureInitialized();
    return RedisClient.pool.del(key);
  }

  static async exists(key) {
    await this.ensureInitialized();
    return RedisClient.pool.exists(key);
  }

  static async zadd(key, value, score) {
    await this.ensureInitialized();
    return RedisClient.pool.zAdd(key, [{ score, value }]);
  }

  static async zrange(key, start, end, options = {}) {
    await this.ensureInitialized();
    return RedisClient.pool.zRange(key, start, end, options);
  }

  static async zRangeWithScores(key, start, end, options = {}) {
    await this.ensureInitialized();
    return RedisClient.pool.zRange(key, start, end, { ...options, REV: true });
  }

  static async zScore(key, member) {
    await this.ensureInitialized();
    return RedisClient.pool.zScore(key, member);
  }

  static async zRevRank(key, member) {
    await this.ensureInitialized();
    return RedisClient.pool.zRevRank(key, member);
  }

  static async close() {
    if (RedisClient.pool) {
      await RedisClient.pool.quit();
      RedisClient.pool = null;
      console.log("Redis pool connection closed");
    }
  }
}

module.exports = RedisClient;
