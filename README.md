# Prime Agent UI

COAI Lead Engine Dashboard — a React/Next.js dashboard for lead discovery, SMS outreach, and PayPal invoicing.

## Deployment (Vercel)

This project is deployed on Vercel under team `jasons-projects-1d845fc4`.

### Environment Variables (set in Vercel project settings)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | API server URL (default: `http://127.0.0.1:8082`) |
| `LEAD_SCORING_API_URL` | Backend API URL for serverless proxy |
| `NEXT_PUBLIC_VAPI_API_KEY` | VAPI voice agent API key |
| `PAYPAL_CLIENT_ID` | PayPal production client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal production client secret |
| `PAYPAL_ENV` | `production` or `sandbox` |
| `TELNYX_API_KEY` | Telnyx SMS API key |
| `TELNYX_PHONE_NUMBER` | Telnyx phone number (E.164) |
| `TELNYX_MQ_ID` | Telnyx Messaging Profile ID |
| `TWILIO_ACCOUNT_SID` | Twilio fallback SID |
| `TWILIO_AUTH_TOKEN` | Twilio fallback token |
| `TWILIO_PHONE_NUMBER` | Twilio fallback number |
| `DATABASE_URL` | Neon.tech PostgreSQL connection string |
| `OPENROUTER_API_KEY` | OpenRouter API key for lead scoring |
| `SUPERMEMORY_API_KEY` | Supermemory long-term memory key |

### Quick Deploy

```bash
# Link to existing Vercel project
vercel link --debug

# Set environment variables (example)
vercel env add NEXT_PUBLIC_API_BASE_URL
vercel env add LEAD_SCORING_API_URL
# ... add all variables

# Deploy
vercel --prod
```

### Local Development

```bash
npm install
npm run dev
```

Dashboard will be available at `http://localhost:3000`.

## Features

- **Lead Scanner** — Search by industry and location with hot lead scoring
- **SMS Outreach** — Send SMS via Telnyx (with Twilio fallback)
- **PayPal Invoicing** — Create production invoices with automatic PayPal.Me fallback
- **Analytics** — Lead statistics and scoring visualization
- **System Health** — Monitor API server, SMS provider, PayPal, and database status

## API Proxy

The dashboard proxies API requests through `/app/api/web/[...path]/route.ts` to the local FastAPI server running on port 8082. This avoids CORS issues and keeps credentials server-side.

## License

MIT
