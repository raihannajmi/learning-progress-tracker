# Summary 03: Project Tooling, Workspace Setup & Gitignore Configuration

**Date:** 2026-08-22  
**Status:** Completed  
**Scope:** Root Workspace, Backend, Frontend `.gitignore` configurations, scripts, and Docker compose.

---

## 1. Gitignore Configurations

1. **Root `.gitignore` ([.gitignore](file:///Users/najmiraihan/Developer/learning-progress-tracker/.gitignore)):**
   - Ignores `node_modules/` and `*/node_modules/`.
   - Ignores production build artifacts (`dist/`, `dist-ssr/`, `.output/`, `.vinxi/`, `.tanstack/`, `.nitro/`, `.netlify/`, `.wrangler/`).
   - Ignores environment files (`.env`, `.env.local`, `*.local`) while preserving `.env.example`.
   - Ignores OS artifacts (`.DS_Store`, `Thumbs.db`) and IDE caches.

2. **Backend `.gitignore` ([backend/.gitignore](file:///Users/najmiraihan/Developer/learning-progress-tracker/backend/.gitignore)):**
   - Ignores `node_modules/`, `dist/`, `.env`, `.env.local`, `*.log`.

3. **Frontend `.gitignore` ([frontend/.gitignore](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/.gitignore)):**
   - Ignores `node_modules/`, `dist/`, `dist-ssr/`, `.netlify/`, `.tanstack/`, `.vinxi/`, `.output/`, `.nitro/`, `.env`, `.env.local`.

---

## 2. Workspace Script Helpers

Root `package.json` provides scripts to manage both apps:
- `pnpm dev:backend` $\rightarrow$ Runs Express backend on port 5001.
- `pnpm dev:frontend` $\rightarrow$ Runs Vite + TanStack frontend on port 3000.
- `pnpm db:migrate` $\rightarrow$ Runs Drizzle database migrations.
- `pnpm db:seed` $\rightarrow$ Seeds database with syllabus and test accounts.
- `pnpm db:test` $\rightarrow$ Executes the 9-part automated backend test suite.
