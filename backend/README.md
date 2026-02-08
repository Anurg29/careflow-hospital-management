# Hospital Queue & Bed Management (Django + Channels)

Minimal backend for live hospital status (beds, queue, predicted wait) with REST + WebSocket endpoints and a lightweight HTML control panel.

## Quick start
1. Create venv & install deps (internet needed):
   ```bash
   cd backend
   python3 -m venv .venv
   . .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Run migrations & seed (optional):
   ```bash
   python manage.py migrate
   python manage.py createsuperuser  # optional admin
   ```
3. Start dev server (in-memory channel layer):
   ```bash
   DJANGO_ALLOWED_HOSTS=localhost python manage.py runserver 0.0.0.0:8000
   ```
   For production / scale, start Redis and set `REDIS_URL=redis://localhost:6379/0`, then run via Daphne or Uvicorn:
   ```bash
   daphne -b 0.0.0.0 -p 8000 hospital_queue.asgi:application
   ```
4. Open the no-build frontend (served as static):
   - URL: `http://localhost:8000/static/ui/index.html`
   - Enter a hospital id (create via POST /api/hospitals/) then Connect WS or Poll.

## MongoDB option
- Set `MONGO_URL` to your cluster connection string (e.g. `mongodb+srv://...`), optionally `MONGO_DB_NAME` (default `careflow`).
- Install mongo deps: `pip install djongo pymongo[srv]`.
- Run `python manage.py migrate` after switching.

## API surface (DRF routers)
- `POST /api/hospitals/` name, address
- `POST /api/departments/` hospital, name
- `POST /api/beds/` hospital, label, status[, department, patient_name]
- `POST /api/queue/` hospital, patient_name[, department, symptoms]
- `POST /api/queue/{id}/start/` mark in progress
- `POST /api/queue/{id}/complete/` mark done
- `GET /api/appointments/?hospital=<id>[&is_booked=false]` list slots
- `GET /api/patient/queue/{id}/` patient-facing queue status + ETA
- `GET /api/dashboard/{hospital_id}/` admin metrics for charts (bed/queue counts + throughput)
- `GET /api/status/{hospital_id}/` aggregated live snapshot

WebSocket: `ws://<host>/ws/hospitals/<hospital_id>/` broadcasts snapshot on every bed/queue change or on client refresh message `{ "type": "refresh" }`.

## AI placeholder
`PredictionService` uses a moving average of the last five completed visits to estimate wait time; swap this with an ML model later.

## Notes
- CSRF is avoided by using DRF BasicAuthentication; lock down permissions before production.
- Static UI lives in `static/ui/` so it shares origin with the API (no CORS).
- Tests: `python manage.py test queueing` (requires deps installed).
