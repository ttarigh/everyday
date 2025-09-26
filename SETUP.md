# Daily Selfie Automation Setup

This document explains how to set up the daily selfie automation using GitHub Actions and Google's Gemini AI.

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### 1. GEMINI_API_KEY
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key for Gemini
- Add this as a repository secret named `GEMINI_API_KEY`

### 2. AUTOMATION_TOKEN
- Generate a random secure token (you can use `openssl rand -hex 32`)
- Add this as a repository secret named `AUTOMATION_TOKEN`
- This is used to authenticate the GitHub Actions workflow with your API

## Setting up GitHub Secrets

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with the exact names above

## Dependencies

The system requires the `@google/genai` package for proper Gemini AI integration:

```bash
npm install @google/genai
```

## How it Works

1. **Daily Schedule**: GitHub Actions runs every day at 12:00 PM EST (5:00 PM UTC)
2. **AI Generation**: 
   - Gemini 2.5 Flash Lite creates an image prompt based on days since September 25, 2025
   - Gemini 2.5 Flash Image Preview generates actual images using your original selfie
3. **Post Creation**: New post is added with AI-generated caption and hashtags
4. **Auto-commit**: Changes are automatically committed to the repository

## Manual Testing

You can test the system manually:

```bash
# Test without AI (uses placeholder)
curl -X POST http://localhost:3000/api/test-daily-post

# Test with full AI pipeline (requires API key)
curl -X POST \
  -H "Authorization: Bearer YOUR_AUTOMATION_TOKEN" \
  http://localhost:3000/api/create-daily-post
```

## File Structure

- `/.github/workflows/daily-post.yml` - GitHub Actions workflow
- `/data/posts.json` - Posts data storage
- `/pages/api/posts.js` - Posts CRUD API
- `/pages/api/generate-prompt.js` - Gemini prompt generation
- `/pages/api/generate-image.js` - Gemini image generation
- `/pages/api/create-daily-post.js` - Main automation endpoint
- `/pages/api/test-daily-post.js` - Testing endpoint

## Troubleshooting

- Check GitHub Actions logs if posts aren't being created
- Verify API keys are correctly set in repository secrets
- Ensure the workflow has write permissions to the repository
- Check that the Next.js app builds and starts successfully

## Future Enhancements

- Email notifications on failure
- Better image generation (when Gemini supports it)
- Analytics and metrics
- Backup storage options
