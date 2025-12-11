const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Consent proxy endpoint
app.get('/consent', async (req, res) => {
  try {
    const { msisdn } = req.query;

    if (!msisdn) {
      return res.status(400).json({ error: 'Missing msisdn parameter' });
    }

    // Get token from environment (you can modify this to fetch from database)
    const token = process.env.TELENITY_CONSENT_TOKEN;

    if (!token) {
      return res.status(500).json({ error: 'Consent token not configured' });
    }

    const telenityUrl = `https://india-agw.telenity.com/apigw/NOFBconsent/v1/NOFBconsent?address=tel:+${msisdn}`;

    console.log(`Proxying request for MSISDN: ${msisdn}`);

    const response = await fetch(telenityUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `bearer ${token}`
      },
    });

    const responseData = await response.text();

    // Forward the status and response
    res.status(response.status);

    // Try to parse as JSON, otherwise return as text
    try {
      const jsonData = JSON.parse(responseData);
      res.json(jsonData);
    } catch {
      res.type('text/plain').send(responseData);
    }

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Proxy service error',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Telenity consent proxy running on port ${PORT}`);
});
