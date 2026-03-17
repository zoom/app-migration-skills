# FAQ - Slack to Zoom Migration

Frequently asked questions about the migration skill.

---

## General Questions

### Q: What does this skill do?

**A:** Automatically migrates Slack apps to Zoom Team Chat. It:
- Analyzes your Slack app codebase
- Maps Slack APIs to Zoom equivalents
- Generates production-ready TypeScript/Node.js code
- Creates comprehensive documentation
- Validates and auto-fixes common bugs
- Reports realistic feature parity (typically 70-90%)

### Q: How long does migration take?

**A:** 2-3 minutes for generation + 1-2 minutes for validation = 3-5 minutes total.

### Q: Does it work with any Slack app?

**A:** Works best with command-driven apps (slash commands, buttons). Limited support for modal-heavy apps. Cannot migrate apps requiring passive message listening.

---

## Before Migration

### Q: What information do I need?

**A:** Either:
- GitHub URL of your Slack app
- Local path to Slack app directory

### Q: Does my Slack app need to be in a specific framework?

**A:** No! Supports:
- Bolt for JavaScript/TypeScript
- Bolt for Python
- Slack SDK (any language)
- Custom Express/Flask apps

### Q: Can I migrate a private GitHub repo?

**A:** Yes, if you have SSH access configured. Use: `git@github.com:user/repo.git`

---

## During Migration

### Q: What happens in Phase 5 validation?

**A:** The skill:
1. Installs dependencies
2. Compiles TypeScript
3. Runs unit tests
4. Starts the server
5. Tests webhook endpoints
6. Analyzes server logs for errors
7. Scans code for common bugs
8. Auto-fixes detected issues
9. Re-validates after fixes
10. Reports comprehensive results

### Q: Why am I asked for credentials?

**A:** Optional. If you provide Zoom credentials, the skill can test real API calls. If you skip, it runs basic validation only.

### Q: Can I skip Phase 5?

**A:** **NO.** Phase 5 is MANDATORY. The skill has checkpoints to prevent skipping.

---

## After Migration

### Q: What do I get as output?

**A:** A complete Zoom chatbot project:
```
your-app-zoom/
├── src/
│   ├── server.ts
│   ├── config.ts
│   ├── zoom/         # OAuth, webhooks, messaging
│   ├── app/          # Business logic
│   └── types/
├── tests/            # Unit, integration, e2e tests
├── package.json
├── tsconfig.json
├── .env.example
├── README.md         # Setup instructions
└── MIGRATION_GUIDE.md  # Feature parity analysis
```

### Q: Is the code production-ready?

**A:** If validation reports "100% PRODUCTION READY", yes! Otherwise, check MIGRATION_GUIDE.md for known issues.

### Q: What if some features don't work?

**A:** Check MIGRATION_GUIDE.md for:
- Feature parity percentage
- List of working features
- List of limitations
- Manual steps required (if any)

---

## Common Issues

### Q: I'm getting "Invalid request body format" (7001)

**A:** This usually means:
1. Missing `user_jid` field → Check message payloads
2. Lowercase button styles → Check for `style: 'primary'`
3. Duplicate body field → Check for spread operator

The skill validates these during Phase 5, but if you made manual changes, check [reference/COMMON_BUGS.md](COMMON_BUGS.md) for fixes.

### Q: Simple messages work but buttons don't

**A:** Check button styles are capitalized:
```typescript
// ❌ Wrong
style: 'primary'

// ✅ Correct
style: 'Primary'
```

### Q: How do I test the bot locally?

**A:**
```bash
cd ~/your-bot-zoom
npm install
npm run dev

# In another terminal, test webhook
curl -X POST http://localhost:3000/webhooks/zoom \
  -d '{"event":"bot_notification","payload":{...}}'
```

### Q: Where do I get Zoom credentials?

**A:**
1. Go to https://marketplace.zoom.us
2. Click "Develop" → "Build App" → "Team Chat App"
3. Get: Client ID, Client Secret, Bot JID, Webhook Secret
4. Update `.env` with your credentials

