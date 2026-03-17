# Async Operations in Slack → Zoom Migrations

When migrating Slack apps to Zoom, several operations require **asynchronous lookups** because Zoom's API doesn't provide direct equivalents to Slack's query capabilities.

## Critical Concept: Message ID Tracking

**The Problem:**
- **Slack** uses `timestamp` (ts) as message identifier - you can look up messages by timestamp
- **Zoom** uses `message_id` (UUID) - there's NO API to retrieve a message ID after sending

**The Solution:**
You MUST track message IDs in your own database when messages are sent.

---

## Required Async Operations

### 1. Message Update/Delete (CRITICAL)

**Slack APIs affected:**
- `chat.update` - Edit a message
- `chat.delete` - Delete a message
- `reactions.add` - Add emoji reaction (requires XMPP message ID)

**Problem:**
```javascript
// Slack: Can update by timestamp directly
slack.chat.update({
  channel: "C1234",
  ts: "1234567890.123456",  // Slack timestamp
  text: "Updated message"
});
```

**Zoom requires:**
```javascript
// Zoom: Must have message_id from send response
const messageId = await lookupMessageId(channelId, slackTimestamp);
zoom.chat.update({
  message_id: messageId,  // UUID, not timestamp!
  to_jid: channelJid,
  // ... other params
});
```

**Implementation Pattern:**

```typescript
// 1. Create MessageIdProvider class
class MessageIdProvider {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Store when sending messages
  async storeMessageId(params: {
    channelId: string;
    slackTimestamp: string;
    zoomMessageId: string;
    teamId: string;
  }): Promise<void> {
    await this.db.run(
      `INSERT INTO message_ids (channel_id, slack_ts, zoom_message_id, team_id, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [params.channelId, params.slackTimestamp, params.zoomMessageId, params.teamId, Date.now()]
    );
  }

  // Retrieve when updating/deleting
  async getMessageId(channelId: string, slackTimestamp: string): Promise<string | null> {
    const row = await this.db.get(
      `SELECT zoom_message_id FROM message_ids
       WHERE channel_id = ? AND slack_ts = ?`,
      [channelId, slackTimestamp]
    );
    return row?.zoom_message_id || null;
  }

  // Clean up old mappings (optional, for storage management)
  async cleanupOldMappings(olderThanDays: number = 30): Promise<void> {
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    await this.db.run(
      `DELETE FROM message_ids WHERE created_at < ?`,
      [cutoff]
    );
  }
}
```

**Database Schema:**

```sql
CREATE TABLE IF NOT EXISTS message_ids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id TEXT NOT NULL,
  slack_ts TEXT NOT NULL,
  zoom_message_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(channel_id, slack_ts)
);

CREATE INDEX idx_message_lookup ON message_ids(channel_id, slack_ts);
CREATE INDEX idx_cleanup ON message_ids(created_at);
```

**Usage Example:**

```typescript
// When sending a message
async function sendMessage(channelId: string, text: string): Promise<string> {
  const response = await zoom.chat.send({
    to_jid: channelId,
    robot_jid: config.botJid,
    account_id: config.accountId,
    user_jid: userJid,
    is_markdown_support: true,
    content: {
      head: { text: "Message" },
      body: [{ type: "message", text }]
    }
  });

  const zoomMessageId = response.data.message_id;
  const slackTimestamp = generateSlackTimestamp(); // Your timestamp format

  // CRITICAL: Store the mapping
  await messageIdProvider.storeMessageId({
    channelId,
    slackTimestamp,
    zoomMessageId,
    teamId: config.teamId
  });

  return slackTimestamp; // Return Slack-compatible timestamp
}

