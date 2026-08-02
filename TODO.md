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

## Phase 4 — Deploy the fixed bundle (NEW: GitHub Pages)
- [x] 7. Set Vite `base: './'` so the build works from the GitHub Pages sub-path
- [x] 8. Add GitHub Actions workflow `.github/workflows/deploy.yml` that builds `frontend/` and publishes `dist/` to GitHub Pages (Actions source)
- [x] 9. Update `.gitignore` — ignore diagnostic `scripts/` helpers and `upload_response.json`
- [x] 10. Update `README.md` — document the GitHub Pages live URL
- [x] 11. Push the workflow commit (commit `bcefd4a`, pushed to `origin/main`)

## Phase 5 — Enable GitHub Pages (ONE-TIME MANUAL STEP)
- [x] 12. **Enable Pages in repo settings:** GitHub → Settings → Pages → Source: **GitHub Actions**.
      The workflow's build job now succeeds; Pages deploys from Actions.
- [x] 13. Verify the GitHub Pages site serves the fixed bundle containing the mobile fallback logic.
- [ ] 14. Open the live GitHub Pages URL on a phone and upload a resume PDF to confirm it works.

## Phase 6 — Fix CORS for GitHub Pages origin on Railway backend
- [x] 15. **Diagnose CORS block** — Confirmed Railway backend drops `Access-Control-Allow-Origin`
      for `https://vardhcr.github.io` origin (browser blocks upload → ERR_NETWORK).
- [x] 16. **Add `https://vardhcr.github.io` to `allow_origins`** in `backend/app/main.py`
- [x] 17. **Extend `allow_origin_regex`** to also match `https://<user|org>.github.io`
- [x] 18. **Commit and push** the CORS fix to `main` (commit `a3ad937`)
- [x] 19. **Redeploy Railway backend** — CORS change now live; verified via preflight probes from
      BOTH `https://vardhcr.github.io` AND `https://resumetic.netlify.app` (HTTP 200 + ACAO confirmed).
      Full PDF upload from both origins returns HTTP 200 + `success:true`.

## Phase 7 — Surface real errors & deploy latest bundle
- [x] 20. **Verify backend end-to-end** — Upload from both deployed origins returns HTTP 200,
      `success:true`, full ATS analysis (tested via `scripts/e2e_test.ps1`).
- [x] 21. **Update `frontend/src/App.jsx` catch block** — surface the REAL error (HTTP status,
      server detail, or axios `ERR_NETWORK` code + attempted backend URL) instead of hiding it
      behind a generic mobile hint. Committed & pushed as `0bfdc5b`.
- [ ] 22. **Wait for GitHub Actions deploy** and verify `https://vardhcr.github.io/resumetic-ai-resume-analyzer/`
      now serves the latest bundle (`index-Clm5xKI4.js`) containing:
      - Railway fallback logic
      - `isProductionHost` context-aware messaging
      - Real-error surfacing
- [ ] 23. **Netlify redeploy** (`resumetic.netlify.app`) — currently serving STALE bundle
      (`index-QgmcDnDE.js`, no fallback). Redeploy to serve the latest code.
- [ ] 24. **Final phone test** — Open the deployed URL on a phone, upload a PDF, confirm analysis appears.
      If a network error occurs, the new message now shows the exact backend URL + error code
      so the root cause is visible instead of a generic message.

## Phase 8 — Verify deployed bundle (GitHub Pages)
- [x] 25. **Confirmed live GitHub Pages serves the LATEST bundle** (`index-Clm5xKI4.js`):
      - Railway fallback logic present
      - `isProductionHost` context-aware messaging present
      - Real-error surfacing present (`Network error`, HTTP status 413/500 handling)
- [ ] 26. **Netlify redeploy** (`resumetic.netlify.app`) — STILL serving stale `index-QgmcDnDE.js`
      without fallback. Redeploy Netlify (or use GitHub Pages URL which is current) for the mobile test.
- [x] 27. **Full end-to-end upload verified** from both origins (`vardhcr.github.io` + `resumetic.netlify.app`)
      → HTTP 200, `success:true`, complete ATS analysis returned from Railway backend.

