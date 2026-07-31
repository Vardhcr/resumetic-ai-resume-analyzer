# TODO — Make Resumetic work on Mobile (Website, no PWA)

## Phase 1 — Fix the core mobile blocker
- [x] 1. Update `backend/app/main.py` — add `allow_origin_regex` for LAN IP origins (CORS fix)

## Phase 2 — Mobile UX polish
- [x] 2. Update `frontend/src/services/api.js` — HTTPS/mixed-content protection + better base-URL logging
- [x] 3. Update `frontend/src/App.jsx` — replace `alert()` with inline mobile-friendly error banner
- [x] 4. Update `README.md` — add "Test on Mobile" section (uvicorn `--host 0.0.0.0`, firewall note)
- [x] 5. Update `frontend/.env.example` — document `VITE_API_BASE_URL`

## Phase 3 — Verify
- [x] 6. Run `npm run build` in `frontend/` to confirm no build errors

