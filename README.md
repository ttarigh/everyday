# everyday.tina.zone 📸

An AI-powered Instagram clone that posts a progressively aging selfie every day, showcasing world model capabilities.

## 🎯 Concept

This project demonstrates AI's ability to reason about temporal progression by generating realistic daily selfies that show gradual aging from a baseline photo. Each day, the AI generates an image showing "X days older" with realistic subtle changes, seasonal variations, and daily life scenarios.

## ✨ Features

- **Daily Automated Posts**: GitHub Actions generates a new aged selfie every day at noon
- **Tagged Collaborations**: Users can create collaborative posts with their own selfies
- **Visit Counter**: Tracks site visitors using Vercel KV
- **Story Viewer**: Instagram-style stories with real photos
- **Beautiful UI**: Pixel-perfect Instagram clone interface

## 🏗️ Architecture

**Fully static, GitHub-based:**
- GitHub Actions = automation + generation (has filesystem)
- Vercel = hosting (serverless, read-only)
- GitHub repo = database (JSON + images)
- Free external services = persistence where needed

This architecture is:
- ✅ Free to run
- ✅ No database costs
- ✅ Survives serverless limitations
- ✅ Simple to understand
- ✅ Git history = audit log

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/everyday.git
cd everyday
npm install
```

### 2. Set Up Environment Variables

Create `.env.local`:

```env
GEMINI_API_KEY=your-gemini-api-key
GITHUB_TOKEN=your-github-token
GITHUB_REPO_OWNER=yourusername
GITHUB_REPO_NAME=everyday
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### 5. Set Up Vercel KV (for visit counter)

1. Go to your Vercel project dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database** → **KV** (Redis)
4. Name it `everyday-kv` (or any name you prefer)
5. It will automatically link to your project

The KV store is free for up to 256MB and handles the visit counter.

### 6. Set Up GitHub Actions

Add `GEMINI_API_KEY` to repository secrets (Settings → Secrets and variables → Actions)

## 📖 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup and configuration guide
- [.github/workflows/daily-post.yml](./.github/workflows/daily-post.yml) - GitHub Actions workflow

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **AI**: Google Gemini 2.5 Flash (text) + Gemini 2.5 Flash Image Preview (images)
- **Hosting**: Vercel (serverless)
- **Storage**: GitHub (files + images)
- **Automation**: GitHub Actions

## 📁 Project Structure

```
everyday/
├── scripts/              # Generation scripts for GitHub Actions
├── pages/               # Next.js pages and API routes
├── data/                # JSON database files (committed)
├── public/              # Static assets and generated images
├── utils/               # Helper utilities (GitHub API, etc.)
└── styles/              # Global styles
```

## 🎨 How It Works

### Daily Posts

1. GitHub Actions triggers daily at noon
2. Script calculates days since baseline (Sep 25, 2025)
3. Calls Gemini to generate aging prompt
4. Calls Gemini to generate aged selfie image
5. Saves image and updates `data/posts.json`
6. Commits to GitHub
7. Vercel auto-deploys

### Tagged Posts

1. User submits selfie + optional prompt
2. API generates collaborative scene with Gemini
3. Creates composite image with both people
4. Commits via GitHub API
5. Triggers Vercel rebuild
6. User refreshes to see post

## 🔧 Development

### File Watching

```bash
npm run dev     # Start dev server with hot reload
npm run build   # Build for production
npm run start   # Start production server
```

### Manual Post Generation

```bash
# Generate a daily post manually
export GEMINI_API_KEY=your-key
node scripts/generate-daily-post.js
```

### Testing GitHub Actions Locally

Use [act](https://github.com/nektos/act) to test GitHub Actions locally:

```bash
brew install act
act -s GEMINI_API_KEY=your-key workflow_dispatch
```

## 🐛 Troubleshooting

**Posts not generating?**
- Check GitHub Actions logs
- Verify GEMINI_API_KEY in secrets
- Ensure workflow has write permissions

**Tagged posts failing?**
- Check GITHUB_TOKEN has `repo` scope
- Verify GEMINI_API_KEY in Vercel
- Check Vercel function logs

**Visit counter not working?**
- Ensure Vercel KV is set up (Storage tab)
- Check KV is linked to your project
- Falls back to 0 gracefully if KV unavailable

## 📝 License

MIT

## 🙏 Credits

- Built with [Next.js](https://nextjs.org)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Hosted on [Vercel](https://vercel.com)

---

Made with ☕ to showcase world model reasoning capabilities
