# Credentials in Builder Pattern SDK

Secure credential management for Robomotion automation flows.

## Core Principle

**NEVER pass credentials directly in flow code.** Flows reference credentials by `vaultId` and `itemId`. The robot fetches actual secrets at runtime from encrypted vault storage.

```typescript
// WRONG - Never hardcode secrets!
f.node('3a7c92', 'Generate Text', {
  type: 'Robomotion.GoogleGemini.GenerateText',
  inApiKey: Custom('sk-1234567890'),  // NEVER DO THIS!
  inPrompt: Custom('Write a blog post')
});

// CORRECT - Use vault reference
f.node('3a7c92', 'Generate Text', {
  type: 'Robomotion.GoogleGemini.GenerateText',
  inCredentials: Credential({
    vaultId: 'vault-uuid',
    itemId: 'item-uuid'
  }),
  inPrompt: Custom('Write a blog post')
});
```

## Two Use Cases for Credentials

### Use Case 1: Nodes with `inCredentials` Property (Direct)

Most service nodes (Gemini, WordPress, Mail, Database) have an `inCredentials` property that accepts vault references directly. The runtime automatically decrypts and extracts the needed fields.

```typescript
// Direct credential reference - runtime handles decryption
f.node('4b8d21', 'Robomotion.GoogleGemini.GenerateText', 'Generate', {
  inCredentials: Credential({ vaultId: '...', itemId: '...' }),
  inPrompt: Custom('Write a blog post')
});
```

### Use Case 2: Browser Automation (GetItem Required)

For browser automation where you need individual credential fields (username, password), use `Core.Vault.GetItem` to retrieve credentials. See **Pattern 3** below for the full example.

## Four Patterns for Credentials

### Pattern 1: Credential() Helper (Required for Credentials)

Use the `Credential()` helper for any credential property (`inCredentials`, `optCredentials`):

```typescript
import { flow, Credential, Custom, Message } from '@robomotion/sdk';

const myFlow = flow.create('main', 'Secure Flow', (f) => {
  f.node('5c2d91', 'Core.Mail.Connect', 'Connect to Email', {
    inCredentials: Credential({
      vaultId: 'e6343c49-e40f-4c18-8e8a-5cd4077b747e',
      itemId: '7adabf50-07ea-4042-a914-400b391ac478'
    }),
    outConnectionId: Message('mail_conn_id')
  });
});
```

**What Credential() produces:**
```typescript
Credential({ vaultId: 'vault-uuid', itemId: 'item-uuid' })
// On credential properties (optCredentials, inCredentials):
// { scope: 'Custom', name: { vaultId: 'vault-uuid', itemId: 'item-uuid' } }
//
// On non-credential properties (inText, inSelector — WRONG usage, caught by validation):
// { scope: 'Custom', name: '', vaultId: 'vault-uuid', itemId: 'item-uuid' }
```

The runtime `CredentialsX` reads `Name` as an object containing `{vaultId, itemId}`. The `Credential()` helper ensures this structure is correct for credential properties.

**When to use:** ONLY on credential properties - `inCredentials`, `optCredentials`, etc. NEVER on regular input properties like `inText`, `inSelector`.

### Pattern 2: Plain Object for inCredentials (Auto-wrapped)

For `inCredentials` properties specifically, the SDK auto-detects plain credential objects and wraps them:

```typescript
f.node('6d3e82', 'Core.Mail.Connect', 'Connect to Email', {
  inCredentials: {
    vaultId: 'e6343c49-e40f-4c18-8e8a-5cd4077b747e',
    itemId: '7adabf50-07ea-4042-a914-400b391ac478'
  },
  outConnectionId: Message('mail_conn_id')
});
```

**IMPORTANT:** This auto-wrapping only works for `inCredentials`. For `optCredentials` (used by `Core.Vault.GetItem`), you MUST use the `Credential()` helper explicitly.

**When to use:** For inline, one-off credential references to `inCredentials` only.

### Pattern 3: Core.Vault.GetItem (For Individual Fields)

**CRITICAL: `optCredentials` is REQUIRED. Omitting it causes "Vault has to be selected" runtime error.**

Use `Core.Vault.GetItem` when you need to access individual credential fields (username, password, etc.):

```typescript
import { flow, Custom, Message, Credential } from '@robomotion/sdk';

const LOGIN_CREDENTIALS = {
  vaultId: 'vault-uuid',
  itemId: 'item-uuid'
};

const myFlow = flow.create('main', 'Login Flow', (f) => {
  f.node('7e4f73', 'Core.Trigger.Inject', 'Start', {})
    // Retrieve credentials - stores full object in msg.credentials
    .then('8f5a64', 'Core.Vault.GetItem', 'Get Credentials', {
      optCredentials: Credential(LOGIN_CREDENTIALS),  // MUST use Credential() wrapper
      outItem: Message('credentials')
    })
    // Access individual fields
    .then('9a6b55', 'Core.Browser.SetValue', 'Enter Username', {
      inPageId: Message('page_id'),
      inSelector: Custom('#username'),
      inValue: Message('credentials.username')
    })
    .then('ab7c46', 'Core.Browser.SetValue', 'Enter Password', {
      inPageId: Message('page_id'),
      inSelector: Custom('#password'),
      inValue: Message('credentials.password')
    });
});
```

