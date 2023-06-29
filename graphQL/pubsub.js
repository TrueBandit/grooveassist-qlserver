import 'dotenv/config'
import { RedisPubSub } from 'graphql-redis-subscriptions';

const pubsub = new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    retry_strategy: options => {
      return Math.max(options.attempt * 100, 3000);
    }
  }
});

export default pubsub;





