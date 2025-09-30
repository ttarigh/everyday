import fs from 'fs';
import path from 'path';

const TAGGED_POSTS_FILE = path.join(process.cwd(), 'data', 'tagged-posts.json');

function ensureDataDir() {
  const dataDir = path.dirname(TAGGED_POSTS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readTaggedPosts() {
  try {
    ensureDataDir();
    if (fs.existsSync(TAGGED_POSTS_FILE)) {
      const data = fs.readFileSync(TAGGED_POSTS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return { taggedPosts: [] };
  } catch (error) {
    console.error('Error reading tagged posts:', error);
    return { taggedPosts: [] };
  }
}

function writeTaggedPosts(data) {
  try {
    ensureDataDir();
    fs.writeFileSync(TAGGED_POSTS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing tagged posts:', error);
    return false;
  }
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const data = readTaggedPosts();
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    const { taggedPost } = req.body;
    
    if (!taggedPost) {
      return res.status(400).json({ error: 'Tagged post data is required' });
    }

    const data = readTaggedPosts();
    const newTaggedPost = {
      ...taggedPost,
      id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    
    data.taggedPosts.unshift(newTaggedPost); // Add to beginning of array
    
    if (writeTaggedPosts(data)) {
      res.status(201).json({ success: true, taggedPost: newTaggedPost });
    } else {
      res.status(500).json({ error: 'Failed to save tagged post' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
