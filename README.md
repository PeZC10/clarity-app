# Clarity — Think better. Decide well.

Your personal AI-powered decision engine. Built by Pedro Alvarez.

## Project Structure

```
clarity-app/
├── index.html        # Frontend — the full Clarity app
├── api/
│   └── chat.js       # Backend — Vercel serverless function (holds API key)
├── vercel.json       # Vercel deployment config
└── README.md
```

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial Clarity deployment"
git remote add origin https://github.com/YOUR_USERNAME/clarity-app.git
git push -u origin main
```

### 2. Set your API key in Vercel
Go to: Vercel Dashboard → clarity-app → Settings → Environment Variables
Add:
- Name:  ANTHROPIC_API_KEY
- Value: your-api-key-here

### 3. Deploy
```bash
vercel --prod
```

## Local Development
```bash
vercel dev
```
Then open http://localhost:3000

## Built With
- Vanilla HTML/CSS/JS (no framework needed)
- Vercel Serverless Functions
- Anthropic Claude API (claude-sonnet-4-20250514)
