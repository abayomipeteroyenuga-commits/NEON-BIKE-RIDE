# NEON BIKE RIDE v28 — All-Level Mission Box Crop Audit

## User request
Implement the no-empty-space mission/portrait box behavior for all levels, not only Level 1.

## Implemented fixes

### 1. Global gameplay mission box crop
- Added a final CSS override in `css/responsive.css`, which loads after `css/hud.css`.
- The override applies to `#mission-panel` globally, so every campaign level and active mission uses the same compact sizing.
- Removed forced portrait behavior by setting:
  - `height:auto`
  - `min-height:0`
  - `max-height:none`
  - `aspect-ratio:auto`
  - compact padding/gap/line-height

### 2. Empty rows collapse for every level
- Added `.empty-row` support and strict empty-row CSS collapse.
- Empty mission title/objective/distance/help/reward rows now take zero height.
- Hidden timer rows take zero height and no border/padding.

### 3. Runtime text cleanup
- Updated `js/ui.js` to write mission panel text through compact row helpers.
- Every campaign level now uses shorter HUD text:
  - `L7 • BEACHFRONT SPRINT`
  - compact objective
  - compact distance/pay row
  - compact next-level preview
- Non-campaign jobs/races now clear unused reward rows so old text cannot remain and create extra height.

### 4. All-level campaign menu cards
- Applied compact layout to `.campaign-list .mission-card` and `.panel-body .mission-card`.
- Level list cards now remove extra margins/padding and shrink to content.

## Validation
- JavaScript syntax checks passed for all JS/server files.
- `css/responsive.css` is loaded after `css/hud.css`, so the all-level override wins.
- Verified that the override targets global IDs/classes, not Level 1-specific markup.
- ZIP integrity test passed.

## Notes
This change preserves v25/v26/v27 work: compact timer, sport-style font, cropped tracker, checkpoint/environment tweaks, and previous progression/stability fixes.
