# BIOTICWAW — approved visual identity (frozen at 1.3.1)

This is the approved design. It is frozen: do not change colours, fonts, shapes or the logo without the owner's written approval.
The same values are kept in `css/app.css` (the `:root` tokens and the dark-mode overrides) and in `manifest.webmanifest`.

## Colours (light theme)
| Token | Value | Use |
|---|---|---|
| `--deep` | #00167a | main dark blue (headings, selected) |
| `--royal` | #075BFF | links and accents |
| `--bg` | #f3f6fb | page background |
| `--card` | #ffffff | cards |
| `--ink` | #0f172a | main text |
| `--mute` | #56657c | secondary text |
| `--line` | #d9e2ee | borders |
| `--soft` | #eef4ff | soft panels |
| `--ok` / `--warn` / `--bad` | #0f7a4f / #9a5b00 / #b42318 | status colours |
| logo | #0B2E5C (navy) and #12A37A (green) | the shield and capsule mark |

Dark theme: the same tokens are redefined under `prefers-color-scheme: dark` and `[data-theme="dark"]` (background #0b1220, cards #131c2e, text #e6edf7).

## Typography
- Display: Cairo, then Segoe UI, Tahoma, sans-serif.
- Body: Tajawal, then Cairo, Segoe UI, Tahoma, sans-serif.
- Font sizes follow the scale 12, 13, 14, 15, 17, 20, 24 px, multiplied by the owner's size setting (0.85 to 1.3).

## Shapes
- Cards and panels: 12 to 14 px corner radius.
- Buttons, chips and pills: 99 px (fully rounded).
- Avatars and icon circles: 50%.
- Touch targets: at least 44 px on touch screens.

## Components that define the look
- **Header:** white bar with the logo in the centre, search on the start side, notifications on the end side.
- **Hero:** a coloured banner with an icon, a title and a short line (one colour per section).
- **Add button:** full-width dashed box with a blue circle-plus icon (`.oadd.otop`). Used for adding interactions and antibiotics.
- **Cards:** white, 1 px border `--line`, 12 to 14 px radius, a coloured edge for severity or status.
- **Bottom bar:** four sections, icon above label, the selected one in a green pill.

## Logo and icons
- `icon-192.png` and `icon-512.png` (the app icons), and the shield-and-capsule mark in the header.
- Theme colour for the browser bar: #00167a.

## Rule
Any visual change requires the owner's approval first. Changes are made on a new branch, shown on the preview, and only merged after approval.
