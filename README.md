# Domain Availability Monitor

![Domain Status](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ciro-maciel/domain-check/main/data/badge.json)

Monitor domain availability via RDAP and get notified instantly when domains become available for registration.

## Features

- 🔍 **RDAP Check** - Uses official RDAP protocol for accurate domain status
- 🔄 **Retry Logic** - 3 retries with exponential backoff on failures
- 📧 **Email Alerts** - Instant notifications via [Resend](https://resend.com)
- 💬 **Discord/Slack** - Webhook notifications with rich embeds
- 🗄️ **SQLite** - Lightweight persistence to avoid duplicate alerts
- 📊 **Health Badge** - Dynamic status badge for your README
- 🚀 **Multiple Domains** - Monitor several domains at once

## Quick Start

```bash
# Clone
git clone https://github.com/ciro-maciel/domain-check.git
cd domain-check

# Install
bun install

# Configure
cp .env.example .env
# Edit .env with your settings

# Run
bun start
```

## Configuration

| Variable         | Required | Description                                   |
| ---------------- | -------- | --------------------------------------------- |
| `DOMAIN`         | ✅       | Domain(s) to monitor, comma-separated         |
| `RESEND_API_KEY` | ✅       | API key from [resend.com](https://resend.com) |
| `ALERT_EMAIL`    | ✅       | Email to receive alerts                       |
| `WEBHOOK_URL`    | ❌       | Discord/Slack webhook URL                     |
| `TEST_MODE`      | ❌       | Set to `true` to test notifications           |
| `LOOP_MODE`      | ❌       | Set to `true` for continuous monitoring       |

## Examples

**Single domain:**

```bash
DOMAIN=myleads.click bun start
```

**Multiple domains:**

```bash
DOMAIN=myleads.click,example.com,mydomain.io bun start
```

**Test notifications:**

```bash
bun test
```

## GitHub Actions

This project includes a workflow that runs every 5 minutes. Configure these secrets in your repository:

- `DOMAIN`
- `RESEND_API_KEY`
- `ALERT_EMAIL`

## License

MIT