// When updating a message
async function updateMessage(channelId: string, slackTimestamp: string, newText: string): Promise<void> {
  // REQUIRED: Lookup the Zoom message ID
  const zoomMessageId = await messageIdProvider.getMessageId(channelId, slackTimestamp);

  if (!zoomMessageId) {
    throw new Error(`Message ID not found for timestamp: ${slackTimestamp}`);
  }

  await zoom.chat.update({
    message_id: zoomMessageId,
    to_jid: channelId,
    robot_jid: config.botJid,
    account_id: config.accountId,
    user_jid: userJid,
    is_markdown_support: true,
    content: {
      head: { text: "Updated" },
      body: [{ type: "message", text: newText }]
    }
  });
}
```

---

### 2. Channel Type Resolution (MEDIUM PRIORITY)

**Problem:**
Zoom webhook events don't always include channel type (public/private/DM).

**When needed:**
- Determining if a message is a DM vs channel message
- Displaying channel type in UI
- Permission checks

**Implementation:**

```typescript
class ChannelTypeCache {
  private cache: Map<string, 'public' | 'private' | 'dm'> = new Map();
  private ttl = 3600000; // 1 hour
  private timestamps: Map<string, number> = new Map();

  async getChannelType(channelJid: string): Promise<'public' | 'private' | 'dm'> {
    // Check cache
    if (this.cache.has(channelJid)) {
      const timestamp = this.timestamps.get(channelJid)!;
      if (Date.now() - timestamp < this.ttl) {
        return this.cache.get(channelJid)!;
      }
    }

    // Detect from JID format (fast path)
    if (channelJid.includes('@conference.zoom.us')) {
      const type = 'public'; // or 'private', depends on API response
      this.cache.set(channelJid, type);
      this.timestamps.set(channelJid, Date.now());
      return type;
    }

    if (channelJid.includes('@xmpp.zoom.us')) {
      const type = 'dm';
      this.cache.set(channelJid, type);
      this.timestamps.set(channelJid, Date.now());
      return type;
    }

    // Fallback: API call (slow path)
    const channelInfo = await zoom.channels.info({ channel_id: channelJid });
    const type = channelInfo.type === 1 ? 'public' : 'private';

    this.cache.set(channelJid, type);
    this.timestamps.set(channelJid, Date.now());

    return type;
  }
}
```

---

### 3. User Info Lookups (LOW PRIORITY)

**When needed:**
- Displaying user profiles
- Permission checks
- @mention resolution

**Note:** Zoom's webhook events include `user_jid` and basic user info, so explicit lookups are rarely needed.

**Pattern (if needed):**

```typescript
class UserInfoCache {
  private cache: Map<string, ZoomUser> = new Map();

  async getUserInfo(userJid: string): Promise<ZoomUser> {
    if (this.cache.has(userJid)) {
      return this.cache.get(userJid)!;
    }

    const user = await zoom.users.info({ user_id: userJid });
    this.cache.set(userJid, user);
    return user;
  }
}
```

---

## Common Pitfalls

### ❌ Pitfall 1: Not Tracking Message IDs

```typescript
// BAD: Assuming you can look up message IDs later
async function sendMessage(text: string) {
  const response = await zoom.chat.send({ text });
  // Message ID lost! Can't update/delete later
  return response.data.message_id;
}
```

```typescript
// GOOD: Always store message IDs
async function sendMessage(text: string, channelId: string) {
  const response = await zoom.chat.send({ text });
  const messageId = response.data.message_id;

  // Store immediately
  await messageIdProvider.storeMessageId({
    channelId,
    slackTimestamp: generateTimestamp(),
    zoomMessageId: messageId,
    teamId: config.teamId
  });

  return messageId;
}
```

### ❌ Pitfall 2: Using Timestamps as Zoom Message IDs

```typescript
// BAD: Zoom doesn't accept timestamps
await zoom.chat.update({
  message_id: "1234567890.123456",  // This is a Slack timestamp!
  text: "Updated"
});
// ERROR: Invalid message_id format
```

```typescript
// GOOD: Look up the Zoom UUID
const zoomMessageId = await messageIdProvider.getMessageId(channelId, slackTimestamp);
await zoom.chat.update({
  message_id: zoomMessageId,  // UUID format
  text: "Updated"
});
```

### ❌ Pitfall 3: No Error Handling for Missing IDs

```typescript
// BAD: Crashes if message ID not found
const messageId = await messageIdProvider.getMessageId(channelId, timestamp);
await zoom.chat.update({ message_id: messageId, ... });
// ERROR: message_id is null!
```

```typescript
// GOOD: Handle missing IDs gracefully
const messageId = await messageIdProvider.getMessageId(channelId, timestamp);

