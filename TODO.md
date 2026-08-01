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
- [ ] 12. **Enable Pages in repo settings:** GitHub → Settings → Pages → Source: **GitHub Actions**.
      This is required before the `deploy-pages` action can publish. The workflow's
      **build job already succeeds**; once Pages is enabled, re-run the workflow (or push
      a trivial commit) and the deploy step will publish `frontend/dist` to
      `https://vardhcr.github.io/resumetic-ai-resume-analyzer/`.
- [ ] 13. Verify the GitHub Pages site serves the fixed bundle containing the mobile fallback logic.
- [ ] 14. Open the live URL on a phone and upload a resume PDF to confirm it works.

