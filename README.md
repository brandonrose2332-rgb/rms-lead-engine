# RMS Lead Engine

Automated lead finder for Real Merchant Services. Pulls service businesses from Google Places and tracks them through your sales pipeline.

---

## Deploy to Netlify (5 minutes)

### Step 1 — Upload this folder to GitHub
1. Go to github.com → New repository → name it `rms-lead-engine`
2. Upload all files from this folder (drag and drop works)
3. Click "Commit changes"

### Step 2 — Connect to Netlify
1. Go to netlify.com → Sign up free with your GitHub account
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub → select `rms-lead-engine`
4. Build settings are auto-detected — just click "Deploy site"

### Step 3 — Add your Google API key
1. In Netlify dashboard → go to Site configuration → Environment variables
2. Click "Add a variable"
3. Key: `GOOGLE_API_KEY`
4. Value: your Google Places API key
5. Click Save → then Redeploy the site

### Step 4 — Open your live URL
Netlify gives you a URL like `https://amazing-name-123.netlify.app`
Bookmark it on your phone. Done.

---

## Features
- Search any city or zip for service businesses
- 12 business categories (salons, auto, spas, etc.)
- Lead status tracking: New → Contacted → Follow-up → Closed
- Stats dashboard
- Export to CSV anytime
- Leads save to your browser automatically

---

## Getting a Google API Key
See: https://console.cloud.google.com
Enable: Places API + Geocoding API
Free tier: $200/month — more than enough for daily prospecting
