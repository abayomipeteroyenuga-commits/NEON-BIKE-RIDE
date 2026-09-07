# NEON BIKE RIDE — Actual City Engine Build Audit

Base: uploaded `city-drive-bugs-progression-lag-fixed(1).zip`.

Implemented in this build:
- Rebranded visible game title and menu copy to NEON BIKE RIDE.
- Bike catalog is now the authoritative selection source; legacy street-car catalog cannot override the bike menu.
- 15 fictional bike definitions in `js/vehicles.js` remain save-compatible through old internal IDs.
- Starting cash fixed at $30,000.
- Start/Continue handoff auto-starts the current campaign mission when possible.
- Mission panel is always visible as a square mission box with current/next mission guidance.
- Large live GPS minimap and destination tracker are visible during play.
- Checkpoint/mission wording moved to bike/rider language.
- Player model generator uses a two-wheel superbike builder with explicit `wheelCount = 2` metadata.
- HUD and game canvas are forced to reliable full-screen dimensions for hostable browser play.

Validation to run before ZIP:
- `node --check js/*.js`
- static catalog check for 15 bikes and no `isMotorcycle: false`
- static boot check to ensure `ui.js` is not double-loaded as a classic script
- ZIP integrity test
