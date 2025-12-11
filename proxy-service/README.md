# Telenity Consent Proxy

A simple CORS proxy service for Telenity consent API calls.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
TELENITY_CONSENT_TOKEN=your_consent_token_here
PORT=3001
```

3. Start the service:
```bash
npm start
```

## API Endpoint

### GET /consent?msisdn={msisdn}

Proxies requests to Telenity consent API.

**Parameters:**
- `msisdn`: Mobile number (10 digits, will be prefixed with +91)

**Example:**
```
GET /consent?msisdn=9670006261
```

**Response:**
```json
{
  "Consent": {
    "status": "ALLOWED"
  }
}
```

## Deployment

This service can be deployed to:
- Vercel
- Heroku
- Railway
- Any Node.js hosting platform

## Usage in Frontend

Update your consent service to use the proxy URL:

```javascript
const proxyUrl = 'https://your-proxy-domain.com/consent?msisdn=9670006261';
const response = await fetch(proxyUrl);
```
