# NEON BIKE RIDE

Hostable web motorcycle game built from the CITY DRIVE engine texture/base and modified into a bike-focused game for Ethan Digital Academy.

## Test
Upload the whole folder to your domain and open `index.html`. For local testing, use `start-neon-bike-ride.bat` or run a simple local server, because some browsers block ES-module imports when double-clicking `index.html`.

## Included in this build
- Rebranded NEON BIKE RIDE interface.
- Motorcycle-only fictional bike catalog.
- Starting cash fixed at $30,000.
- Superbike model with exactly two wheel assemblies.
- Clear square mission box with current objective, next mission and reward.
- Visible live GPS/minimap and tracker arrow.
- CITY DRIVE texture/base retained but menus, HUD, mission text, POIs and labels modified for bikes.

## Vercel static deployment

This v30 build is static-hosting ready. Upload the contents of this ZIP so `index.html`, `css/`, `js/`, `assets/`, `vendor/`, and `vercel.json` are at the repository root.

Remove old backend/local-server files before deploying:
- server.js
- server.mjs
- server.py
- server.ps1
- api/
- server-ready.txt
- server-error.txt

Vercel settings:
- Framework Preset: Other
- Build Command: leave empty
- Output Directory: leave empty
- Install Command: leave empty
