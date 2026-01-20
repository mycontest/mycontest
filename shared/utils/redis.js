const { createClient } = require("redis");

const redis = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@localhost:6379`,
});

redis.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await redis.connect();
})();

module.exports = redis;
