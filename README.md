> [!CAUTION]
> Discord monitors quest automation. Some users have received warnings or account flags.
> AutoQuest includes safety measures (cooldowns, rate limiting, sequential completion) but **does not guarantee** you won't get flagged. Use at your own risk.

# AutoQuest for BetterDiscord

A BetterDiscord plugin that completes Discord quests in the background with safety-first defaults.

**Author:** [Kava4](https://github.com/Kava4)

## Features

- **Safety & Timing** — cooldown between quests, API delays, slower video progress (all configurable)
- **Sequential completion** — one quest at a time (default)
- **Quest type filters** — video, desktop, stream, activity
- **Reward filters** — codes, in-game, decorations, orbs, premium
- **Optional UI** — quest count badges on the sidebar Quests button

## Install (manual)

1. Download [`AutoQuest.plugin.js`](https://raw.githubusercontent.com/Kava4/AutoQuest/main/AutoQuest.plugin.js)
2. Copy to `%AppData%/BetterDiscord/plugins/`
3. Enable in BetterDiscord → Settings → Plugins

Or install via link (after repo is public):

```
https://betterdiscord.app/ghdl?url=https://raw.githubusercontent.com/Kava4/AutoQuest/main/AutoQuest.plugin.js
```

## Releases & updates

BetterDiscord uses the `@updateUrl` in the plugin header for automatic updates. No custom updater needed.

### How to publish a new version

1. Edit `AutoQuest.plugin.js` and bump `@version` (e.g. `1.0.0` → `1.0.1`)
2. Add changelog entry in the `config.changelog` array inside the file
3. Commit and push to `main` on GitHub
4. (Optional) Create a GitHub Release tagged `v1.0.1` and attach `AutoQuest.plugin.js`

Users get updates when BetterDiscord checks `@updateUrl` on startup/reload.

### Repo structure

```
AutoQuest/
├── AutoQuest.plugin.js   ← must match @updateUrl path
└── README.md
```

The raw URL must stay in sync:

```
https://raw.githubusercontent.com/Kava4/AutoQuest/main/AutoQuest.plugin.js
```

## Submit to betterdiscord.app (official store)

1. Push plugin to a **public** GitHub repo
2. Go to [betterdiscord.app](https://betterdiscord.app) → **Connect** (Discord + GitHub)
3. Plugins → **+ Submit a Plugin**
4. Wait for review (can take days to weeks)

**Note:** Official submission has strict [guidelines](https://docs.betterdiscord.app/plugins/publishing/guidelines). Plugins that automate quests may be **denied** due to account risk. GitHub + `@updateUrl` distribution works without store approval.
