# Subtaste API Documentation

## Overview

The Subtaste API provides external access to taste genome data and allows behavioral signal submission from integrated applications (Slayt, Tessera, etc.).

**Base URL**: `http://localhost:3020/api` (development) or `https://your-domain.com/api` (production)

## Authentication

All external API endpoints require API key authentication.

### Obtaining an API Key

1. Sign in to your Subtaste account
2. Navigate to Settings > API Keys
3. Click "Generate New API Key"
4. Provide a name (e.g., "Slayt Integration")
5. Select permissions (read, write)
6. Store the key securely - it will only be shown once

### Using API Keys

Include your API key in one of two ways:

**Authorization Header** (recommended):
```bash
Authorization: Bearer sub_live_xxxxxxxxxxxxxxxxxxxxx
```

**X-API-Key Header**:
```bash
X-API-Key: sub_live_xxxxxxxxxxxxxxxxxxxxx
```

## External Endpoints

### Get Taste Genome

Retrieve the authenticated user's taste genome data.

**Endpoint**: `GET /api/external/genome`
**Authentication**: Required (read permission)

**Example Request**:
```bash
curl -H "Authorization: Bearer sub_live_xxxxx" \
  https://your-domain.com/api/external/genome
```

**Example Response**:
```json
{
  "success": true,
  "userId": "user_abc123",
  "genome": {
    "primary": {
      "designation": "K-0",
      "name": "KETH",
      "confidence": 0.87,
      "glyph": "⬢"
    },
    "secondary": {
      "designation": "S-1",
      "name": "STRATA",
      "confidence": 0.45
    },
    "distribution": { ... },
    "axes": {
      "orderChaos": 0.72,
      "mercyRuthlessness": 0.34,
      "introvertExtrovert": 0.61,
      "faithDoubt": 0.28
    },
    "iching": {
      "present": {
        "number": 42,
        "name": "Increase",
        "chinese": "益"
      },
      "transforming": null,
      "movingLines": []
    },
    "keywords": { ... },
    "gamification": {
      "xp": 1250,
      "tier": "intermediate",
      "achievements": [],
      "streak": { ... }
    }
  },
  "metadata": {
    "signalCount": 47,
    "stagesCompleted": ["initial", "training", "axes"],
    "sigilRevealed": false
  }
}
```

---

### Submit Behavioral Signals

Submit implicit behavioral signals to refine taste classification.

**Endpoint**: `POST /api/external/signals`
**Authentication**: Required (write permission)

**Request Body**:
```json
{
  "signals": [
    {
      "type": "implicit",
      "action": "save",
      "itemId": "song_123",
      "context": "playlist_curation"
    },
    {
      "type": "implicit",
      "action": "skip",
      "itemId": "song_456",
      "context": "discovery_feed"
    }
  ]
}
```

**Signal Actions**:
- `save` - User saved/favorited content
- `skip` - User skipped content
- `share` - User shared content
- `listen` - User listened to audio
- `dwell` - User spent time viewing content
- `scroll` - User scrolled past quickly
- `replay` - User replayed content

**Example Request**:
```bash
curl -X POST \
  -H "Authorization: Bearer sub_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"signals": [{"type": "implicit", "action": "save", "itemId": "song_123"}]}' \
  https://your-domain.com/api/external/signals
```

**Example Response**:
```json
{
  "success": true,
  "signalCount": 48,
  "processed": 1
}
```

---

## API Key Management

### Generate API Key

**Endpoint**: `POST /api/v2/keys/generate`
**Authentication**: Session (logged in user)

**Request Body**:
```json
{
  "name": "Slayt Integration",
  "permissions": ["read", "write"]
}
```

**Response**:
```json
{
  "success": true,
  "apiKey": {
    "id": "key_abc123",
    "name": "Slayt Integration",
    "key": "sub_live_xxxxxxxxxxxxxxxxxxxxx",
    "permissions": ["read", "write"],
    "createdAt": "2026-02-05T12:00:00Z"
  },
  "warning": "Store this key securely. It will not be shown again."
}
```

---

### List API Keys

**Endpoint**: `GET /api/v2/keys/list`
**Authentication**: Session (logged in user)

**Response**:
```json
{
  "success": true,
  "keys": [
    {
      "id": "key_abc123",
      "name": "Slayt Integration",
      "permissions": ["read", "write"],
      "lastUsedAt": "2026-02-05T10:30:00Z",
      "createdAt": "2026-02-01T12:00:00Z",
      "expiresAt": null,
      "keyPreview": "••••••••"
    }
  ]
}
```

---

### Revoke API Key

**Endpoint**: `DELETE /api/v2/keys/[keyId]`
**Authentication**: Session (logged in user)

**Response**:
```json
{
  "success": true,
  "message": "API key revoked"
}
```

---

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message",
  "message": "Additional context (optional)"
}
```

**Common HTTP Status Codes**:
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing or invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limits are enforced. This may change in production.

---

## Integration Examples

### Slayt Integration

```typescript
// In Slayt backend
const SUBTASTE_API_KEY = process.env.SUBTASTE_API_KEY;

async function getSubtasteGenome(userId: string) {
  const response = await fetch('https://subtaste.app/api/external/genome', {
    headers: {
      'Authorization': `Bearer ${SUBTASTE_API_KEY}`
    }
  });

  return await response.json();
}

async function submitListeningSignals(tracks: Track[]) {
  const signals = tracks.map(track => ({
    type: 'implicit',
    action: track.userAction, // 'save', 'skip', 'listen'
    itemId: track.id,
    context: 'music_player'
  }));

  const response = await fetch('https://subtaste.app/api/external/signals', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUBTASTE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ signals })
  });

  return await response.json();
}
```

---

### Tessera Integration

```typescript
// In Tessera frontend
const SUBTASTE_API_KEY = localStorage.getItem('subtaste_api_key');

async function syncTasteProfile() {
  const response = await fetch('https://subtaste.app/api/external/genome', {
    headers: {
      'X-API-Key': SUBTASTE_API_KEY
    }
  });

  const data = await response.json();

  // Display subtaste genome in Tessera UI
  displayTasteGenome(data.genome);
}

async function trackContentInteraction(contentId: string, action: string) {
  await fetch('https://subtaste.app/api/external/signals', {
    method: 'POST',
    headers: {
      'X-API-Key': SUBTASTE_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      signals: [{
        type: 'implicit',
        action,
        itemId: contentId,
        context: 'tessera_gallery'
      }]
    })
  });
}
```

---

## Webhooks (Future)

Webhook support for real-time notifications when genome updates occur is planned for a future release.

---

## Support

For API support or integration questions:
- GitHub Issues: https://github.com/bomac1193/subtaste-twelve/issues
- Documentation: https://github.com/bomac1193/subtaste-twelve

---

## Changelog

### v2.0.0 (2026-02-05)
- Initial external API release
- API key authentication
- Genome retrieval endpoint
- Behavioral signals endpoint
- CORS support for cross-origin requests
