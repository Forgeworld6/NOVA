# NOVA

AI-powered automation agent and intelligent workspace.

## Project structure

- `frontend/` — React + Vite dashboard.
- `backend/` — Node.js + Express API.
- `backend/.env.example` — environment variable template.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

Open two terminals.

### 1. Start the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Add your Gemini API key to `backend/.env` as `GEMINI_API_KEY=your_key_here`.
Never put API keys in frontend files or commit a real `.env` file.

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

The frontend proxies `/api` requests to the backend at `http://localhost:3001`.

## Current status

- Responsive dashboard and chat interface: implemented.
- Express backend and health endpoint: implemented.
- Gemini chat endpoint: implemented; requires a private API key in the backend environment.
- Agent tool calling, persistent memory, file processing and workflow automation: planned for later milestones.

## Security

Keep secrets in environment variables. Do not commit `.env` files, private keys, passwords, or personal data. Review and approve consequential actions before an agent executes them.
