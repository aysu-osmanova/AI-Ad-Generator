# AI Ad Generator (local)

Quick scaffold for the Multi-Platform AI Ad Generator used in the assignment.

Setup

1. Copy `.env.example` to `.env` and fill in `OPENROUTER_API_KEY` (and optionally `OPENROUTER_MODEL`) to enable live OpenRouter calls.

```bash
cd ai-ad-generator
cp .env.example .env
npm install
npm start
```

2. Open `http://localhost:3000` in your browser.

Notes
- The server requires `OPENROUTER_API_KEY` to be configured. If the key is missing or OpenRouter calls fail, the server returns an error.
- Prompts and settings live in `.env` (see `.env.example`).
