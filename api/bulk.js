import { getMultipleData } from '../src/maps.js';

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
    const { find = 'toko' } = req.query;
    await getMultipleData(find);
    res.status(200).json({ status: 'success', message: 'Data processing started' });
  } catch (error) {
    console.error('Error in bulk handler:', error);
    res.status(500).json({ error: error.message });
  }
} 