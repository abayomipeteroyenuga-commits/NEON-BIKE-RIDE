# NEON BIKE RIDE v25 — UI, Checkpoint, Environment and Stability Audit

Implemented from the v24 CITY DRIVE-engine base.

## User-requested changes
- Compact mission/time panel to remove empty space.
- Lowered the KM/H speed box slightly.
- Lowered and compacted the tracker box below the map.
- Replaced old ring/beam checkpoint style with neon blade checkpoint pylons and crest markers.
- Added small environment tweaks while keeping the CITY DRIVE texture base: darker road tone, beach strip, canyon rocks, route totems, and road studs.

## Bug / lag / freezing fixes
- Mission and race marker objects now dispose geometry/materials when cleared.
- NPC/traffic simulation is throttled to about 30 Hz to reduce CPU load while rendering remains smooth.
- Pause/background clock protection added so mission timers do not punish the player after pause or app backgrounding.
- Traffic-light object count reduced from 25 intersections to 9 intersections, and stop logic now matches the reduced visible signal area.
- Urgent timer no longer pulses/flashes; it changes color only for safer viewing.
- Planter count reduced and geometry segments reduced for mobile performance.
- Save migration now creates a valid starter bike if old/corrupt saves have no valid garage entry.
- Save writes now sanitize campaign level and completed-level arrays.

## Progression audit
- 20 campaign levels present.
- Drive, job, upgrade, buy and race mission references resolve to matching destinations/POIs.
- Sequential campaign progression is preserved through completed-level normalization.
- Starting cash remains $30,000 for fresh games.

## Validation
- JavaScript syntax check passed for all js/*.js files.
- ZIP integrity test passed.
