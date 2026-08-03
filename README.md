> [!CAUTION]
> Discord monitors quest automation. Some users have received warnings or account flags.
> AutoQuest includes safety measures (cooldowns, rate limiting, sequential completion) but **does not guarantee** you won't get flagged. Use at your own risk.

# AutoQuest for BetterDiscord

A BetterDiscord plugin that completes Discord quests in the background with safety-first defaults.

**Author:** [Kava4](https://github.com/Kava4)

## Features

- **Auto-accept & auto-claim** — enroll and claim rewards without clicking
- **Quest types** — video (fast), play game (~15 min), stream, activities
- **Reward filters** — codes, in-game items, decorations, orbs, Nitro trial
- **Safety** — one quest at a time, random pauses between quests, API throttling
- **Discord update resilient** — works with latest `taskConfigV2` quest format

## Install

1. Download [`AutoQuest.plugin.js`](https://raw.githubusercontent.com/Kava4/AutoQuest/main/AutoQuest.plugin.js)
2. Copy to `%AppData%/BetterDiscord/plugins/`
3. Enable in BetterDiscord → Settings → Plugins → AutoQuest
4. Accept the risk warning on first run

Or install via link:

```
https://betterdiscord.app/ghdl?url=https://raw.githubusercontent.com/Kava4/AutoQuest/main/AutoQuest.plugin.js
```

## Settings overview

| Section | What it does |
|---------|----------------|
| **General** | Auto-accept, auto-claim, one quest at a time |
| **Quest types** | Which quest kinds to farm (video is fastest) |
| **Rewards to farm** | Only complete quests that give rewards you want |
| **Safety** | Pause between quests and API slowdown (keep enabled) |
| **Advanced** | Fine-tune video speed and activity timing (optional) |

## Updates

BetterDiscord checks `@updateUrl` in the plugin header on reload. Bump `@version`, update the changelog in the file, and push to `main`.

```
https://raw.githubusercontent.com/Kava4/AutoQuest/main/AutoQuest.plugin.js
```
