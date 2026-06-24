# Game of Vampires — Event Cheat Sheet

A reference tool for Game of Vampires events: stamina regen, diamond costs,
ranking rewards/titles, and a stamina calculator. Works as a single static
web page — no server or build step needed.

## Files

```
index.html                ← the page (open this)
gov-cheat-sheet.css       ← styling
gov-cheat-sheet-data.js   ← event data (edit event info here)
imgs/                     ← reward/currency icons (keep next to index.html)
```

Everything is relative-linked, so these files must stay together in the
same folder.

**To update event data** (stamina, rankings, rewards, new events), edit
`gov-cheat-sheet-data.js` — all the event info lives there, separated from the
page logic. Re-upload that one file to update the live site.

---

## Publishing to GitHub Pages (free hosting)

This gives you a public link like
`https://YOUR-USERNAME.github.io/REPO-NAME/` that you can paste into Discord.

### One-time setup

1. **Create a repository** on GitHub (e.g. named `gov-cheat-sheet`).
   Make it **Public** (Pages is free for public repos).

2. **Upload the files.** The easiest way:
   - On the repo's main page, click **Add file → Upload files**.
   - Drag in `index.html`, `gov-cheat-sheet.css`,
     `gov-cheat-sheet-data.js`, and the **entire `imgs` folder**.
   - Click **Commit changes**.

3. **Turn on Pages.**
   - Go to the repo's **Settings → Pages**.
   - Under **Build and deployment → Source**, choose **Deploy from a branch**.
   - Set **Branch** to `main` and folder to `/ (root)`. Click **Save**.

4. Wait ~1 minute. Refresh the Pages settings screen and it will show your live
   URL at the top. That's the link to share.

### Updating later (e.g. new event data)

- Edit `index.html` (or re-upload it), commit the change, and the live site
  updates automatically within a minute or so.

---

## Sharing in Discord

- Paste the GitHub Pages URL. Discord will show a basic link preview.
- Tip: pin the message or drop the link in a `#resources` channel so people
  can find it later.

## Notes

- **Fonts** load from Google Fonts, so the page looks best with an internet
  connection (which anyone opening a web link will have).
- **No data is collected.** Everything runs in the visitor's browser; the
  timezone/calculator state is not saved or sent anywhere.
- Works on phones and desktop. On narrow screens the table view automatically
  switches to cards.
