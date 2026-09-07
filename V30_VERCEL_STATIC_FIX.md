# NEON BIKE RIDE v30 — Vercel Static Fix

This package is a static-hosting build for Vercel.

Fixes:
- Removed server.js, server.mjs, server.py, server.ps1 and local server marker files.
- Removed api/ serverless function folder to prevent FUNCTION_INVOCATION_FAILED.
- Added Vercel static rewrite config.
- Ranking system now uses local/offline leaderboard only, so no /api request is needed.
- Files are packaged at ZIP root: index.html, css/, js/, assets/, vendor/.

Important deployment note:
Delete old server files from GitHub before redeploying. If server.js or api/ remains in the repository, Vercel may still run a function and crash.
