// Visit counter using free external service (countapi.xyz)
// This persists across deployments

const NAMESPACE = 'everyday-tina-zone';
const KEY = 'site-visits';
const COUNTAPI_URL = `https://api.countapi.xyz`;

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      // Increment visit count
      const response = await fetch(`${COUNTAPI_URL}/hit/${NAMESPACE}/${KEY}`);
      
      if (!response.ok) {
        throw new Error('Failed to increment counter');
      }
      
      const data = await response.json();
      res.status(200).json({ visits: data.value });
      
    } else if (req.method === 'GET') {
      // Get current visit count
      const response = await fetch(`${COUNTAPI_URL}/get/${NAMESPACE}/${KEY}`);
      
      if (!response.ok) {
        throw new Error('Failed to get counter');
      }
      
      const data = await response.json();
      res.status(200).json({ visits: data.value });
      
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
