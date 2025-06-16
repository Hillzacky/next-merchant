export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const routes = {
    "Available Routes": {
      "/api/init-db": {
        "description": "Initialize database",
        "methods": ["GET", "POST", "OPTIONS"]
      },
      "/api/bulk": {
        "description": "Process bulk data",
        "methods": ["GET", "POST", "OPTIONS"],
        "query_params": {
          "find": "required",
          "mylonglat": "optional (default: '@-6.9351394,106.9323303,13z')"
        }
      },
      "/api/single": {
        "description": "Process single data",
        "methods": ["GET", "POST", "OPTIONS"],
        "query_params": {
          "find": "required",
          "mylonglat": "required"
        }
      }
    },
    "Response Format": {
      "success": {
        "status": "success",
        "message": "Operation message"
      },
      "error": {
        "error": "Error message"
      }
    }
  };

  res.status(200).json(routes);
} 