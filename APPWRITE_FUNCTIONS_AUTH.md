# Appwrite Functions Authentication Guide

## Quick Answer: Yes! ✅

**When a logged-in user calls an Appwrite Function, the session cookie is automatically sent, and Appwrite adds authentication headers to the function request.**

## How It Works

### 1. Automatic Header Injection

When a function is called from an authenticated client:

```javascript
// Frontend call (session cookie sent automatically)
await functions.createExecution('function-id', data)
```

Appwrite automatically adds these headers to the function request:

| Header | Description | Example |
|--------|-------------|---------|
| `x-appwrite-user-id` | Current user's ID | `507f1f77bcf86cd799439011` |
| `x-appwrite-user-jwt` | User's JWT token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `x-appwrite-session-id` | Current session ID | `5f3d2a1b2c4e5f6g7h8i9j0k` |

### 2. Function Authentication Check

```javascript
export default async ({ req, res, log, error }) => {
  // Extract user ID from headers
  const userId = req.headers['x-appwrite-user-id']
  
  // Validate authentication
  if (!userId) {
    log('Unauthorized request - no user session')
    return res.json({
      success: false,
      message: 'Authentication required'
    }, 401)
  }
  
  // User is authenticated - proceed with logic
  log(`Authenticated request from user: ${userId}`)
  
  // Your code here...
}
```

## Real-World Example: Store Calendar OAuth Token

### Frontend (Calendar.tsx)

```typescript
import { storeCalendarToken } from '@/lib/functions'

// After OAuth callback
const result = await storeCalendarToken({
  provider: 'google',
  accessToken: 'ya29.a0AfH6SMBx...',
  scope: 'calendar.readonly',
  expiresIn: '3600'
})
```

### Backend Function (main.js)

```javascript
export default async ({ req, res, log, error }) => {
  // 1. Authenticate
  const userId = req.headers['x-appwrite-user-id']
  if (!userId) {
    return res.json({ success: false, message: 'Unauthorized' }, 401)
  }
  
  // 2. Parse data
  const { provider, accessToken, scope, expiresIn } = JSON.parse(req.body)
  
  // 3. Store token with user-specific permissions
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY)
  
  const databases = new Databases(client)
  
  await databases.createDocument(
    'database-id',
    'user_calendars',
    'unique()',
    {
      userId: userId,  // From authenticated session
      provider: provider,
      accessToken: accessToken,  // Encrypt in production!
      scope: scope,
      expiresAt: Date.now() + (parseInt(expiresIn) * 1000)
    },
    [
      `read("user:${userId}")`,    // Only this user can read
      `write("user:${userId}")`,   // Only this user can update
      `delete("user:${userId}")`   // Only this user can delete
    ]
  )
  
  return res.json({ success: true })
}
```

## Function Execution Permissions

Set in `appwrite.config.json`:

```json
{
  "functions": [
    {
      "execute": ["users"]  // Only authenticated users can call
      // OR
      "execute": ["any"]    // Anyone can call (check auth manually)
      // OR
      "execute": ["role:admin", "role:member"]  // Specific roles
    }
  ]
}
```

### Recommendation:
- Use `"execute": ["users"]` to prevent anonymous calls
- Still check `req.headers['x-appwrite-user-id']` in your function for clarity

## Security Checklist

✅ **Check `x-appwrite-user-id` header** - Validates user is authenticated
✅ **Use user ID in database operations** - Ensures data isolation
✅ **Set user-specific permissions** - `read("user:${userId}")`
✅ **Never trust client input** - Validate all data in function
✅ **Encrypt sensitive data** - OAuth tokens should be encrypted before storage
✅ **Log authentication attempts** - Use `log()` for debugging
✅ **Handle unauthorized requests** - Return 401 status code

## Common Patterns

### Pattern 1: User-Specific Data Operation
```javascript
const userId = req.headers['x-appwrite-user-id']
if (!userId) return res.json({ error: 'Unauthorized' }, 401)

// Use userId to scope operations
const userDocs = await databases.listDocuments(
  'db-id',
  'collection-id',
  [Query.equal('userId', userId)]
)
```

### Pattern 2: Admin-Only Operations
```javascript
const userId = req.headers['x-appwrite-user-id']
const userJwt = req.headers['x-appwrite-user-jwt']

// Check if user has admin role
const users = new Users(client)
const user = await users.get(userId)

if (!user.labels.includes('admin')) {
  return res.json({ error: 'Forbidden - Admin only' }, 403)
}

// Admin operation...
```

### Pattern 3: Hybrid Public/Private
```javascript
const userId = req.headers['x-appwrite-user-id']

if (req.body.action === 'public') {
  // Allow anonymous access
  return res.json({ data: publicData })
}

// Require authentication for other actions
if (!userId) return res.json({ error: 'Unauthorized' }, 401)

// Authenticated operation...
```

## Testing Authentication

### Test Authenticated Call
```bash
# Get session cookie from browser
# Then call function via CLI or API with cookie

curl -X POST \
  https://your-appwrite/v1/functions/function-id/executions \
  -H "Content-Type: application/json" \
  -H "Cookie: a_session_xxx=..." \
  -d '{"data":"test"}'
```

### Test Unauthorized Call
```bash
# Without session cookie - should fail
curl -X POST \
  https://your-appwrite/v1/functions/function-id/executions \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}'
```

## Key Takeaways

1. 🔐 **Session cookies work automatically** - No manual token passing needed
2. ✅ **Headers are auto-injected** - Check `req.headers['x-appwrite-user-id']`
3. 🛡️ **Always validate auth** - Even with `execute: ["users"]`
4. 👤 **User isolation is critical** - Use `userId` in all queries
5. 📝 **Log everything** - Use `log()` for debugging auth issues
6. 🔒 **Encrypt sensitive data** - OAuth tokens, API keys, etc.

## Documentation Links

- [Appwrite Functions](https://appwrite.io/docs/products/functions)
- [Function Execution](https://appwrite.io/docs/products/functions/execute)
- [Authentication](https://appwrite.io/docs/products/auth)
- [Permissions](https://appwrite.io/docs/advanced/platform/permissions)
