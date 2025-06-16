import { up } from '../src/db.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await up();
    res.status(200).json({ status: 'success', message: 'Database initialized' });
  } catch (error) {
    console.error('Error in init-db handler:', error);
    res.status(500).json({ error: error.message });
  }
} 