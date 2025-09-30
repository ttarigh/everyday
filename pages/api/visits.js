import fs from 'fs';
import path from 'path';

// File-based storage for visits that persists across deployments
const VISITS_FILE = path.join(process.cwd(), 'data', 'visits.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(VISITS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read visit count from file
function getVisitCount() {
  try {
    ensureDataDir();
    if (fs.existsSync(VISITS_FILE)) {
      const data = fs.readFileSync(VISITS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.visits || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error reading visit count:', error);
    return 0;
  }
}

// Write visit count to file
function setVisitCount(count) {
  try {
    ensureDataDir();
    const data = { visits: count, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(VISITS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing visit count:', error);
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
