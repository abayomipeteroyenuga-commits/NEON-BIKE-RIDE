# NEON BIKE RIDE v26 — Timer Crop + HUD Font Polish

## User request
- Crop the box where the time counts so there is no empty space.
- Improve the font/style so the HUD looks more befitting for the game.

## Fixes applied
- Added a final v26 HUD override in `css/hud.css`.
- Countdown timer is now an inline compact pill instead of a tall/full-width box.
- Timer hidden state is now restored with `#mission-timer.hidden{display:none!important;}` so it cannot leave blank space when no active countdown exists.
- Mission panel padding, line-height and text margins reduced.
- Empty mission text rows now collapse with `:empty{display:none}`.
- HUD font stack changed to a sharper condensed game-style stack using local/system fonts only, so it still works when opened through `index.html` without internet font downloads.
- KM/H speed module remains lowered and compact.

## Stability note
No gameplay logic was changed in this pass. v25 checkpoint, environment, progression, save, timer safety and performance fixes are preserved.
