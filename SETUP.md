# Supabase Setup Instructions

This guide will help you set up the Supabase database for the leaderboard functionality.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free tier is sufficient)
3. Create a new organization if prompted

## Step 2: Create a New Project

1. Click "New Project"
2. Enter a project name (e.g., "rbd-game-leaderboard")
3. Set a strong database password (save this somewhere safe)
4. Choose a region close to your users
5. Click "Create new project" and wait for setup (1-2 minutes)

## Step 3: Create the Scores Table

1. In your project dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Paste the following SQL and click "Run":

```sql
-- Create the scores table
CREATE TABLE scores (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    display_name TEXT,
    team_score INTEGER NOT NULL,
    target_score INTEGER NOT NULL DEFAULT 50,
    is_win BOOLEAN DEFAULT FALSE,
    goals_achieved INTEGER DEFAULT 0,
    roles_played TEXT[] DEFAULT '{}'
);

-- Create an index for faster leaderboard queries
CREATE INDEX idx_scores_team_score ON scores(team_score DESC);
CREATE INDEX idx_scores_display_name ON scores(display_name);

-- Enable Row Level Security
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read scores
CREATE POLICY "Allow public read access" ON scores
    FOR SELECT USING (true);

-- Create policy to allow anyone to insert scores
CREATE POLICY "Allow public insert access" ON scores
    FOR INSERT WITH CHECK (true);
```

## Step 4: Get Your API Credentials

1. In the left sidebar, click "Project Settings" (gear icon at the bottom)
2. Click "API" in the settings menu
3. You'll see two values you need:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)

## Step 5: Configure the Website

1. Open `js/app.js` in your website files
2. Find these lines near the top:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

3. Replace them with your actual values:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-key-here';
```

4. Save the file

## Step 6: Test the Connection

1. Open your website in a browser
2. Go to the Score & Leaderboard page
3. Fill in a test score
4. Check "Add this score to the public leaderboard"
5. Enter a team name
6. Click "Save Score"
7. Check the Leaderboards tab to see if your score appears

## Troubleshooting

### Scores not saving?
- Check the browser console (F12 → Console tab) for errors
- Verify your Supabase URL and API key are correct
- Make sure the table was created successfully in Supabase

### Can't see the table in Supabase?
- Go to "Table Editor" in the left sidebar
- The "scores" table should appear there
- If not, run the SQL query again

### Getting CORS errors?
- This shouldn't happen with the default Supabase setup
- If it does, check Project Settings → API → Enable all CORS origins

## Local Storage Fallback

The website automatically falls back to browser local storage if:
- Supabase is not configured
- There's a connection error
- The user is offline

This means the leaderboard will still work locally, but scores won't be shared across devices/users until Supabase is properly configured.

## Security Notes

- The `anon` key is safe to include in client-side code
- Row Level Security (RLS) is enabled by default
- Only INSERT and SELECT operations are allowed publicly
- No one can UPDATE or DELETE existing scores through the API

## Optional: View/Manage Data

You can view and manage all submitted scores in the Supabase dashboard:

1. Go to "Table Editor" in the left sidebar
2. Click on the "scores" table
3. Here you can:
   - View all entries
   - Edit or delete entries manually
   - Export data as CSV

---

Need help? Contact the Resilience by Design team at [resiliencebydesign.com](https://resiliencebydesign.com)
