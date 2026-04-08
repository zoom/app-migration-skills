# Omitted Fields Reference

When migrating from Slack to Zoom, many fields are **not available** in Zoom's API. This reference documents all omitted fields to prevent confusion and help set correct expectations.

---

## User Object

### Fields Available in Zoom (12 fields)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | User JID (e.g., user@xmpp.zoom.us) |
| `jid` | string | Same as id |
| `email` | string | User email address |
| `first_name` | string | User first name |
| `last_name` | string | User last name |
| `name` | string | Display name (first + last) |
| `display_name` | string | User's custom display name |
| `account_id` | string | Zoom account identifier |
| `role` | string | User role in account |
| `status` | string | Presence status (available, away, dnd, offline) |
| `profile_pic_url` | string | Avatar image URL |
| `timezone` | string | User timezone |

### Fields Omitted in Zoom (19 fields)

| Slack Field | Type | Why Omitted | Workaround |
|-------------|------|-------------|------------|
| `deleted` | boolean | User deletion not tracked | Check API error codes |
| `color` | string | UI customization not supported | Use default colors |
| `real_name` | string | Redundant with name | Use `name` or `display_name` |
| `tz` | string | Available as `timezone` | Use `timezone` field |
| `tz_label` | string | Not provided | Format `timezone` yourself |
| `tz_offset` | number | Not provided | Calculate from `timezone` |
| `is_admin` | boolean | Role system different | Check `role` field |
| `is_owner` | boolean | No owner concept | Check account permissions |
| `is_primary_owner` | boolean | No owner concept | N/A |
| `is_restricted` | boolean | No restriction concept | N/A |
| `is_ultra_restricted` | boolean | Guest users not supported | N/A |
| `is_bot` | boolean | Bot detection different | Check JID format |
| `is_app_user` | boolean | No distinction | N/A |
| `updated` | timestamp | Not tracked | N/A |
| `is_email_confirmed` | boolean | Not exposed | Assume true |
| `who_can_share_contact_card` | string | Privacy settings not exposed | N/A |
| `locale` | string | Not available | Use `timezone` as proxy |
| `presence` | string | Available as `status` | Use `status` field |
| `enterprise_user` | object | Enterprise features different | Check account type |

**Impact on Migration:**
- ✅ Basic user info (name, email, avatar) works fine
- ⚠️ Admin/ownership checks need rewriting
- ❌ Guest user detection not possible
- ❌ Timezone offset requires manual calculation

---

## Channel Object

### Fields Available in Zoom (7 fields)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Channel JID |
| `jid` | string | Same as id |
| `name` | string | Channel name |
| `type` | number | Channel type (1=public, 2=private, 3=DM, 4=group) |
| `channel_settings` | object | Channel configuration |
| `members_count` | number | Number of members (may require separate API call) |
| `account_id` | string | Zoom account identifier |

### Fields Omitted in Zoom (21 fields)

| Slack Field | Type | Why Omitted | Workaround |
|-------------|------|-------------|------------|
| `created` | timestamp | Creation time not exposed | N/A |
| `creator` | string | Creator info not tracked | N/A |
| `is_archived` | boolean | Archiving works differently | Check channel accessibility |
| `is_general` | boolean | No "general" channel concept | Hardcode your main channel ID |
| `name_normalized` | string | Not provided | Normalize `name` yourself |
| `is_shared` | boolean | Shared channels not supported | N/A |
| `is_org_shared` | boolean | Org features different | N/A |
| `is_member` | boolean | Membership different | Check member list |
| `is_private` | boolean | Use `type` field instead | Check type === 2 |
| `is_mpim` | boolean | Use `type` field instead | Check type === 4 |
| `members` | array | Not in main object | Call `/channels/{id}/members` |
| `topic` | object | Channels don't have topics | Store separately if needed |
| `purpose` | object | Channels don't have purpose | Store separately if needed |
| `previous_names` | array | Name history not tracked | N/A |
| `num_members` | number | Available as `members_count` | Use `members_count` |
| `locale` | string | Not available | N/A |
| `is_pending_ext_shared` | boolean | Sharing not supported | N/A |
| `pending_shared` | array | Sharing not supported | N/A |
| `parent_conversation` | string | Thread model different | N/A |
| `shared_team_ids` | array | Sharing not supported | N/A |
| `is_ext_shared` | boolean | Sharing not supported | N/A |

**Impact on Migration:**
- ✅ Basic channel info (name, type) works fine
- ⚠️ Topic/purpose must be stored separately
- ❌ Channel creation date not available
- ❌ Shared channels not supported
- ❌ Thread/parent conversation not applicable

---

## Message Object

### Fields Available in Zoom (10 fields)

