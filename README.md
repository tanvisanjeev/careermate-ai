# 🎯 CareerMate AI

> Built by **Tanvi Kadam**

An AI-powered dual-view career tool that matches resumes to job descriptions, generates cover letters, cold emails, LinkedIn messages, and runs ATS analysis for recruiters.

## ✨ Features

### 🎓 Student View
- Resume ↔ Job Description match score (0-100)
- Strengths & gaps analysis
- Auto-generated Cover Letter (downloadable)
- Cold Email to hiring manager
- LinkedIn connection message

### 💼 Recruiter View
- ATS scoring & keyword matching
- Candidate fit analysis (Strong / Potential / Not a Fit)
- Experience level detection
- Auto-generated interview invite or rejection email

## 🛠 Tech Stack
- **Next.js 14** (App Router)
- **Anthropic Claude API** (claude-sonnet-4-20250514)
- **Pure CSS-in-JS** (no UI library)

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/tanvisanjeev/careermate-ai.git
cd careermate-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your API key
```bash
cp .env.local.example .env.local
# Add your Anthropic API key inside .env.local
```

### 4. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

## 📄 License
MIT License © 2026 Tanvi Kadam