---

## Validation & Testing

### Q: How do I validate my generated code?

**A:** The skill automatically validates during Phase 5 migration:
- TypeScript compilation
- npm test execution
- Server startup
- Webhook endpoint testing
- Log analysis for critical bugs
- Auto-fixes applied when needed

If validation reports "100% PRODUCTION READY", you're good to go!

### Q: What bugs does the skill auto-fix?

**A:** Eight critical bugs during Phase 5:
1. Duplicate body field (API error 7001)
2. Missing user_jid (API error 7001)
3. Uninitialized services (crashes)
4. Lowercase button styles (API error 7001)
5. Missing fire-and-forget pattern
6. Missing markdown support
7. Wrong OAuth grant type
8. Style properties instead of markdown

See [reference/COMMON_BUGS.md](COMMON_BUGS.md) for details on each bug and fix.

---

## Feature Parity

### Q: What does "85% feature parity" mean?

**A:** 85% of your Slack app's features work in Zoom with minimal changes. The remaining 15% may need manual work or aren't available in Zoom.

### Q: Why isn't feature parity 100%?

**A:** Zoom Team Chat has some limitations:
- No modals (use inline messages instead)
- No passive listening (only @mentions work)
- No App Home tabs
- Limited rich formatting

### Q: What features migrate perfectly?

**A:** These work 100%:
- Slash commands
- Interactive buttons
- Simple messages
- Session state
- OAuth flows
- Webhooks
- Markdown formatting

---

## Troubleshooting

### Q: Server won't start

**A:**
1. Check port 3000 is free: `lsof -i :3000`
2. Check TypeScript compiles: `npx tsc --noEmit`
3. Check dependencies installed: `npm install`
4. Check `.env` has all required variables

### Q: Webhooks return 400 errors

**A:**
1. Check message has `user_jid` field
2. Check `is_markdown_support: true` is set
3. Check button styles are capitalized
4. Check no duplicate body/content fields

See [reference/COMMON_BUGS.md](COMMON_BUGS.md) for how to fix each issue.

### Q: Getting "not initialized" errors

**A:** Optional services (like GitHub) aren't properly wrapped in try-catch. The skill should auto-fix this. If not, manually wrap `getService()` calls:

```typescript
// ❌ Wrong
const github = getGitHubService();
await github.doSomething();

// ✅ Correct
try {
  const github = getGitHubService();
  await github.doSomething();
} catch (error) {
  console.log('Service not available');
}
```

---

## Skill Development

### Q: Can I improve the skill?

**A:** Yes! The skill is designed to be enhanced. See `changelog/` for recent improvements.

### Q: How do I add a new validation check?

**A:** Update `core/instructions.md` Phase 5 with new inline validation logic using Grep/Read tools.

### Q: Where's the changelog?

**A:** `changelog/CHANGELOG.md` has version history and all changes.

### Q: How do I report bugs?

**A:** Create an issue in the skill's repository or update `reference/COMMON_BUGS.md`.

---

## Best Practices

### Q: Should I migrate my entire Slack app at once?

**A:** Start with core features first. Test those, then add advanced features incrementally.

### Q: How do I handle features that don't migrate?

**A:** Check MIGRATION_GUIDE.md for workarounds. For modals, consider:
- Convert to inline message cards
- Use multiple messages instead of single modal
- Simplify UX for Zoom limitations

### Q: Should I keep my Slack app running?

**A:** Yes, during testing. Once Zoom version is stable, you can deprecate Slack app.

---

## Resources

- **Quick Reference:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Common Bugs:** [COMMON_BUGS.md](COMMON_BUGS.md)
- **API Mapping:** [../docs/API_MAPPING_REFERENCE.md](../docs/API_MAPPING_REFERENCE.md)
- **Changelog:** [../changelog/CHANGELOG.md](../changelog/CHANGELOG.md)
