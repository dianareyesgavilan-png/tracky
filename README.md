# Tracky. V2

A simple visual food journal built to share with a nutritionist.

## What Tracky does

- Log a meal with a photo, time and short description
- Browse a photo-first daily history
- Track weight
- Track workouts / activity
- Sync weight and workouts from Apple Health through an iOS Shortcut
- Export a selected date range as a nutritionist-friendly PDF
- Switch between visual themes

Tracky V2 intentionally does **not** include calorie counting, macros, AI meal analysis, goals, streaks, presets or reminders.

## Stack

- React 18 + Vite
- Supabase database + Storage
- Vercel serverless API for Apple Health Shortcut sync
- Vercel Analytics

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend environment variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

The existing `supabase/schema.sql` is compatible with V2. The `daily_logs.workout` JSONB field now stores an array of workouts instead of a single object.

## Apple Health sync

Tracky exposes:

```text
POST /api/health
```

The Vercel deployment needs these server-side environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TRACKY_HEALTH_SYNC_TOKEN=a-long-random-private-token
```

`SUPABASE_SERVICE_ROLE_KEY` and `TRACKY_HEALTH_SYNC_TOKEN` must never use a `VITE_` prefix and must never be exposed to the browser.

The iOS Shortcut sends JSON similar to:

```json
{
  "userId": "YOUR_TRACKY_USER_ID",
  "date": "2026-09-30",
  "weight": 63.3,
  "workouts": [
    {
      "type": "Tennis",
      "duration": 72,
      "time": "18:10"
    }
  ]
}
```

Authenticate the request with either:

```text
Authorization: Bearer YOUR_TRACKY_HEALTH_SYNC_TOKEN
```

or a `token` field in the JSON body.

A practical Shortcut flow is:

1. Get current date.
2. Find the latest Weight health sample for today.
3. Find Workouts for today.
4. Convert workouts to `type`, `duration`, and `time` values.
5. Use **Get Contents of URL** → `POST` → JSON to `https://YOUR-TRACKY-DOMAIN/api/health`.
6. Run it automatically at a chosen time and/or after workouts.

## PDF export

History → **Export PDF** → choose the last 7, 14 or 30 days, or a custom date range. Tracky opens a clean printable report containing:

- meal photos
- meal descriptions and times
- daily weight
- workouts
- summary counts and average weight

Use the browser print dialog to save or share it as a PDF.

## V2 branch

The redesign is developed on `revive-v2` before merging into `main`.
