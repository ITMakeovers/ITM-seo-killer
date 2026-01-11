# Security

## Admin Interface Protection

The admin interface (`/admin`) is protected by PIN authentication to prevent unauthorized access.

### How It Works

1. **PIN Authentication**: When accessing `/admin`, users must enter a PIN
2. **Session Management**: Authenticated sessions are stored in secure HTTP-only cookies
3. **Hash Storage**: PINs are stored as SHA-256 hashes in the configuration file

### Configuration

In `site.config.json`:

```json
{
  "admin": {
    "enabled": true,
    "pinHash": "your-sha256-hash-here",
    "apiKey": "your-api-key-here"
  }
}
```

### Default Credentials

**Default PIN**: `1234`

**⚠️ WARNING**: Change the default PIN immediately! The default is only for initial setup and testing.

### Changing the PIN

1. Generate a SHA-256 hash of your desired PIN:
   ```bash
   echo -n "your-new-pin" | shasum -a 256
   ```
   
2. Update `admin.pinHash` in `site.config.json` with the generated hash

3. Restart the application

### Example

To set PIN to `5678`:
```bash
echo -n "5678" | shasum -a 256
```

This outputs: `e7c3045e59b49d7648c02ca95e6a58bb7eb7c4c8e41a0ffa40c66eaf4b85fb84`

Update config:
```json
{
  "admin": {
    "pinHash": "e7c3045e59b49d7648c02ca95e6a58bb7eb7c4c8e41a0ffa40c66eaf4b85fb84"
  }
}
```

## API Protection

Admin API endpoints are protected to prevent unauthorized external access.

### Protected Endpoints

The following endpoints require authentication:

- `POST /api/topics/generate` - Generate new topics
- `POST /api/articles/generate` - Generate articles
- `POST /api/articles/delete` - Delete articles
- `POST /api/articles/link` - Update article links
- `POST /api/topics/reset` - Reset topic status

### Authentication Methods

#### 1. Browser Sessions (Internal)

When logged in via the admin interface, requests are authenticated via secure HTTP-only cookies.

#### 2. API Key (External)

For external API access, include the API key in the request header:

```bash
curl -X POST https://your-domain.com/api/articles/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -d '{"count": 3}'
```

### Setting Up API Key

1. Generate a secure random key:
   ```bash
   openssl rand -hex 32
   ```

2. Update `admin.apiKey` in `site.config.json`

3. Include the key in all external API requests using the `x-api-key` header

## Best Practices

1. **Change Default PIN**: Never use the default PIN `1234` in production
2. **Use Strong PINs**: Use at least 6 digits
3. **Secure API Keys**: Generate long, random API keys (32+ characters)
4. **Environment Variables**: Consider using environment variables for sensitive config
5. **HTTPS Only**: Always use HTTPS in production
6. **Cookie Security**: The auth cookies are automatically secured in production (httpOnly, secure, sameSite)
7. **Regular Updates**: Change your PIN and API key periodically
8. **Access Logs**: Monitor your server logs for suspicious access attempts

## Security Features

- ✅ SHA-256 PIN hashing
- ✅ Secure HTTP-only cookies
- ✅ API key authentication for external requests
- ✅ Session-based authentication for admin interface
- ✅ Middleware protection for admin routes
- ✅ No plaintext credentials in code
- ✅ Configurable authentication

## Reporting Security Issues

If you discover a security vulnerability, please email the maintainers directly rather than opening a public issue.

## Backward Compatibility

If no `pinHash` or `apiKey` is configured in `site.config.json`, the system will:
- Deny access to the admin interface (PIN required)
- Allow API access (backward compatible)

To maintain security, always configure both PIN and API key.
