# ngrok Setup Guide

This guide will help you set up ngrok for your Next.js application to expose it to the internet.

## Prerequisites

1. **ngrok Account**: Sign up at [ngrok.com](https://ngrok.com) (free account available)
2. **Authtoken**: Get your authtoken from the ngrok dashboard

## Setup Steps

### 1. Configure ngrok Authtoken

```bash
# Set your authtoken (replace with your actual token)
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

### 2. Update Configuration

Edit `ngrok.yml` and add your authtoken:

```yaml
version: "2"
authtoken: YOUR_AUTHTOKEN_HERE
tunnels:
  web:
    proto: http
    addr: 3000
```

### 3. Start Your Application

#### Option A: Run Next.js and ngrok separately

```bash
# Terminal 1: Start Next.js
pnpm dev

# Terminal 2: Start ngrok tunnel
pnpm tunnel
```

#### Option B: Run both simultaneously

```bash
# This will start both Next.js and ngrok together
pnpm dev:tunnel
```

#### Option C: Use configuration file

```bash
# Start Next.js first
pnpm dev

# Then start ngrok with config
pnpm tunnel:config
```

## Available Scripts

- `pnpm tunnel` - Start ngrok tunnel for port 3000
- `pnpm dev:tunnel` - Start both Next.js dev server and ngrok tunnel
- `pnpm tunnel:config` - Start ngrok using the configuration file

## Getting Your Public URL

1. Start ngrok using any of the methods above
2. Look for the "Forwarding" line in the ngrok output
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

## Environment Variables

Update your `.env.local` file with the ngrok URL:

```bash
# Add this to your .env.local
NEXTAUTH_URL=https://your-ngrok-url.ngrok.io
```

## Troubleshooting

### Common Issues

1. **"authtoken not found"**: Run `ngrok config add-authtoken YOUR_TOKEN`
2. **Port already in use**: Make sure port 3000 is available for your Next.js app
3. **Connection refused**: Ensure your Next.js app is running before starting ngrok

### Useful Commands

```bash
# Check ngrok status
ngrok status

# View ngrok web interface
# Open http://127.0.0.1:4040 in your browser

# Kill all ngrok tunnels
ngrok stop --all
```

## Security Notes

- **Free accounts**: Get random subdomains that change each restart
- **Paid accounts**: Can reserve custom subdomains
- **HTTPS**: ngrok provides HTTPS URLs by default
- **Local only**: Your local app must be running for ngrok to work

## World App Integration

For World App Mini Apps, you'll need to:

1. Use the ngrok HTTPS URL as your app URL
2. Update your app configuration in the World App dashboard
3. Ensure your app works properly over HTTPS
