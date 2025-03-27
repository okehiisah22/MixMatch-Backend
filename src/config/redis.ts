import Redis from 'ioredis';

// Initialize Redis client
const RedisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  // Optional: Use TLS if needed
  // tls: process.env.REDIS_TLS === 'true' ? {} : undefined
});

// Verify connection
RedisClient.on('connect', () => {
  console.log('Connected to Redis');
});

RedisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export { RedisClient }; 