if (!messageId) {
  console.error(`Message ID not found for ${channelId}:${timestamp}`);
  throw new Error('Cannot update message: ID not found. Message may be too old or was sent before ID tracking was implemented.');
}

await zoom.chat.update({ message_id: messageId, ... });
```

---

## Performance Considerations

### Database Choice

**SQLite (Recommended for single-server):**
- Fast local lookups (< 1ms)
- No network latency
- Simple schema
- Automatic cleanup with `cleanupOldMappings()`

**Redis (Recommended for multi-server):**
- Shared cache across servers
- Fast lookups (< 5ms)
- Built-in TTL for automatic cleanup
- Scales horizontally

**PostgreSQL/MySQL (For enterprise):**
- Reliable persistence
- Complex queries supported
- Backup/replication built-in
- Slightly slower (5-10ms)

### Caching Strategy

```typescript
// Two-tier caching: Memory + Database
class OptimizedMessageIdProvider {
  private memoryCache: Map<string, string> = new Map();
  private maxMemoryEntries = 1000;
  private db: Database;

  async getMessageId(channelId: string, timestamp: string): Promise<string | null> {
    const key = `${channelId}:${timestamp}`;

    // Tier 1: Memory cache (< 1ms)
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }

    // Tier 2: Database (< 10ms)
    const messageId = await this.db.get(
      `SELECT zoom_message_id FROM message_ids WHERE channel_id = ? AND slack_ts = ?`,
      [channelId, timestamp]
    );

    if (messageId) {
      // Store in memory cache for next time
      this.addToMemoryCache(key, messageId.zoom_message_id);
      return messageId.zoom_message_id;
    }

    return null;
  }

  private addToMemoryCache(key: string, value: string): void {
    // Limit memory cache size
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    this.memoryCache.set(key, value);
  }
}
```

---

## Testing Async Operations

```typescript
describe('MessageIdProvider', () => {
  it('should store and retrieve message IDs', async () => {
    await provider.storeMessageId({
      channelId: 'C123',
      slackTimestamp: '1234567890.123456',
      zoomMessageId: 'uuid-123',
      teamId: 'T123'
    });

    const retrieved = await provider.getMessageId('C123', '1234567890.123456');
    expect(retrieved).toBe('uuid-123');
  });

  it('should return null for unknown message IDs', async () => {
    const retrieved = await provider.getMessageId('C999', '9999999999.999999');
    expect(retrieved).toBeNull();
  });

  it('should handle concurrent lookups', async () => {
    const promises = Array.from({ length: 100 }, (_, i) =>
      provider.getMessageId('C123', `${i}.000000`)
    );

    const results = await Promise.all(promises);
    expect(results).toHaveLength(100);
  });
});
```

---

## Summary

**Always implement async lookups for:**
- ✅ Message ID tracking (CRITICAL - required for update/delete)
- ✅ Channel type resolution (MEDIUM - improves UX)
- ⚠️ User info lookups (LOW - usually not needed)

**Never assume:**
- ❌ You can look up message IDs from Zoom API later
- ❌ Timestamps work as message identifiers in Zoom
- ❌ Channel type is always included in webhook events

**Performance tips:**
- Use two-tier caching (memory + database)
- Implement cleanup for old mappings
- Choose database based on deployment model (SQLite, Redis, PostgreSQL)
- Test concurrent access patterns
