// Visit counter using Vercel KV (Redis)
// This persists across deployments

import { createClient } from 'redis';

const VISIT_KEY = 'site-visits';

// Create a Redis client (reuse connection)
let redisClient = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
  }
  return redisClient;
}

export default async function handler(req, res) {
  try {
    const redis = await getRedisClient();
    
    if (req.method === 'POST') {
      // Increment visit count
      const visits = await redis.incr(VISIT_KEY);
      res.status(200).json({ visits });
      
    } else if (req.method === 'GET') {
      // Get current visit count
      const visits = await redis.get(VISIT_KEY);
      res.status(200).json({ visits: visits ? parseInt(visits) : 0 });
      
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error with visit counter:', error);
    // Return a fallback value instead of error
    res.status(200).json({ visits: 0 });
  }
}