**When to use:** Browser automation, form filling, or any scenario requiring individual credential fields.

**Output structures by credential category:**

```typescript
// Category 1: LoginItem
msg.credentials = {
  username: "user@example.com",
  password: "secret123",
  meta: { vaultId: "...", itemId: "..." }
}
// Access: Message('credentials.username'), Message('credentials.password')

// Category 4: APIKeyToken
msg.api_creds = {
  value: "sk-1234567890abcdef",
  meta: { vaultId: "...", itemId: "..." }
}
// Access: Message('api_creds.value')

// Category 5: DatabaseItem
msg.db_creds = {
  type: "mysql",
  server: "db.example.com",
  port: 3306,
  database: "mydb",
  username: "dbuser",
  password: "dbpass",
  meta: { vaultId: "...", itemId: "..." }
}
// Access: Message('db_creds.server'), Message('db_creds.username'), etc.
```

### Pattern 4: Message Reference for Dynamic Credentials

Store credential references in a message variable for dynamic selection:

```typescript
// Setup node stores credentials in message
f.node('bc8d37', 'Core.Programming.Function', 'Setup', {
  func: `
    msg.gemini_creds = {
      vaultId: 'vault_123',
      itemId: 'item_456'
    };
    return msg;
  `
})
  .then('cd9e28', 'Robomotion.GoogleGemini.GenerateText', 'Generate Text', {
    inCredentials: Message('gemini_creds'),  // Reference stored credentials
    inPrompt: Custom('Write a blog post'),
    outText: Message('generated_text')
  });
```

**When to use:** When credential IDs are determined dynamically at runtime (e.g., user selection, conditional logic).

## Credential Constants Pattern

For multiple nodes using the same credentials, define constants at the top of your file:

```typescript
import { flow, Credential, Custom, Message } from '@robomotion/sdk';

// Define credential references once
const GEMINI_CREDENTIALS = {
  vaultId: 'vault-abc123',
  itemId: 'item-xyz789'
};

const WORDPRESS_CREDENTIALS = {
  vaultId: 'vault-def456',
  itemId: 'item-uvw012'
};

const myFlow = flow.create('main', 'Blog Generator', (f) => {
  // Generate text with Gemini
  f.node('deaf19', 'Robomotion.GoogleGemini.GenerateText', 'Generate Content', {
    inCredentials: Credential(GEMINI_CREDENTIALS),  // Reuse constant
    inPrompt: Custom('Write about automation'),
    outText: Message('content')
  });

  // Generate image with Gemini
  f.node('efb02a', 'Robomotion.GoogleGemini.GenerateImage', 'Generate Cover', {
    inCredentials: Credential(GEMINI_CREDENTIALS),  // Same credentials
    inPrompt: Custom('Cover image for automation blog'),
    outImageUrl: Message('coverUrl')
  });

  // Post to WordPress
  f.node('f0c13b', 'Robomotion.WordPress.CreatePost', 'Publish', {
    inCredentials: Credential(WORDPRESS_CREDENTIALS),  // Different credentials
    inTitle: Message('title'),
    inContent: Message('content')
  });
});
```

## Discovering Credentials

Use MCP tools to find vault items:

```typescript
// List all vaults
mcp__api__vault_list()

// List items in a vault
mcp__api__vault_item_list({ vaultId: "vault-uuid" })
```

## Credential Categories

| Category | Type | Description | Used By |
|----------|------|-------------|---------|
| 1 | LoginItem | Username/password pairs | WordPress, FTP, generic logins |
| 2 | EmailItem | IMAP/POP3 + SMTP settings | Mail nodes |
| 3 | CreditCard | Credit card details | Payment flows |
| 4 | APIKeyToken | API keys and tokens | Gemini, HTTP requests with auth |
| 5 | DatabaseItem | Database credentials | SQLite, MySQL |
| 6 | DocumentItem | Certificates, files | SSL, signing |
| 7 | AESKeyItem | AES encryption keys | Encryption nodes |
| 8 | RSAKeyPairItem | RSA key pairs | Asymmetric encryption |

## Vault Item Type Fields

### Category 1: LoginItem

Used for username/password authentication (WordPress, FTP, web logins, browser automation).

| Field | Type | Description | Redaction |
|-------|------|-------------|-----------|
| `username` | string | Username or email address | - |
| `password` | string | Password | REDACTED |

**Access patterns:**
```typescript
// For nodes with inCredentials (WordPress, FTP):
inCredentials: Credential({ vaultId: '...', itemId: '...' })

// For browser automation - use Core.Vault.GetItem first:
.then('a1d24c', 'Core.Vault.GetItem', 'Get Credentials', {
  optCredentials: Credential(LOGIN_CREDENTIALS),  // MUST use Credential() wrapper
  outItem: Message('credentials')
})
// Then access fields: Message('credentials.username'), Message('credentials.password')
```