| Field | Type | Description |
|-------|------|-------------|
| `message_id` | string | Zoom message UUID |
| `to_jid` | string | Recipient channel/user JID |
| `sender` | string | Sender user JID |
| `timestamp` | number | Unix timestamp (seconds) |
| `date_time` | string | ISO 8601 timestamp |
| `message` | string | Message text content |
| `type` | string | Message type |
| `robot_jid` | string | Bot JID (for bot messages) |
| `account_id` | string | Account identifier |
| `user_jid` | string | User JID |

### Fields Omitted in Zoom (14 fields)

| Slack Field | Type | Why Omitted | Workaround |
|-------------|------|-------------|------------|
| `thread_ts` | string | Threading not supported | Store threads separately |
| `reply_count` | number | Threading not supported | Count manually if storing threads |
| `reply_users_count` | number | Threading not supported | N/A |
| `latest_reply` | string | Threading not supported | N/A |
| `reply_users` | array | Threading not supported | N/A |
| `subscribed` | boolean | Thread subscriptions not supported | N/A |
| `last_read` | string | Read receipts not supported | Track client-side |
| `unread_count` | number | Read receipts not supported | Track client-side |
| `reactions` | array | Reactions not supported | Store separately if needed |
| `attachments` | array | Attachment format different | Use Zoom file upload API |
| `blocks` | array | Block Kit partially supported | Convert to markdown (70% success) |
| `metadata` | object | Not supported | Store in external database |
| `edited` | object | Edit history not exposed | Track edit timestamps separately |
| `is_starred` | boolean | Starring not supported | Store in external database |

**Impact on Migration:**
- ✅ Basic messaging works fine
- ⚠️ Block Kit requires conversion to markdown
- ❌ Threading not supported (major limitation)
- ❌ Reactions not supported
- ❌ Metadata must be stored externally

---

## Attachment Object

### Fields Available in Zoom (3 fields)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | File identifier |
| `name` | string | File name |
| `download_url` | string | Download URL |

### Fields Omitted in Zoom (12 fields)

| Slack Field | Type | Why Omitted | Workaround |
|-------------|------|-------------|------------|
| `user` | string | Uploader not tracked | Store separately |
| `created` | timestamp | Upload time not exposed | N/A |
| `timestamp` | number | Same as created | N/A |
| `filetype` | string | Not categorized | Detect from file extension |
| `mimetype` | string | Not provided | Detect from file extension |
| `size` | number | File size not in attachment object | Call file info API |
| `mode` | string | Permissions not supported | N/A |
| `is_external` | boolean | External files not supported | N/A |
| `external_type` | string | External files not supported | N/A |
| `is_public` | boolean | All files private within team | N/A |
| `public_url_shared` | boolean | Public sharing not supported | N/A |
| `permalink` | string | Permalinks work differently | Use `download_url` |

**Impact on Migration:**
- ✅ File upload/download works
- ⚠️ File type detection manual
- ❌ Uploader info not available
- ❌ File metadata minimal

---

## Block Kit Blocks (Partially Supported)

### Supported Block Types

| Block Type | Zoom Support | Notes |
|------------|--------------|-------|
| `section` | ✅ Full | Markdown text supported |
| `divider` | ⚠️ Partial | Use `---` in markdown |

### Omitted Block Types (10+ types)

| Block Type | Why Omitted | Workaround |
|------------|-------------|------------|
| `header` | Not supported | Use bold text: `**Header**` |
| `context` | Not supported | Use italic: `_context_` |
| `image` | Not supported | Inline images not supported |
| `actions` | ⚠️ Different | Use Zoom's button system |
| `input` | Not supported | No form inputs in messages |
| `file` | Not supported | Attach files separately |
| `rich_text` | Not supported | Use markdown |
| `video` | Not supported | Share video links |
| `call` | Not supported | N/A |

**Impact on Migration:**
- ✅ Basic markdown formatting works
- ⚠️ Buttons work but different syntax
- ❌ Rich UI components not available
- ❌ Forms/inputs not supported

---

## UserGroup Object

### Fields Available in Zoom (5 fields)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Group identifier |
| `name` | string | Group name |
| `description` | string | Group description |
| `user_count` | number | Number of members |
| `users` | array | Array of user JIDs |

### Fields Omitted in Zoom (11 fields)

