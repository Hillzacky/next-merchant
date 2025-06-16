import { getMultipleData } from '../../src/maps.js';

let browser = null;

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
    const { find } = req.query;

    if (!find) {
      res.status(400).json({ error: 'Find parameter is required' });
      return;
    }

    // Start processing in background
    res.status(200).json({ 
      status: 'success', 
      message: 'Bulk data processing started',
      data: {
        find,
        uri: encodeURI(find)
      }
    });
    
    // Process data after sending response
    try {
      const uri = encodeURI(find);
      await getMultipleData(uri);
    } catch (error) {
      // Error hanya disimpan di response, tidak di console
      res.status(500).json({ 
        status: 'error',
        message: error.message,
        data: {
          find,
          uri: encodeURI(find)
        }
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message
    });
  }
} 