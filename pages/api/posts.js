import fs from 'fs';
import path from 'path';

const postsFilePath = path.join(process.cwd(), 'data', 'posts.json');

function readPosts() {
  try {
    const fileContents = fs.readFileSync(postsFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading posts:', error);
    return { posts: [] };
  }
}

function writePosts(data) {
  try {
    fs.writeFileSync(postsFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing posts:', error);
    return false;
  }
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const data = readPosts();
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    const { post } = req.body;
    
    if (!post) {
      return res.status(400).json({ error: 'Post data is required' });
    }

    const data = readPosts();
    const newPost = {
      ...post,
      id: Math.max(...data.posts.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    
    data.posts.unshift(newPost); // Add to beginning of array
    
    if (writePosts(data)) {
      res.status(201).json({ success: true, post: newPost });
    } else {
      res.status(500).json({ error: 'Failed to save post' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