| Slack Field | Type | Why Omitted | Workaround |
|-------------|------|-------------|------------|
| `team_id` | string | Account structure different | Use `account_id` |
| `is_usergroup` | boolean | Type system different | N/A |
| `is_subteam` | boolean | No subteam concept | N/A |
| `auto_type` | string | Auto-groups not supported | N/A |
| `created_by` | string | Creator not tracked | N/A |
| `updated_by` | string | Updater not tracked | N/A |
| `deleted_by` | string | Deletion tracking different | N/A |
| `prefs` | object | Preferences not supported | N/A |
| `users_count` | number | Available as `user_count` | Use `user_count` |
| `channel_count` | number | Not tracked | Count manually if needed |
| `handle` | string | @mention system different | Use group `name` |

**Impact on Migration:**
- ✅ Basic group management works
- ⚠️ Auto-groups not available
- ❌ Creator/modification history not available

---

## Summary by Impact

### High Impact (Require Redesign)

**Threading** - 5 fields omitted
- No `thread_ts`, `reply_count`, `reply_users`, etc.
- **Solution:** Don't migrate threaded conversations, or flatten to sequential messages

**Reactions** - Entire feature unsupported
- No `reactions` array, no reactions.add API
- **Solution:** Remove reaction features from migrated app

**Block Kit** - 10+ block types unavailable
- Only sections and dividers work
- **Solution:** Convert to markdown, accept 70% compatibility

### Medium Impact (Workarounds Exist)

**Metadata** - Not supported in messages
- **Solution:** Store in external database keyed by message_id

**Topic/Purpose** - Not in channel object
- **Solution:** Store separately in your app's database

**File Metadata** - Minimal fields (only 3 of 15)
- **Solution:** Track file types/sizes in your own system

### Low Impact (Usually Not Needed)

**User Admin Fields** - 7 fields (is_admin, is_owner, etc.)
- **Solution:** Use Zoom's role system differently

**Timezone Details** - tz_label, tz_offset not provided
- **Solution:** Calculate from timezone string

**Channel History** - created, creator, previous_names
- **Solution:** Track these yourself if critical

---

## Code Pattern: Safe Field Access

```typescript
// BAD: Assuming fields exist
function displayUser(user: any) {
  return `${user.real_name} (${user.tz_label})`;
  // ERROR: real_name and tz_label don't exist in Zoom
}

// GOOD: Use available fields with fallbacks
function displayUser(user: ZoomUser) {
  const name = user.display_name || user.name || 'Unknown User';
  const timezone = user.timezone || 'UTC';
  return `${name} (${timezone})`;
}
```

```typescript
// BAD: Checking omitted fields
if (channel.is_archived) {
  console.log('Archived channel');
}
// ERROR: is_archived doesn't exist

// GOOD: Alternative detection
try {
  await zoom.channels.info({ channel_id: channelId });
  console.log('Active channel');
} catch (error) {
  if (error.code === 'CHANNEL_NOT_FOUND') {
    console.log('Archived or deleted channel');
  }
}
```

---

## Testing for Omitted Fields

```typescript
describe('Omitted Fields Handling', () => {
  it('should not rely on Slack-specific fields', () => {
    const user = getUserFromZoom();

    // Should NOT test these (they don't exist)
    expect(user.is_admin).toBeUndefined();
    expect(user.deleted).toBeUndefined();
    expect(user.tz_offset).toBeUndefined();

    // Should test these (they exist)
    expect(user.id).toBeDefined();
    expect(user.name).toBeDefined();
    expect(user.email).toBeDefined();
  });

  it('should handle missing metadata gracefully', () => {
    const message = getMessageFromZoom();

    // Metadata doesn't exist, check your own DB
    const metadata = await messageMetadataDB.get(message.message_id);
    expect(metadata).toBeDefined();
  });
});
```

---

## Documentation Generation

When generating migration guides, include omitted fields in a "Known Limitations" section:

```markdown
## Known Limitations

This Zoom bot does not support the following Slack features due to API limitations:

**User Information:**
- Admin/owner detection (use Zoom roles instead)
- Timezone offset calculation (calculate from timezone string)
- Bot user detection (check JID format instead)

**Channel Features:**
- Channel topics/purpose (store separately in database)
- Channel creation date (not available)
- Shared channels (not supported)

**Messaging:**
- Threaded conversations (not supported - use sequential messages)
- Message reactions (not supported - remove from UI)
- Message metadata (store in external database)
- Read receipts (track client-side)

**Attachments:**
- File type/size info (detect from filename/API call)
- Upload timestamp (not available)
```

---

## Total Omitted Fields: 51+

- **User Object:** 19 fields
- **Channel Object:** 21 fields
- **Message Object:** 14 fields
- **Attachment Object:** 12 fields
- **Block Kit:** 10+ block types
- **UserGroup Object:** 11 fields

**Key Takeaway:** Zoom's API is simpler than Slack's. Most omitted fields are edge cases or advanced features. Core messaging, channels, and users work fine with available fields.
