// Simple in-memory storage for visits (resets on deployment)
// In production, you'd want to use a database like Vercel KV, Supabase, or similar
let visitCount = 0;

// For production, we'll use a simple counter that resets on deployment
// This is a temporary solution - for persistence, use a database
function getVisitCount() {
  try {
    // Try to read from environment variable for initial count
    const envCount = process.env.INITIAL_VISIT_COUNT;
    if (envCount && visitCount === 0) {
      visitCount = parseInt(envCount, 10) || 0;
    }
    return visitCount;
  } catch (error) {
    console.error('Error reading visit count:', error);
    return 0;
  }
}

function setVisitCount(count) {
  try {
    visitCount = count;
    return true;
  } catch (error) {
    console.error('Error setting visit count:', error);
    return false;
  }
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Increment visit count
    const currentCount = getVisitCount();
    const newCount = currentCount + 1;
    
    if (setVisitCount(newCount)) {
      res.status(200).json({ visits: newCount });
    } else {
      res.status(500).json({ error: 'Failed to update visit count' });
    }
  } else if (req.method === 'GET') {
    // Return current visit count
    const count = getVisitCount();
    res.status(200).json({ visits: count });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
