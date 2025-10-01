# @schedura/api-sdk

Type-safe API client for the Schedura application.

## Usage

```tsx
import { createApiClient } from '@schedura/api-sdk'

const api = createApiClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Get current user
const user = await api.getMe()

// List events
const events = await api.listEvents()

// Create event
const newEvent = await api.createEvent({
  title: 'Meeting',
  start_time: '2024-01-01T10:00:00Z',
  end_time: '2024-01-01T11:00:00Z'
})
```

## API Methods

- `getMe()` - Get current authenticated user
- `listEvents()` - List all user events
- `createEvent(event)` - Create a new event
- `updateEvent(id, event)` - Update an existing event
- `deleteEvent(id)` - Delete an event
