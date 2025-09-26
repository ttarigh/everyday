// Simple in-memory storage for visits (in production, you'd use a database)
let visitCount = 0;

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Increment visit count
    visitCount++;
    res.status(200).json({ visits: visitCount });
  } else if (req.method === 'GET') {
    // Return current visit count
    res.status(200).json({ visits: visitCount });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
