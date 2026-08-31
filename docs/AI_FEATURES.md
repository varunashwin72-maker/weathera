# 3D Sky View + AI Assistant

## 3D Sky View
A live, interactive 3D scene (React Three Fiber / three.js) rendered on the home page. It reads the current condition and local day/night state and renders a matching scene — sun or moon, drifting clouds, falling rain or snow, or lightning flashes for storms. Drag to orbit; it re-renders automatically whenever you search a new city. No external 3D assets are loaded — everything is generated procedurally, so there's nothing extra to configure.

Source: `src/components/Weather3DScene.tsx`.

## AI Assistant
An embedded chat panel on the home page (the "Your weather copilot is ready" card), backed by a real LLM call — not canned text. Each message you send is sent along with the current weather bundle (temperature, conditions, hourly/daily outlook) already fetched by the app, so answers are grounded in the actual forecast rather than the model guessing.

Source: `src/components/AiAssistantPanel.tsx` (frontend) and `server/index.js` + `server/llm-client.js` (backend).

### Setup
1. Copy `.env.example` to `.env` and set:
   - `OPENAI_KEY=your_openai_api_key`
   - `PORT=3001` (optional, defaults to 3001)
2. Run both the frontend and the assistant backend together:
   ```bash
   npm run dev:all
   ```
   This starts Vite on `:3000` and the assistant server on `:3001`; Vite proxies `/api/*` requests to the backend automatically (see `vite.config.ts`).
3. Open the app, search a city, and click the sparkle button to chat.

If `OPENAI_KEY` is missing, the widget stays visible but shows a clear inline message instead of failing silently.

### Endpoint
`POST /api/assistant`
```json
{
  "weather": { "current": { ... }, "hourly": [...], "daily": [...] },
  "messages": [{ "role": "user", "content": "Do I need an umbrella?" }]
}
```
Returns `{ "reply": "..." }`. The server builds a system prompt from the weather bundle and forwards the conversation (last 12 turns) to the model in `server/llm-client.js` — swap that file out to use a different provider.

### Deploying
On Vercel/Netlify, the frontend (`dist/`) and the Express backend (`server/index.js`) need to be deployed separately (or the backend as a serverless function) — set `OPENAI_KEY` in that environment and point the frontend's `/api` calls at it (e.g. via a rewrite in `vercel.json`, or update the fetch URL in `AiAssistant.tsx`).

### Notes
- `/api/nowcast` and `/api/alerts` are kept in `server/index.js` for reference but require an OpenWeather **One Call 3.0** subscription (paid) and aren't called by the current frontend, which uses the free `2.5/weather` + `2.5/forecast` endpoints.
- Voice input/output can still be added via the browser's Web Speech API if desired — not wired up in this version.
