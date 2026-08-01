# TODO — Fix Resumetic on Mobile (Deployment Issue)

## Problem
The deployed Netlify site (`resumetic.netlify.app`) serves a **stale bundle** that
predates the mobile fixes. The latest mobile fixes exist in the repo but were never
deployed:
- No automatic fallback to the production Railway backend
- Old IP-detection tries to reach a local backend from any IP hostname
- No `VITE_API_BASE_URL` support in the deployed build
- `<title>frontend</title>` instead of the branded title

## Phase 1 — Code/config polish
- [ ] 1. Update `frontend/index.html` — branded title "Resumetic — AI Resume Analyzer"
- [ ] 2. Review/confirm `netlify.toml` build config is correct

## Phase 2 — Build & deploy
- [ ] 3. Run `npm run build` in `frontend/` to confirm no build errors
- [ ] 4. Commit changes and push to `origin/main` to trigger Netlify rebuild
- [ ] 5. (If needed) Deploy via Netlify CLI

## Phase 3 — Verify
- [ ] 6. Confirm Netlify now serves the latest bundle (contains fallback logic)
- [ ] 7. Verify mobile access works

