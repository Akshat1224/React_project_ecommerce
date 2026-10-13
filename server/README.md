# NexCart local development

## Prerequisites

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB connection string
- Ollama, if you want natural-language replies from a local model

## Configure and start the server

From the repository root, install server dependencies and copy the example environment file:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Set `MONGODB_URI` and `JWT_SECRET` in `server/.env`. The example uses a local MongoDB database and a development JWT secret; use a unique secret outside local development. The JWT secret must remain the same between server restarts so existing login cookies remain valid. MongoDB creates the `nexcart` database when the application first writes data.

For free local AI replies, install Ollama and download the configured model:

```powershell
ollama pull qwen2.5:3b
```

Keep Ollama running at `http://127.0.0.1:11434`. No model-provider account or API key is needed. If Ollama is unavailable, chat falls back to catalog and FAQ responses based on MongoDB data.

Start the API and WebSocket server:

```powershell
npm run dev
```

The API listens on `http://localhost:5000`; the authenticated shopping assistant WebSocket is at `ws://localhost:5000/ws/chat`.

## Configure and start the client

In a second terminal from the repository root:

```powershell
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

The client example points API calls to `http://localhost:5000/api` and the assistant to `ws://localhost:5000/ws/chat`. `CORS_ORIGIN` accepts comma-separated origins; the example allows both `http://localhost:5173` and the deployed site `https://shoeshopawesome.netlify.app`. Set the actual frontend origin in the deployment environment if its hostname differs.

## Verify the assistant manually

Register or sign in through the local client. Open the chat launcher and check that it connects, then try a catalog search, a recommendation request, and an owned order-status query. Admin status changes should appear in the customer's open chat; refreshing the account orders page reloads current status from MongoDB.

AI is optional. To use a paid OpenAI-compatible provider instead, set `AI_PROVIDER=openai` (or `openai-compatible`), `AI_API_KEY`, and optionally `AI_MODEL` and `AI_BASE_URL` in `server/.env`.
