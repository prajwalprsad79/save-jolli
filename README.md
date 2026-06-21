# Save Jolli 💕

A tiny phone game: **Akhi** fights a surprise foe each day to rescue her husband **Jolli** from his cage. Tap fast to fill the ring, land a big hit, win, and get a sweet message.

## How to play
- Open the game, tap **Start the rescue**.
- **Tap the teal button fast** — the gold ring fills up. A full ring = a big hit.
- Lv 1–3 foes go down in one charge, Lv 4–6 (mini-bosses) in two.
- Win to free Jolli, read his thank-you, and add a day to **Saved Jolli: N days**.

A new task + a random foe show up each day.

## How to run it
This is a plain web game — no installing anything.

**Quick test on this computer:** double-click `index.html`.
> Note: when opened as a file, the offline/home-screen extras are skipped, but the game plays fine.

**Best way (works on her phone, with an app icon):** put these files on any free static host and open the link on her phone, then use the browser's **Add to Home Screen**. Easiest options:
- Drag this folder onto **netlify.com/drop**, or
- Push to a GitHub repo and turn on **GitHub Pages**.

Ask me and I'll walk you through (or do) the hosting step.

## How to edit the content
Open **`data.js`** — it's all in there with instructions at the top:
- `PEOPLE` — the foes and their difficulty (1 easy … 6 mini-boss).
- `TASKS` — one mission per day (Day 1 = first task, and so on; loops after 30).
- `MESSAGES` — Jolli's thank-you note shown when Akhi wins (paired with the task).

Keep the commas, quotes, and brackets as they are. Add as many as you like.

## Files
| File | What it is |
|------|------------|
| `index.html` | the page + all the artwork |
| `styles.css` | colours and layout |
| `data.js` | **edit this** — people, tasks, messages |
| `game.js` | game logic (combat, daily foe, streak) |
| `icon.svg` | home-screen icon |
| `manifest.webmanifest`, `sw.js` | make it installable + work offline |
