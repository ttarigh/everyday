# Setup Guide

This document explains how to set up and deploy your everyday selfie project.

## Architecture Overview

This project uses a **fully static, GitHub-based architecture**:

- **GitHub Actions** handles daily post generation (has filesystem access)
- **Vercel** serves the static Next.js app (serverless, read-only)
- **GitHub repository** acts as the database (JSON files + images)
- **External services** for features that need persistence (visit counter)

## Required Environment Variables

### For Vercel Deployment

Add these in your Vercel project settings:

#### 1. GEMINI_API_KEY
- Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Used for AI image and text generation
- **Required** for both daily posts and tagged posts

#### 2. GITHUB_TOKEN
- Generate a Personal Access Token with `repo` scope
- Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate new token with `repo` permissions
- Used for committing tagged posts from serverless functions
- **Required** for tagged posts feature

#### 3. GITHUB_REPO_OWNER
- Your GitHub username (e.g., `rumitarighian`)
- Default is set in code but can be overridden

#### 4. GITHUB_REPO_NAME
- Your repository name (e.g., `everyday`)
- Default is set in code but can be overridden

### For GitHub Actions

Add these as repository secrets (Settings → Secrets and variables → Actions):

#### 1. GEMINI_API_KEY
- Same as above
- **Required** for daily post generation

## How It Works

### Daily Posts (Automated)

```
GitHub Actions (daily at 12pm EST)
  ↓
  Runs scripts/generate-daily-post.js
  ↓
  Calls Gemini API to generate prompt & image
  ↓
  Saves to filesystem (public/ and data/posts.json)
  ↓
  Git commit + push to main branch
  ↓
  Vercel auto-deploys updated site
```

**Key benefit**: GitHub Actions has full filesystem access, so generation happens there.

### Tagged Posts (User-Initiated)

```
User submits form on website
  ↓
  POST to /api/create-tagged-post
  ↓
  Serverless function:
    - Generates collaborative image with Gemini
    - Commits files via GitHub API (using GITHUB_TOKEN)
    - Updates data/tagged-posts.json
  ↓
  GitHub commit triggers Vercel rebuild
  ↓
  User refreshes to see their post
```

**Key benefit**: Uses GitHub API to commit from serverless (no filesystem needed).

### Visit Counter

Uses free external service (countapi.xyz) for persistence across deployments.

## Manual Testing

### Test Daily Post Generation Locally

```bash
# Set environment variable
export GEMINI_API_KEY="your-key-here"

# Run the script
node scripts/generate-daily-post.js
```

This will generate a new post and save it to your local repository.

### Test Daily Post via GitHub Actions

1. Go to Actions tab in your GitHub repository
2. Select "Daily Selfie Post" workflow
3. Click "Run workflow" → "Run workflow"
4. Watch the logs to see if it succeeds

### Test Tagged Posts

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Click on "TAGGED" tab
# Click "Post with Me" button
# Fill out form and submit

# Note: Requires GITHUB_TOKEN and GEMINI_API_KEY in .env.local
```

## Deployment Checklist

- [ ] Create Vercel project linked to your GitHub repo
- [ ] Add GEMINI_API_KEY to Vercel environment variables
- [ ] Add GITHUB_TOKEN to Vercel environment variables  
- [ ] Add GEMINI_API_KEY to GitHub repository secrets
- [ ] Verify daily workflow runs (check Actions tab)
- [ ] Test tagged post creation works
- [ ] Visit counter increments properly

## File Structure

```
/
├── scripts/
│   └── generate-daily-post.js    # Daily generation script (runs in Actions)
├── utils/
│   └── github.js                  # GitHub API helper for commits
├── pages/
│   ├── index.js                   # Main Instagram UI
│   └── api/
│       ├── posts.js               # GET posts data
│       ├── tagged-posts.js        # GET tagged posts data
│       ├── create-tagged-post.js  # POST create tagged post
│       └── visits.js              # Visit counter (external service)
├── data/
│   ├── posts.json                 # Posts database (committed by Actions)
│   └── tagged-posts.json          # Tagged posts database (committed by API)
├── public/
│   ├── temp.jpg                   # Original baseline selfie
│   ├── generated-*.png            # Daily generated images
│   └── tagged/
│       ├── user-selfies/          # Uploaded user selfies
│       └── generated/             # Generated collaborative images
└── .github/workflows/
    └── daily-post.yml             # GitHub Actions workflow
```

## Troubleshooting

### Daily posts not generating
- Check GitHub Actions logs for errors
- Verify GEMINI_API_KEY is set in repository secrets
- Check if the workflow has write permissions

### Tagged posts failing
- Verify GITHUB_TOKEN has `repo` scope
- Check Vercel function logs
- Ensure GEMINI_API_KEY is set in Vercel

### Visit counter not working
- countapi.xyz might be down (try different service)
- Check browser console for errors
- Falls back to 0 if service unavailable

### Images not appearing after deployment
- Vercel auto-deploys when GitHub receives commits
- Wait 1-2 minutes for build to complete
- Check Vercel deployment logs

## Future Enhancements

- Email notifications on workflow failure
- More sophisticated aging algorithm
- Analytics dashboard
- Backup to cloud storage (S3, Cloudflare R2, etc.)
- Social media auto-posting
