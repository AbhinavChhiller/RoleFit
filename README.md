# RoleFit - AI Resume Matcher

An AI-powered web application that analyzes how well a resume matches a job description.

## Features

- 📄 Resume input via text paste or PDF/DOCX upload
- 🎯 Match score with weighted breakdown (Skills 50%, Experience 30%, Role 20%)
- 🔍 Skill gap identification (matched, missing, partial)
- 💡 Actionable improvement suggestions
- 🌓 Light/dark mode support
- 📱 Responsive design

## Tech Stack

**Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui  
**Backend:** Node.js 20, Express 5, TypeScript  
**AI:** Google Gemini API (free tier)

## Getting Started

### Prerequisites

- Node.js 20+
- Google Gemini API Key ([Get one free](https://aistudio.google.com/apikey))

### Installation

```bash
# Install all dependencies
npm run install:all

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env and add your GEMINI_API_KEY
```

### Development

```bash
# Run both client and server
npm run dev

# Or run separately
npm run dev:client  # http://localhost:5173
npm run dev:server  # http://localhost:3000
```

### Build

```bash
npm run build
```

## Usage

1. Enter or upload your resume
2. Paste the job description
3. Click "Analyze Match"
4. Review your score, skill gaps, and suggestions

## License

MIT
