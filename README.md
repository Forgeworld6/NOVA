# NOVA

NOVA is an AI assistant workspace designed for clear conversations and, in later milestones, safe tool-assisted automation.

## Current implementation

- Responsive Apple-inspired light interface for desktop and mobile.
- React + Vite frontend.
- Node.js + Express backend.
- Gemini AI chat endpoint with short conversation context.
- Backend health status that distinguishes server availability from AI configuration.
- Server-side API key handling; no secret belongs in the frontend or repository.

## Run locally

Requirements: Node.js 20+ and npm.

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Set `GEMINI_API_KEY` in the private `backend/.env` file, then run:

```bash
npm run dev
```

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173). The Vite development server proxies `/api` requests to port 3001.

## Environment variables

- `GEMINI_API_KEY`: private provider key, required for AI replies.
- `GEMINI_MODEL`: optional model name; defaults to `gemini-2.5-flash`.
- `PORT`: optional backend port; defaults to `3001`.

Never commit a real `.env` file, paste API keys into chat, or place keys in frontend code. Use a private environment-variable setting on the backend host when deploying.

## Honest feature status

**Working in this milestone:** responsive workspace UI, health endpoint, Gemini-powered chat when a valid server key is configured, and recent conversation context sent with each request.

**Not connected yet:** live web search, file uploads/reading, persistent memory, user accounts, task history, third-party integrations, and automatic workflows. The interface marks these as upcoming rather than pretending they are active.

## Safety and reliability

NOVA must not claim an external action happened unless a connected integration confirms it. Add explicit approval for consequential actions, validate every tool input, apply usage limits, and keep secrets server-side before enabling automation.
