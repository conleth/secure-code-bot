# secure-code-bot

secure-code-bot is a small Node.js + TypeScript service that listens for secureCodeBox webhook events, pulls supporting metadata (Cycode, SharePoint leaderboards, recognition/tips JSON), and posts a rich Adaptive Card notification into Microsoft Teams. The card surfaces scan context, celebrates teams, spotlights champions, tracks quarterly goals, and nudges AppSec culture.

## Environment setup
1. Install Node.js 18+.
2. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in real values:
   ```bash
   cp .env.example .env
   ```

### Required environment variables
```
PORT=3004
TEAMS_WEBHOOK_URL=<incoming Teams webhook URL>
CYCOD_API_BASE_URL=<https://api.cycode.com placeholder>
CYCOD_API_TOKEN=<cycode token>
SHAREPOINT_LEADERBOARD_FILE_URL=<public or authenticated CSV/XLSX URL>
NODE_ENV=development
```

## Running locally
- Development (ts-node):
  ```bash
  npm run dev
  ```
- Production build + start:
  ```bash
  npm run build
  npm start
  ```

The service exposes `GET /health` for probes and `POST /webhooks/securecodebox` for webhook events.

## Testing the webhook endpoint
Send a synthetic payload to verify the flow:
```bash
curl -X POST http://localhost:3004/webhooks/securecodebox \
  -H "Content-Type: application/json" \
  -d '{
    "scanName": "example-zap-scan",
    "scanner": "zap",
    "target": "https://example.com",
    "status": "Succeeded",
    "findings": { "high": 1, "medium": 4, "low": 7 }
  }'
```

## Microsoft Teams webhook setup
1. In Teams, go to the desired channel and choose **Connectors** > **Incoming Webhook**.
2. Give the webhook a descriptive name (e.g., `secure-code-bot`) and upload an icon if you like.
3. Copy the webhook URL and place it in `TEAMS_WEBHOOK_URL`.
4. (Optional) Restrict webhook usage to your AppSec bot IP range if your tenant allows it.

## SharePoint / leaderboard configuration
- `SHAREPOINT_LEADERBOARD_FILE_URL` should point to a CSV or XLSX file with columns `Team`, `ResolvedLast7Days`, and optional `StreakWeeks`.
- Authentication headers/TODOs are stubbed inside `leaderboardService`; fill them in to access private SharePoint/Teams files.

## Cycode integration placeholder
- `cycodeClient` contains a TODO stub describing the expected payload. Wire it up once Cycode ASPM API details are available.

## Example Adaptive Card contents
The generated card includes:
- Scan summary, severity counts, and link to the full report
- Leaderboard of teams resolving the most issues in the last 7 days
- Bug Bounty Hunter of the Moment + Security Champion Spotlight (from `data/recognition.json`)
- Quarterly goal progress (from `data/goals.json`)
- "Did you know?" tip (from `data/tips.json`)
- Quick instructions for muting the bot in Teams

## Notes
- Data files under `data/` can be edited without redeploying the service.
- History persistence is backed by `data/history.json` for future streak/trend features.
- Prettier is optional; run it locally if you prefer consistent formatting.
