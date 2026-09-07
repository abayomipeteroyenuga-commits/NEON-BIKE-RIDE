# NEON BIKE RIDE v27 — No Empty Mission Box Audit

## User request
- Remove the empty space from the portrait rectangle box inside Level 1 gameplay.
- Keep the improved game-style font.

## Fixes applied
- Added a final v27 HUD override to force the mission panel to shrink-wrap only visible content.
- Removed forced portrait spacing by setting height/min-height/max-height/aspect-ratio to content sizing.
- Collapsed empty child rows inside the mission panel.
- Changed the mission panel from a tall block into an inline-flex compact HUD box.
- Cropped the countdown timer pill even further.
- Shortened active mission wording in `js/ui.js` so Level 1 displays compactly.
- Added a compact tracker override so the navigation box also avoids empty portrait-style space.
- Preserved the v26 game-style system font stack.

## Verification
- `node --check js/ui.js` passed.
- All files in `js/*.js` passed syntax checks.
- ZIP integrity passed after packaging.
