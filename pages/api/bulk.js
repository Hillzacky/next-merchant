import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { API_KEY, CONNECTION_STRING } = process.env;

  try {
    const response = await fetch(CONNECTION_STRING, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const message = `HTTP error ${response.status} - ${await response.text()}`;
      throw new Error(message);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching bulk data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
