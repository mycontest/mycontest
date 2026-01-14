const { createClient } = require("redis");

let redis = null;

async function fnConnectRedis() {
  if (!redis) {
    redis = createClient({
      url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    await redis.connect();
    console.log("Redis connected successfully");
  }
  return redis;
}

async function fnGetRedisClient() {
  if (!redis) {
    await fnConnectRedis();
  }
  return redis;
}

async function fnQueuePush(queue_name, data) {
  const client = await fnGetRedisClient();
  await client.rPush(queue_name, JSON.stringify(data));
}

async function fnQueuePop(queue_name) {
  const client = await fnGetRedisClient();
  const data = await client.lPop(queue_name);
  return data ? JSON.parse(data) : null;
}

async function fnQueueLength(queue_name) {
  const client = await fnGetRedisClient();
  return await client.lLen(queue_name);
}

module.exports = {
  fnConnectRedis,
  fnGetRedisClient,
  fnQueuePush,
  fnQueuePop,
  fnQueueLength,
};
