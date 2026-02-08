# CareFlow React Frontend

Vite + React UI for the Hospital Queue & Bed backend (Django + Channels). Includes REST flows, live WebSocket viewer, patient-facing status lookup, and admin analytics charts.

## Run locally
1) Install deps (requires internet):
   ```bash
   cd frontend
   npm install
   npm run dev -- --host 0.0.0.0 --port 5173
   ```
2) Backend must be running at `http://localhost:8000` (default). If different, set env:
   ```bash
   export VITE_API_BASE="https://your-backend" 
   export VITE_WS_BASE="wss://your-backend"  # optional, otherwise derived
   npm run dev
   ```
3) Open the printed URL. Create a hospital, note its ID, connect WS, then add queue entries/beds.
4) Tabs:
   - Dashboard: live status, current queue, realtime log.
   - Patient View: patient can enter queue ID to see ETA + upcoming appointment slots.
   - Analytics: admin charts (beds/queue breakdown, completions per hour).

## MongoDB backend note
If you want Django to store data in MongoDB, set `MONGO_URL` to your cluster (e.g. `mongodb+srv://anuragrokade965:anurag29@cluster1.1mvedwk.mongodb.net/?appName=Cluster1`) and install `djongo`/`pymongo`. Update `backend/requirements.txt` accordingly, then run migrations. The frontend just talks to the REST/WS endpoints—you only need to point it to the backend URL.

## Scripts
- `npm run dev` — dev server with HMR
- `npm run build` — production bundle
- `npm run preview` — preview the build
- `npm run lint` — eslint react hooks + refresh rules
