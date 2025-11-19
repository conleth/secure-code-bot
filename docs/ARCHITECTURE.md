# Secure Code Bot Architecture

## System Overview

This document describes how the Secure Code Bot processes SecureCodeBox webhook events and delivers results to Microsoft Teams.

## Webhook Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SecureCodeBox Webhook Flow                  │
└─────────────────────────────────────────────────────────────────┘

1. EVENT TRIGGER
   ┌──────────────────┐
   │ SecureCodeBox    │
   │ Completes Scan   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────────────────────────┐
   │ POST /webhooks/securecodebox             │
   │ (secureCodeBoxWebhook.ts)                │
   └────────┬─────────────────────────────────┘
            │
            ▼
2. DATA GATHERING & PROCESSING
   ┌────────────────────────────────────────────────────────────┐
   │                                                            │
   │  scanSummaryService.buildSummary()                        │
   │  ├─ Parses scan payload                                  │
   │  └─ Extracts scanner info & findings                     │
   │                                                            │
   │  leaderboardService.getLeaderboard()                     │
   │  ├─ Fetches from database/API                           │
   │  └─ Rankings data                                        │
   │                                                            │
   │  recognitionService.getRecognition()                    │
   │  ├─ User achievements                                    │
   │  └─ Badges/rewards                                       │
   │                                                            │
   │  goalsService.getGoalsProgress()                        │
   │  ├─ Security goals                                       │
   │  └─ Progress metrics                                     │
   │                                                            │
   │  tipsService.pickTip()                                  │
   │  └─ Random security tip based on scanner               │
   │                                                            │
   └────────┬─────────────────────────────────────────────────┘
            │
            ▼
3. CARD BUILDING
   ┌────────────────────────────────────────────┐
   │ teamsCard.build({                          │
   │   scanSummary,                             │
   │   leaderboard,                             │
   │   recognition,                             │
   │   goals,                                   │
   │   tip                                      │
   │ })                                         │
   │                                            │
   │ Creates Adaptive Card JSON                │
   └────────┬───────────────────────────────────┘
            │
            ▼
4. DELIVERY
   ┌──────────────────────────────────────────┐
   │ teamsClient.postCard(card)               │
   │                                          │
   │ Sends to Microsoft Teams                │
   │ via Webhook URL                         │
   └────────┬─────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────┐
   │ Microsoft Teams Channel                 │
   │ Beautiful Adaptive Card Posted          │
   └──────────────────────────────────────────┘
```

## Component Breakdown

### 1. **Webhook Handler** (`src/routes/secureCodeBoxWebhook.ts`)
- Listens on `POST /webhooks/securecodebox`
- Entry point for SecureCodeBox scan notifications
- Orchestrates the entire data gathering and card building process
- Error handling and response management

### 2. **Services** (`src/services/`)

#### **scanSummaryService**
- Parses incoming SecureCodeBox scan payloads
- Extracts key information: scanner type, findings, severity levels
- Builds a structured summary for the card

#### **leaderboardService**
- Fetches team/user rankings
- Manages leaderboard data from CSV or database
- Displays top performers and team standings

#### **recognitionService**
- Tracks user achievements and recognition
- Manages badges and accomplishments
- Motivates team security culture

#### **goalsService**
- Retrieves security goals and targets
- Tracks progress toward objectives
- Helps teams stay aligned on security initiatives

#### **tipsService**
- Provides context-aware security tips
- Selects tips based on scanner type
- Educates teams during scan notifications

#### **teamsClient**
- Handles Microsoft Teams API communication
- Posts Adaptive Cards to Teams channels
- Manages webhook authentication

### 3. **Templates** (`src/templates/`)

#### **teamsCard**
- Builds Microsoft Adaptive Card JSON
- Formats scan results visually
- Integrates all service data into a cohesive message
- Supports interactive elements (buttons, links)

### 4. **Data Store** (`data/`)
- `goals.json` - Security goals definitions
- `tips.json` - Security tips database
- `recognition.json` - User achievements
- `leaderboard.csv` - Team rankings

## Data Flow

```
SecureCodeBox Scan Event
        ↓
[Webhook Received]
        ↓
Parse Payload ──────┬──→ [Scan Summary]
                    │
    [Load Data Files & APIs]
                    │
                    ├──→ [Leaderboard Data]
                    ├──→ [Recognition Data]
                    ├──→ [Goals Progress]
                    └──→ [Security Tip]
        ↓
[Aggregate All Data]
        ↓
[Build Adaptive Card]
        ↓
[Post to Teams]
        ↓
Team Notification
```

## Key Technologies

- **Express.js** - Web framework for webhook handling
- **TypeScript** - Type-safe development
- **Microsoft Adaptive Cards** - Rich message formatting
- **Teams Webhook API** - Message delivery
- **CSV & JSON** - Data persistence

## Deployment

See `DOCKER_DEPLOYMENT.md` for containerization and deployment options:
- Docker Compose (local development)
- AWS ECS (cloud deployment)
- Kubernetes (orchestration)

## Error Handling

The webhook handler includes:
- Try-catch blocks for all service calls
- Graceful error responses (500 status)
- Console logging for debugging
- Fallback values for missing data

## Environment Configuration

Required environment variables (see `.env`):
- `TEAMS_WEBHOOK_URL` - Microsoft Teams webhook endpoint
- `CYCODEAPI_URL` - Cycode API endpoint (optional)
- `CYCODEAPI_TOKEN` - Cycode authentication token
- `NODE_ENV` - Environment (production/development)
- `PORT` - Server port (default: 3000)
