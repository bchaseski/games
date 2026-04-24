# Goalie Hero Shootout (iPad-friendly)

A lightweight soccer goalie shootout web app you can host and open on your son's iPad.

## Features
- Goalie shootout core gameplay (left / center / right dives)
- Increasing difficulty as score grows
- Score, saves, streak, and level tracking
- 30-second challenge mode for short sessions
- Best score saved locally on the device
- Offline support via service worker (after first load)

## Run locally
Because service workers require an HTTP origin, use a local server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Install on iPad
1. Host these files somewhere (GitHub Pages, Netlify, or your own server).
2. Open the game URL in Safari on iPad.
3. Tap **Share** → **Add to Home Screen**.
4. Launch from home screen for full-screen app-like behavior.

## Ideas for next features
- Penalty kicker mode where your son takes shots instead of only saving
- 2-player local turn mode
- Team/uniform chooser
- Fun unlockables (new gloves, balls, backgrounds)