### Category 2: EmailItem

Used for email connections (IMAP/POP3 inbox + SMTP outbox).

| Field | Type | Description | Redaction |
|-------|------|-------------|-----------|
| `inbox.type` | string | Inbox protocol: "imap" or "pop3" | - |
| `inbox.server` | string | Inbox server hostname | - |
| `inbox.port` | number | Inbox server port (993, 995, etc.) | - |
| `inbox.username` | string | Inbox username | - |
| `inbox.password` | string | Inbox password | REDACTED |
| `smtp.server` | string | SMTP server hostname | - |
| `smtp.port` | number | SMTP server port (587, 465, etc.) | - |
| `smtp.username` | string | SMTP username | - |
| `smtp.password` | string | SMTP password | REDACTED |

### Category 4: APIKeyTokenItem

Used for API authentication (Gemini, OpenAI, HTTP requests).

| Field | Type | Description | Redaction |
|-------|------|-------------|-----------|
| `value` | string | API key or token value | MASKED_MID |

**Example:**
```typescript
// For Gemini nodes, the runtime extracts the 'value' field automatically
f.node('b2e35d', 'Robomotion.GoogleGemini.GenerateText', 'Generate', {
  inCredentials: Credential({ vaultId: '...', itemId: '...' }),
  // Runtime uses credential.value as the API key
});
```

### Category 5: DatabaseItem

Used for database connections (MySQL, PostgreSQL, MSSQL, Oracle).

| Field | Type | Description | Redaction |
|-------|------|-------------|-----------|
| `type` | string | Database type (mysql, postgres, mssql, oracle) | - |
| `server` | string | Database server hostname/IP | MASKED_IP |
| `port` | number | Database port | - |
| `database` | string | Database name | MASKED_END |
| `username` | string | Database username | MASKED_END |
| `password` | string | Database password | REDACTED |
| `sid` | string | Oracle SID (Oracle only) | - |

## Common Nodes Requiring Credentials

| Node Type | Credential Property | Category |
|-----------|-------------------|----------|
| `Robomotion.GoogleGemini.*` | `inCredentials` | 4 (APIKeyToken) |
| `Robomotion.WordPress.*` | `inCredentials` | 1 (LoginItem) |
| `Core.Mail.Connect` | `inCredentials` | 2 (EmailItem) |
| `Robomotion.SQLite.Connect` | `inCredentials` | 5 (DatabaseItem) |
| `Core.Vault.GetItem` | `optCredentials` | Any (use `Credential()` wrapper) |

## Common Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| `Core.Vault.GetItem` without `optCredentials` | "Vault has to be selected" | Add `optCredentials: Credential({...})` |
| `Credential()` on non-credential property (e.g. `inText`) | "Config parse error" | Use `Core.Vault.GetItem` first, then `Message('creds.field')` |
| Hardcoding API keys in `Custom()` | Exposed in code | Use vault references |
| `Custom()` wrapping credential object | Runtime panic | Use `Credential()` or plain object on `inCredentials` |
| Mixing `inCredentials` with `inUsername`/`inPassword` | Conflict | Use one pattern, not both |
| `Message('creds.fields.username')` | "does not exist" | No `.fields.` — use `Message('creds.username')` directly |

## Log Redaction

The runtime automatically redacts sensitive values:

| Strategy | Display | Used For |
|----------|---------|----------|
| RT_REDACT | ******** | Passwords, API keys |
| RT_MASK_MID | 4532****9012 | Credit cards |
| RT_MASK_EMAIL | u***@domain.com | Emails |
| RT_HASH | hash:a3f8bc7d | Verification |

## What's Safe to Commit

**Safe (UUIDs only):**
- Vault IDs
- Item IDs
- Flow code with vault references

**NEVER safe:**
- Actual passwords
- API keys
- Tokens
- Private keys

## Quick Reference: Which Pattern to Use

| Scenario | Pattern | Example |
|----------|---------|---------|
| Node has `inCredentials` property | `Credential()` or plain object | Gemini, WordPress, Mail, Database |
| Browser form filling | `Core.Vault.GetItem` -> `Message('credentials.field')` | Login forms, signup pages |
| HTTP with auth headers | `Core.Vault.GetItem` -> Function node builds headers | API calls with Bearer tokens |
| Dynamic credential selection | `Core.Vault.GetItem` with `Message()` reference | User-selected accounts |

## Best Practices

1. **Always use vault references** - Never hardcode credentials
2. **Choose the right pattern** - Use `inCredentials` when available, `Core.Vault.GetItem` for field access
3. **Define credential constants** - Reuse across multiple nodes
4. **Use Credential() helper** - Required for `optCredentials`, recommended for `inCredentials`
5. **Ask user to select** - Use AskUserQuestion for credential selection when needed
