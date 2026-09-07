# NEON BIKE RIDE v29 — Active Bike Across All Missions Audit

## Request
Ensure the rider/player bike appears and stays active across all missions, including buy-bike missions and upgrade-bike missions.

## Fixes Implemented
- Added an active-bike guard that keeps the saved/selected bike valid, visible, and bound to the controller before world entry, campaign mission start, job start, race start, buying, and upgrading.
- Campaign missions now prevent accidental on-foot exit during active level play, so the game cannot fall back to the rider avatar while a mission is running.
- Garage now marks the current mission bike with a visible CURRENT MISSION BIKE badge.
- Upgrade missions now upgrade the current visible bike only, not a random inactive garage bike.
- Buy missions now switch to the newly purchased bike during the mission, keeping the player in a visible bike state.
- If a player already upgraded the bike before Level 3, reaching the garage can complete the upgrade mission.
- If a player already owns a second bike before the buy mission, reaching the Bike Marketplace can complete the buy mission.
- Save payload now repairs missing/invalid active bike references and falls back to a starter bike if a corrupt save has no bike.

## Validation
- JavaScript syntax checks passed for all JS files.
- Static checks confirmed active-bike guard is used by mission start, job start, race start, buy, upgrade, and world-entry paths.
- ZIP integrity check passed.
