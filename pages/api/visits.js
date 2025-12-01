// Visit counter using Vercel KV
// This persists across deployments

import { createClient } from '@vercel/kv';

const VISIT_KEY = 'site-visits';

// Create KV client with custom environment variable prefix
const kv = createClient({
  url: process.env.everyday_tina_zone_REDIS_URL,
  token: process.env.everyday_tina_zone_REDIS_TOKEN,
});

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      // Increment visit count
      const visits = await kv.incr(VISIT_KEY);
      res.status(200).json({ visits });
      
    } else if (req.method === 'GET') {
      // Get current visit count
      const visits = await kv.get(VISIT_KEY);
      res.status(200).json({ visits: visits || 0 });
      
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
