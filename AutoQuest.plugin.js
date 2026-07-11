/**
 * @name AutoQuest
 * @description Complete Discord quests safely in the background with cooldowns and rate limiting.
 * @version 1.0.1
 * @author Kava4
 * @authorLink https://github.com/Kava4
 * @source https://github.com/Kava4/AutoQuest
 * @updateUrl https://raw.githubusercontent.com/Kava4/AutoQuest/main/AutoQuest.plugin.js
 */

const config = {
    changelog: [
        { title: "Bug Fix", type: "fixed", items: [
            "Fixed duplicate quest buttons and badges appearing on every UI re-render."
        ] },
        { title: "Initial Release", type: "added", items: [
            "AutoQuest initial release with safety-first defaults.",
            "Sequential quest completion, cooldowns, and API rate limiting.",
            "Configurable Safety & Timing settings.",
            "Safer module loading to prevent Discord UI crashes."
        ] },
    ],
    settings: [
        { type: "switch", id: "acceptQuestsAutomatically", name: "Accept Quests Automatically", note: "Whether to accept available quests automatically.", value: false },
        { type: "switch", id: "hasAcceptedToUsePlugin", name: "Issue Consent", note: "Set by the warning popup. If disabled, quest completion will not run.", value: false },
        { type: "switch", id: "completeQuestsSequentially", name: "Complete Quests Sequentially", note: "Whether to complete quests one at a time.", value: true, disabled: false },
        {
            type: "category", id: "safetyTiming", name: "Safety & Timing", collapsible: true, shown: true, settings: [
                { type: "switch", id: "enableQuestCooldown", name: "Quest Cooldown", note: "Wait between finishing one quest and starting the next.", value: true },
                { type: "slider", id: "questCooldownMinMinutes", name: "Cooldown Min (minutes)", note: "Minimum wait between quests.", value: 10, min: 0, max: 120, markers: [0, 10, 30, 60, 120] },
                { type: "slider", id: "questCooldownMaxMinutes", name: "Cooldown Max (minutes)", note: "Maximum wait between quests.", value: 30, min: 0, max: 180, markers: [0, 15, 30, 60, 120, 180] },
                { type: "switch", id: "enableApiDelay", name: "API Call Delay", note: "Add a random pause before each quest API request.", value: true },
                { type: "slider", id: "apiDelayMinSeconds", name: "API Delay Min (seconds)", note: "Minimum random delay before API calls.", value: 1, min: 0, max: 30, markers: [0, 1, 5, 15, 30] },
                { type: "slider", id: "apiDelayMaxSeconds", name: "API Delay Max (seconds)", note: "Maximum random delay before API calls.", value: 8, min: 0, max: 60, markers: [0, 5, 15, 30, 60] },
                { type: "slider", id: "videoChunkMinSeconds", name: "Video Chunk Min (seconds)", note: "Smallest video progress step per update.", value: 2, min: 1, max: 15, markers: [1, 2, 5, 10, 15] },
                { type: "slider", id: "videoChunkMaxSeconds", name: "Video Chunk Max (seconds)", note: "Largest video progress step per update.", value: 4, min: 1, max: 20, markers: [1, 4, 7, 10, 20] },
                { type: "slider", id: "videoSlowdownMinPercent", name: "Video Slowdown Min (%)", note: "Minimum extra wait vs realtime (120 = 1.2× slower).", value: 120, min: 100, max: 300, markers: [100, 120, 150, 200, 300] },
                { type: "slider", id: "videoSlowdownMaxPercent", name: "Video Slowdown Max (%)", note: "Maximum extra wait vs realtime (160 = 1.6× slower).", value: 160, min: 100, max: 400, markers: [100, 160, 200, 300, 400] },
                { type: "slider", id: "videoExtraJitterMaxSeconds", name: "Video Extra Jitter (seconds)", note: "Up to this many extra random seconds per video update.", value: 3, min: 0, max: 15, markers: [0, 3, 5, 10, 15] },
                { type: "slider", id: "heartbeatMinSeconds", name: "Activity Heartbeat Min (seconds)", note: "Minimum wait between activity quest heartbeats.", value: 18, min: 10, max: 120, markers: [10, 18, 30, 60, 120] },
                { type: "slider", id: "heartbeatMaxSeconds", name: "Activity Heartbeat Max (seconds)", note: "Maximum wait between activity quest heartbeats.", value: 28, min: 10, max: 180, markers: [10, 28, 60, 120, 180] },
            ]
        },
        {
            type: "category", id: "uiElements", name: "UI Elements", collapsible: true, shown: false, settings: [
                { type: "switch", id: "showQuestsButtonTitleBar", name: "Show Quests Title Bar", note: "Whether to show the quests button in the title bar.", value: true },
                { type: "switch", id: "showQuestsButtonSettingsBar", name: "Show Quests Settings Bar", note: "Whether to show the quests button in the settings bar.", value: true },
                { type: "switch", id: "showQuestsButtonBadges", name: "Show Quests Badges", note: "Whether to show badges on the quests button.", value: true },
            ]
        },
        {
            type: "category", id: "questTypeFilters", name: "Quest Type Filters", collapsible: true, shown: false, settings: [
                { type: "switch", id: "farmVideos", name: "Videos", note: "Whether to farm video quests automatically.", value: true },
                { type: "switch", id: "farmPlayOnDesktop", name: "Play On Desktop", note: "Whether to farm desktop games quests automatically.", value: true },
                { type: "switch", id: "farmStreamOnDesktop", name: "Streaming", note: "Whether to farm streaming quests automatically.", value: true },
                { type: "switch", id: "farmPlayActivity", name: "Activities", note: "Whether to farm activities quests automatically.", value: true },
            ]
        },
        {
            type: "category", id: "questRewardsFilters", name: "Quest Rewards Filters", collapsible: true, shown: false, settings: [
                { type: "switch", id: "farmRewardCodes", name: "Reward Codes", note: "Whether to farm reward codes automatically.", value: true },
                { type: "switch", id: "farmInGame", name: "In Game (Quests)", note: "Whether to farm in-game quests automatically.", value: true },
                { type: "switch", id: "farmCollectibles", name: "Collectibles (Decorations)", note: "Whether to farm discord user appearance decorations automatically.", value: true },
                { type: "switch", id: "farmVirtualCurrency", name: "Virtual Currency (Orbs)", note: "Whether to farm orbs automatically.", value: true },
                { type: "switch", id: "farmFractionalPremium", name: "Fractional Premium", note: "Whether to farm fractional premium automatically.", value: true },
            ]
        },
        { type: "dropdown", id: "questMenuFilter", name: "Quest Menu Filter", note: "The filter to use in the quest menu.", value: "recently_enrolled", options: [
            { label: "Suggested", value: "suggested" },
            { label: "Most Recent", value: "most_recent" },
            { label: "Expiring Soon", value: "expiring_soon" },
            { label: "Started", value: "recently_enrolled" },
        ]},
    ]
};
function getSetting(key) {
    return config.settings.reduce((found, setting) => found ? found : (setting.id === key ? setting : setting.settings?.find(s => s.id === key)), undefined)
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function randomDelayMs(minMs, maxMs) {
    return Math.round(randomBetween(minMs, maxMs));
}

function randomIntBetween(min, max) {
    return Math.floor(randomBetween(min, max + 1));
}

const { Webpack, Data, UI, Patcher, DOM, React, ReactUtils, Components, Utils, Plugins, Logger } = BdApi;
const { Filters } = Webpack;
const { Tooltip, Flex } = Components;

let DiscordModules;
let ApplicationStreamingStore;
let RunningGameStore;
let QuestsStore;
let ChannelStore;
let GuildChannelStore;
let RestApi;
let QuestApplyAction;
let QuestLocationMap;
let QuestIcon;
let navigateToQuestHomeObj;
let CountBadge;
let windowArea;
let SettingsBarModule;
let trailingModule;
let SettingsBarButton;
let TopBarButtonModule;
let navigateToQuestHome;
let TopBarButtonKey;
let QuestButtonWithKey;
let SortingFilterWithKey;
let trailing = "";
let modulesLoaded = false;
let modulesReady = false;

function resolveNavigateToQuestHome() {
    if (typeof navigateToQuestHomeObj?.navigateToQuestHome === "function") {
        return navigateToQuestHomeObj.navigateToQuestHome;
    }

    try {
        const routerModule = Webpack.getModule(m => {
            const exports = m?.exports ?? m?.default ?? m;
            if (!exports || typeof exports !== "object") return false;
            return Object.values(exports).some(prop =>
                typeof prop === "function" && prop.toString().includes("transitionTo -")
            );
        }, { searchExports: true });

        const transitionTo = routerModule && Object.values(routerModule.exports ?? routerModule).find(prop =>
            typeof prop === "function" && prop.toString().includes("transitionTo -")
        );

        if (transitionTo) {
            return () => transitionTo("/quest-home");
        }
    } catch (err) {
        Logger.warn("AutoQuest", "Router fallback unavailable", err);
    }

    return undefined;
}

function loadDiscordModules() {
    if (modulesLoaded) return modulesReady;
    modulesLoaded = true;

    try {
        [DiscordModules, ApplicationStreamingStore, RunningGameStore, QuestsStore,
            ChannelStore, GuildChannelStore, RestApi, QuestApplyAction, QuestLocationMap,
            QuestIcon, navigateToQuestHomeObj, CountBadge,
            windowArea, SettingsBarModule, trailingModule,
            SettingsBarButton, TopBarButtonModule] = Webpack.getBulk(
                { filter: Filters.byKeys("subscribe", "dispatch"), searchExports: true },
                { filter: Filters.byStoreName("ApplicationStreamingStore") },
                { filter: Filters.byStoreName("RunningGameStore") },
                { filter: Filters.byKeys("getQuest") },
                { filter: Filters.byStoreName("ChannelStore") },
                { filter: Filters.byStoreName("GuildChannelStore") },
                { filter: m => typeof m === "object" && m.del && m.put, searchExports: true },
                { filter: Filters.byStrings("type:\"QUESTS_ENROLL_BEGIN\""), searchExports: true },
                { filter: Filters.byKeys("QUEST_HOME_DESKTOP", "11"), searchExports: true },
                { filter: Filters.bySource("\"M7.5 21.7a8.95") },
                { filter: Filters.byKeys("navigateToQuestHome") },
                { filter: Filters.byStrings("renderBadgeCount", "disableColor"), searchExports: true },
                { filter: Filters.bySource("windowKey:", "showDivider:") },
                { filter: Filters.byStrings("handleToggleSelfMute"), searchExports: true },
                { filter: Filters.byKeys("bar", "trailing") },
                { filter: Filters.byStrings("keyboardShortcut", "positionKey"), searchExports: true },
                { filter: Filters.bySource("iconClassName:", "children:", "badgePosition:") }
            ) ?? [];

        navigateToQuestHome = resolveNavigateToQuestHome();

        TopBarButtonKey = TopBarButtonModule ? Object.keys(TopBarButtonModule).find(key => {
            if (!TopBarButtonModule[key]?.render) return false;
            const funcStr = TopBarButtonModule[key].render.toString();
            return funcStr.includes("iconClassName:") && funcStr.includes("children:") && funcStr.includes("badgePosition:");
        }) : undefined;

        QuestButtonWithKey = [...(Webpack.getWithKey(Filters.byStrings("focusProps:", "interactiveClassName:")) ?? [])];
        SortingFilterWithKey = [...(Webpack.getWithKey(Filters.byStrings("selectedSortMethod", "onChange", "radioBarClassName"), { searchExports: true }) ?? [])];
        trailing = trailingModule?.trailing ?? "";

        modulesReady = !!(QuestsStore?.quests && RestApi?.post && DiscordModules?.dispatch);
        if (!modulesReady) {
            Logger.error("AutoQuest", "Core Discord modules missing. Quest farming disabled.");
        }
    } catch (err) {
        modulesReady = false;
        Logger.error("AutoQuest", "Failed to load Discord modules", err);
    }

    return modulesReady;
}

function getQuestIcon() {
    if (!QuestIcon || typeof QuestIcon !== "object") return undefined;
    const key = Object.keys(QuestIcon)[0];
    return key ? QuestIcon[key] : undefined;
}

const AUTOQUEST_TITLE_BAR_KEY = "autoquest-title-bar";
const AUTOQUEST_SETTINGS_BAR_KEY = "autoquest-settings-bar";
const AUTOQUEST_BADGES_KEY = "autoquest-quest-badges";

function hasInjectedChild(children, key, className) {
    if (!Array.isArray(children)) return false;
    return children.some(child => child?.key === key || (className && child?.props?.className?.includes?.(className)));
}

function reRender(selector, patchId) {
    if (!selector || selector === ".") return;
    const target = document.querySelector(selector)?.parentElement;
    if (!target) return;
    try {
        const instance = ReactUtils.getOwnerInstance(target);
        if (!instance?.forceUpdate) return;
        const unpatch = Patcher.instead(patchId, instance, "render", () => {
            try { return unpatch(); }
            catch (e) { console.error(`[${patchId}] Error in unpatch render`, e); }
        });
        instance.forceUpdate(() => instance.forceUpdate());
    } catch (e) {
        console.error(`[${patchId}] Error in reRender`, e);
    }
}

module.exports = class BasePlugin {
    constructor(meta) {
        this.meta = meta;

        this.settings = new Proxy({}, {
            get: (_target, key) => {
                return Data.load(this.meta.name, key) ?? getSetting(key)?.value;
            },
            set: (_target, key, value) => {
                Data.save(this.meta.name, key, value);
                getSetting(key).value = value;
                return true;
            }
        });

        this.handleUpdateQuests = this.updateQuests.bind(this);

        this.completingQuests = new Map();
        this.fakeGames = new Map();
        this.fakeApplications = new Map();
        this.questCooldownUntil = 0;
        this.cooldownTimeout = null;
    }

    initSettings(settings = config.settings) {
        settings.forEach(setting => {
            if (setting.settings) {
                this.initSettings(setting.settings);
            } else if (setting.id) {
                this.settings[setting.id] = Data.load(this.meta.name, setting.id) ?? setting.value;
            }
        });
    }

    getSettingsPanel() {
        return UI.buildSettingsPanel({
            settings: config.settings,
            onChange: (category, id, value) => {
                this.settings[id] = value;
                switch (id) {
                    case "hasAcceptedToUsePlugin":
                        if (!value) {
                            this.stopAllFarming();
                            UI.showToast(`[${this.meta.name}] Consent is required to use this plugin. Disabling plugin.`, { type: "warning" });
                            setTimeout(() => Plugins.disable(this.meta.name), 0);
                        }
                        break;
                    case "showQuestsButtonTitleBar":
                        if (value) {
                            this.patchTitleBar();
                        } else {
                            this.unpatchTitleBar();
                        }
                        break;
                    case "completeQuestsSequentially":
                        if (value) {
                            this.stopCompletingAll();
                        }
                        this.updateQuests();
                        break;
                }
            }
        });
    }

    showChangelog() {
        const savedVersion = Data.load(this.meta.name, "version");
        if (savedVersion !== this.meta.version) {
            if (config.changelog.length > 0) {
                UI.showChangelogModal({
                    title: this.meta.name,
                    subtitle: this.meta.version,
                    changes: config.changelog
                });
            }
            Data.save(this.meta.name, "version", this.meta.version);
        }
    }

    async ensureHasAcceptedToUsePlugin() {
        if (this.settings.hasAcceptedToUsePlugin === true) {
            return true;
        }

        const warningImage = "https://github.com/user-attachments/assets/db4c7641-dd57-412e-a625-f39a363f2138";

        return await new Promise(resolve => {
            UI.showConfirmationModal(
                "Important Notice",
                React.createElement("div", {
                    style: {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "12px",
                        textAlign: "center",
                        width: "100%"
                    }
                },
                React.createElement("img", {
                    src: warningImage,
                    alt: "Discord warning",
                    style: {
                        width: "100%",
                        maxWidth: "420px",
                        height: "auto",
                        objectFit: "contain",
                        borderRadius: "8px"
                    }
                }),
                React.createElement("div", { style: { lineHeight: "1.5" } },
                    "Discord actively monitors quest automation. Some users have already received warnings or account flags.",
                    React.createElement("br"),
                    React.createElement("br"),
                    "This version includes safety measures (one quest at a time, 10–30 min cooldown, random API delays, slower video progress), but it ",
                    React.createElement("strong", null, "does not guarantee"),
                    " you won't get flagged.",
                    React.createElement("br"),
                    React.createElement("br"),
                    "Use at your own risk."
                )),
                {
                    confirmText: "Yes, I understand the risks",
                    cancelText: "No, disable plugin",
                    danger: true,
                    onConfirm: () => {
                        this.settings.hasAcceptedToUsePlugin = true;
                        resolve(true);
                    },
                    onCancel: () => {
                        this.settings.hasAcceptedToUsePlugin = false;
                        resolve(false);
                    }
                }
            );
        });
    }

    start() {
        this.initSettings();
        this.showChangelog();

        if (!loadDiscordModules()) {
            UI.showToast(`[${this.meta.name}] Discord modules not found. Plugin disabled.`, { type: "error", forceShow: true });
            setTimeout(() => Plugins.disable(this.meta.name), 0);
            return;
        }

        this.ensureHasAcceptedToUsePlugin().then(hasConsent => {
            if (!hasConsent) {
                this.stopAllFarming();
                UI.showToast(`[${this.meta.name}] Consent not accepted. Plugin disabled.`, { type: "warning", forceShow: true });
                setTimeout(() => Plugins.disable(this.meta.name), 0);
                return;
            }
            this.startAfterConsent();
        }).catch(err => {
            this.stopAllFarming();
            Logger.error(this.meta.name, "Failed to resolve consent modal", err);
            UI.showToast(`[${this.meta.name}] Failed to show consent popup. Plugin disabled.`, { type: "error", forceShow: true });
            setTimeout(() => Plugins.disable(this.meta.name), 0);
        });
    }

    startAfterConsent() {
        if (!modulesReady) return;

        DOM.addStyle(this.meta.name, `.quest-button-enrollable > span[class*="iconBadge"] { background-color: var(--status-danger);}
            .quest-button-enrolled > span[class*="iconBadge"] { background-color: var(--status-warning); }
            .quest-button-claimable > span[class*="iconBadge"] { background-color: var(--status-positive); }
            .quest-button svg:has(> [mask^="url(#svg-mask-panel-button)"]) { display: none; }`);

        if (RunningGameStore && ApplicationStreamingStore) try {
            Patcher.instead(this.meta.name, RunningGameStore, "getRunningGames", (_, _args, originalFunction) => {
                try {
                    if (this.fakeGames.size > 0) {
                        return Array.from(this.fakeGames.values());
                    }
                    return originalFunction();
                } catch (e) {
                    console.error(`[${this.meta.name}] Error in getRunningGames patch`, e);
                    return originalFunction();
                }
            });
            Patcher.instead(this.meta.name, RunningGameStore, "getGameForPID", (_, [pid], originalFunction) => {
                try {
                    if (this.fakeGames.size > 0) {
                        return Array.from(this.fakeGames.values()).find(game => game.pid === pid);
                    }
                    return originalFunction(pid);
                } catch (e) {
                    console.error(`[${this.meta.name}] Error in getGameForPID patch`, e);
                    return originalFunction(pid);
                }
            });
            Patcher.instead(this.meta.name, ApplicationStreamingStore, "getStreamerActiveStreamMetadata", (_, _args, originalFunction) => {
                try {
                    if (this.fakeApplications.size > 0) {
                        return Array.from(this.fakeApplications.values()).at(0);
                    }
                    return originalFunction();
                } catch (e) {
                    console.error(`[${this.meta.name}] Error in getStreamerActiveStreamMetadata patch`, e);
                    return originalFunction();
                }
            });
        } catch (err) {
            console.error(`[${this.meta.name}] Failed to patch activity stores:`, err);
        }

        if (this.settings.showQuestsButtonTitleBar) {
            this.patchTitleBar();
        }

        if (SettingsBarModule?.prototype) {
        const settingsBarMap = new WeakMap();
        try {
            Patcher.after(this.meta.name, SettingsBarModule.prototype, "render", (_, _args, returnValue) => {
                try {
                    if (this.settings.showQuestsButtonSettingsBar && Array.isArray(returnValue?.props?.children) && typeof returnValue.props.children[0]?.props?.children === "function") {
                        const f1 = returnValue.props.children[0]?.props?.children;
                        returnValue.props.children[0].props.children = (e) => {
                            try {
                                const c1 = f1(e);
                                if (Array.isArray(c1?.props?.children) && typeof c1.props.children[2]?.type === "function") {
                                    const originalType = c1.props.children[2].type;
                                    if (!settingsBarMap.has(originalType)) {
                                        const wrapper = (props) => {
                                            try {
                                                const c2 = originalType(props);
                                                if (Array.isArray(c2?.props?.children) && !hasInjectedChild(c2.props.children, AUTOQUEST_SETTINGS_BAR_KEY)) {
                                                    c2.props.children.unshift(React.createElement(this.QuestButton, { type: "settings-bar", key: AUTOQUEST_SETTINGS_BAR_KEY }));
                                                }
                                                return c2;
                                            } catch (we) {
                                                console.error(`[${this.meta.name}] Error in SettingsBarModule wrapper`, we);
                                                return originalType(props);
                                            }
                                        };
                                        settingsBarMap.set(originalType, wrapper);
                                    }
                                    c1.props.children[2].type = settingsBarMap.get(originalType);
                                }
                                return c1;
                            } catch (fe) {
                                console.error(`[${this.meta.name}] Error in SettingsBarModule f1 wrapper`, fe);
                                return f1(e);
                            }
                        }
                    }
                } catch (e) {
                    console.error(`[${this.meta.name}] Error in SettingsBarModule patch`, e);
                }
                return returnValue;
            });
        } catch (err) {
            console.error(`[${this.meta.name}] Error patching SettingsBarModule:`, err);
        }
        }

        if (QuestButtonWithKey?.length >= 2) try {
            Patcher.after(this.meta.name, QuestButtonWithKey[0], QuestButtonWithKey[1], (_, args, returnValue) => {
                    if (this.settings.showQuestsButtonBadges) {
                        try {
                            const component = Utils.findInTree(
                                returnValue?.props?.children,
                                m => Array.isArray(m?.props?.children) && m.props?.to?.pathname === "/quest-home",
                                {
                                    walkable: ["props", "children"],
                                    ignore: ["_owner", "stateNode", "return", "alternate"]
                                }
                            );

                            if (component && Array.isArray(component.props.children) && !hasInjectedChild(component.props.children, AUTOQUEST_BADGES_KEY, "quest-button-badges")) {
                                component.props.children.push(React.createElement(this.QuestsCount, { key: AUTOQUEST_BADGES_KEY }));
                            }
                        } catch (err) {
                            console.warn(`[${this.meta.name}] Might have failed to inject quests button badges:`, err);
                        }
                    }
                
                return returnValue;
            });
        } catch (err) {
            console.error(`[${this.meta.name}] Failed to patch QuestButtonWithKey:`, err);
        }

        if (SortingFilterWithKey?.length >= 2) {
        let lastOnChange = null;
        try {
            Patcher.instead(this.meta.name, SortingFilterWithKey[0], SortingFilterWithKey[1], (_, args, originalFunction) => {
                try {
                    if (args[0]?.onChange && args[0]?.selectedSortMethod) {
                        args[0].selectedSortMethod = this.settings.questMenuFilter;
                        const originalOnChange = args[0].onChange;
                        args[0].onChange = (value) => {
                            this.settings.questMenuFilter = value;
                            originalOnChange(value);
                        };
                        if (lastOnChange !== originalOnChange) {
                            lastOnChange = originalOnChange;
                            setTimeout(() => {
                                originalOnChange(this.settings.questMenuFilter);
                            }, 100);
                        }
                    }
                    return originalFunction(...args);
                } catch (e) {
                    console.error(`[${this.meta.name}] Error in SortingFilterWithKey patch`, e);
                    return originalFunction(...args);
                }
            });
        } catch (err) {
            console.error(`[${this.meta.name}] Failed to patch SortingFilterWithKey:`, err);
        }
        }

        QuestsStore?.addChangeListener(this.handleUpdateQuests);
    }

    stop() {
        QuestsStore?.removeChangeListener(this.handleUpdateQuests);
        this.stopAllFarming();
        Patcher.unpatchAll(this.meta.name);
        this.unpatchTitleBar();
        DOM.removeStyle(this.meta.name);
    }

    stopAllFarming() {
        this.stopCompletingAll();

        if (this.fakeGames.size > 0 && RunningGameStore && DiscordModules) {
            const removedGames = Array.from(this.fakeGames.values());
            this.fakeGames.clear();
            const games = RunningGameStore.getRunningGames();
            DiscordModules.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: removedGames, added: games, games });
        }

        if (this.fakeApplications.size > 0) {
            this.fakeApplications.clear();
        }

        if (this.ignoredQuests) {
            this.ignoredQuests.clear();
        }

        this.clearQuestCooldown();
    }

    clearQuestCooldown() {
        if (this.cooldownTimeout) {
            clearTimeout(this.cooldownTimeout);
            this.cooldownTimeout = null;
        }
        this.questCooldownUntil = 0;
    }

    isOnQuestCooldown() {
        return Date.now() < this.questCooldownUntil;
    }

    getSafeRange(minKey, maxKey) {
        const minSetting = getSetting(minKey);
        const maxSetting = getSetting(maxKey);
        let min = Number(this.settings[minKey] ?? minSetting?.value ?? 0);
        let max = Number(this.settings[maxKey] ?? maxSetting?.value ?? 0);
        if (min > max) [min, max] = [max, min];
        return [min, max];
    }

    scheduleNextQuestUpdate(reason = "completed") {
        if (this.cooldownTimeout) return;

        if (!this.settings.enableQuestCooldown) {
            this.cooldownTimeout = setTimeout(() => {
                this.cooldownTimeout = null;
                this.updateQuests();
            }, 1000);
            return;
        }

        const [minMinutes, maxMinutes] = this.getSafeRange("questCooldownMinMinutes", "questCooldownMaxMinutes");
        const delayMs = randomDelayMs(minMinutes * 60 * 1000, maxMinutes * 60 * 1000);
        this.questCooldownUntil = Date.now() + delayMs;
        const minutes = Math.round(delayMs / 60000);
        console.log(`[${this.meta.name}] Quest cooldown (${reason}): next quest in ~${minutes} minutes.`);

        this.cooldownTimeout = setTimeout(() => {
            this.cooldownTimeout = null;
            this.questCooldownUntil = 0;
            this.updateQuests();
        }, delayMs);
    }

    apiDelay() {
        if (!this.settings.enableApiDelay) {
            return Promise.resolve();
        }
        const [minSeconds, maxSeconds] = this.getSafeRange("apiDelayMinSeconds", "apiDelayMaxSeconds");
        return new Promise(resolve => setTimeout(resolve, randomDelayMs(minSeconds * 1000, maxSeconds * 1000)));
    }

    getVideoChunkSeconds(secondsRemaining) {
        const [minChunk, maxChunk] = this.getSafeRange("videoChunkMinSeconds", "videoChunkMaxSeconds");
        return Math.min(randomIntBetween(minChunk, maxChunk), secondsRemaining);
    }

    getVideoWaitMs(chunkSeconds) {
        const [minPercent, maxPercent] = this.getSafeRange("videoSlowdownMinPercent", "videoSlowdownMaxPercent");
        const jitterMaxSeconds = Number(this.settings.videoExtraJitterMaxSeconds ?? getSetting("videoExtraJitterMaxSeconds")?.value ?? 0);
        const baseWait = chunkSeconds * 1000 * randomBetween(minPercent / 100, maxPercent / 100);
        return Math.round(baseWait + randomDelayMs(0, jitterMaxSeconds * 1000));
    }

    getHeartbeatIntervalMs() {
        const [minSeconds, maxSeconds] = this.getSafeRange("heartbeatMinSeconds", "heartbeatMaxSeconds");
        return randomDelayMs(minSeconds * 1000, maxSeconds * 1000);
    }

    isQuestEligibleForFarming(quest) {
        if (this.ignoredQuests && this.ignoredQuests.has(quest.id)) return false;

        const questConfig = quest.config.taskConfig || quest.config.taskConfigV2;
        if (!Object.keys(questConfig.tasks).some(taskName => {
            return ((taskName === "WATCH_VIDEO" || taskName === "WATCH_VIDEO_ON_MOBILE") && this.settings.farmVideos
                || taskName === "PLAY_ON_DESKTOP" && this.settings.farmPlayOnDesktop
                || taskName === "STREAM_ON_DESKTOP" && this.settings.farmStreamOnDesktop
                || taskName === "PLAY_ACTIVITY" && this.settings.farmPlayActivity);
        })) return false;

        const rewards = quest.config?.rewardsConfig?.rewards || [];
        if (!Array.isArray(rewards) || rewards.length === 0) return false;
        return rewards.some(reward => {
            return (reward.type === 1 && this.settings.farmRewardCodes
                || reward.type === 2 && this.settings.farmInGame
                || reward.type === 3 && this.settings.farmCollectibles
                || reward.type === 4 && this.settings.farmVirtualCurrency
                || reward.type === 5 && this.settings.farmFractionalPremium);
        });
    }

    updateQuests() {
        if (!modulesReady || !QuestsStore?.quests) return;

        if (!this.settings.hasAcceptedToUsePlugin) {
            this.stopAllFarming();
            console.warn("Consent not accepted. Skipping quest update/completion.");
            return;
        }

        if (this.isOnQuestCooldown()) {
            return;
        }

        const availableQuests = [...QuestsStore.quests.values()];
        const acceptableQuests = availableQuests.filter(x => !x.userStatus?.enrolledAt && new Date(x.config.expiresAt).getTime() > Date.now()) || [];
        const completableQuests = availableQuests.filter(x => x.userStatus?.enrolledAt && !x.userStatus?.completedAt && new Date(x.config.expiresAt).getTime() > Date.now()) || [];
        
        const logString = `Quests available: ${availableQuests.length} Acceptable: ${acceptableQuests.length} Completable: ${completableQuests.length}`;
        if (this.lastLogString !== logString) {
            console.log("Updating quests to complete...");
            console.log(logString);
            this.lastLogString = logString;
        }

        for (const [id, isCompleting] of this.completingQuests.entries()) {
            if (isCompleting && !completableQuests.some(q => q.id === id)) {
                this.completingQuests.set(id, false); // Tell background task to stop if abandoned
                this.completingQuests.delete(id);
            }
        }

        let isAnyQuestCompleting = Array.from(this.completingQuests.values()).includes(true);
        let hasCompletableEligible = completableQuests.some(q => this.isQuestEligibleForFarming(q));

        for (const quest of acceptableQuests) {
            if (this.settings.completeQuestsSequentially && (isAnyQuestCompleting || hasCompletableEligible)) {
                break;
            }
            if (this.isQuestEligibleForFarming(quest)) {
                this.acceptQuest(quest);
                if (this.settings.completeQuestsSequentially) {
                    hasCompletableEligible = true;
                }
            }
        }

        for (const quest of completableQuests) {
            if (this.completingQuests.get(quest.id) === true) {
                continue; // already completing
            }
            if (this.completingQuests.has(quest.id)) {
                this.completingQuests.delete(quest.id);
            }
            
            if (this.settings.completeQuestsSequentially && isAnyQuestCompleting) {
                continue;
            }

            if (this.isQuestEligibleForFarming(quest)) {
                console.log("Starting to complete quest:", quest.config.messages.questName);
                this.completeQuest(quest);
                isAnyQuestCompleting = true;
            }
        }
        /* console.log("Available quests updated:", availableQuests);
        console.log("Acceptable quests updated:", acceptableQuests);
        console.log("Completable quests updated:", completableQuests); */
    }

    patchTitleBar() {
        if (!this.settings.showQuestsButtonTitleBar || !windowArea || typeof windowArea.cq !== "function" || !trailing) {
            return;
        }

        this.unpatchTitleBar();

        try {
            Patcher.after(this.meta.name + "-title-bar", windowArea, "cq", (_, [props], ret) => {
                try {
                    if (props.windowKey?.startsWith("DISCORD_")) return ret;
                    if (props.trailing?.props?.children && !hasInjectedChild(props.trailing.props.children, AUTOQUEST_TITLE_BAR_KEY)) {
                        props.trailing.props.children.unshift(React.createElement(this.QuestButton, { type: "title-bar", key: AUTOQUEST_TITLE_BAR_KEY }));
                    }
                } catch (e) {
                    console.error(`[${this.meta.name}] Error in patchTitleBar patch`, e);
                }
            });
            reRender("." + trailing, this.meta.name + "-title-bar");
        } catch (err) {
            console.error(`[${this.meta.name}] Failed to patchTitleBar:`, err);
        }
    }

    unpatchTitleBar() {
        Patcher.unpatchAll(this.meta.name + "-title-bar");
        if (trailing) {
            reRender("." + trailing, this.meta.name + "-title-bar");
        }
    }

    acceptQuest(quest) {
        if (!this.settings.acceptQuestsAutomatically || !QuestApplyAction || !QuestLocationMap) return;
        console.log("Accepting quest:", quest.config.messages.questName);
        const action = {
            questContent: QuestLocationMap.QUEST_HOME_DESKTOP,
            questContentCTA: "ACCEPT_QUEST",
            sourceQuestContent: 0,
        };
        QuestApplyAction(quest.id, action).then(() => {
            console.log("Accepted quest:", quest.config.messages.questName);
        }).catch(err => {
            console.error("Failed to accept quest:", quest.config.messages.questName, err);
        });
    }

    stopCompletingAll() {
        let stoppedAny = false;
        for (const questId of this.completingQuests.keys()) {
            if (this.completingQuests.get(questId) === true) {
                this.completingQuests.set(questId, false);
                stoppedAny = true;
            }
        }
        if (stoppedAny) {
            console.log("Stopped completing all quests.");
        }
    }

    async completeQuest(quest) {
        if (!this.settings.hasAcceptedToUsePlugin) {
            this.stopAllFarming();
            console.warn("Consent not accepted. Cannot complete quests.");
            return;
        }

        let isApp = typeof DiscordNative !== "undefined";
        if (!quest) {
            console.log("You don't have any uncompleted quests!");
        } else {
            const pid = Math.floor(Math.random() * 30000) + 1000;

            const applicationId = quest.config.application.id;
            const applicationName = quest.config.application.name;
            const questName = quest.config.messages.questName;
            const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
            const taskName = ["WATCH_VIDEO", "PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY", "WATCH_VIDEO_ON_MOBILE"].find(x => taskConfig.tasks[x] != null);
            const secondsNeeded = taskConfig.tasks[taskName]?.target ?? undefined;
            let secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

            if (taskName === undefined) {
                console.error("Unknown task name for quest. Cannot complete quest:", questName);
                return;
            }

            if (secondsNeeded === undefined) {
                console.error("Unknown seconds needed for quest task. Cannot complete quest:", questName, "with task", taskName);
                return;
            }

            if (!isApp && taskName !== "WATCH_VIDEO" && taskName !== "WATCH_VIDEO_ON_MOBILE") {
                console.log("This no longer works in browser for non-video quests. Use the discord desktop app to complete the", questName, "quest!");
                return;
            }

            this.completingQuests.set(quest.id, true);

            console.log(`Completing quest ${questName} (${quest.id}) - ${taskName} for ${secondsNeeded} seconds.`);

            const postWithRetry = async (url, body) => {
                let delay = 5;
                const maxDelay = 300;
                while (this.completingQuests.get(quest.id)) {
                    try {
                        await this.apiDelay();
                        return await RestApi.post({ url, body });
                    } catch (err) {
                        console.warn(`Failed to POST to ${url} for quest ${questName}:`, err);
                        console.log("Retrying to POST for quest", questName, "in", delay, "seconds.");
                        await new Promise(resolve => setTimeout(resolve, delay * 1000));
                        if (delay < maxDelay) {
                            delay = Math.min(delay * 2, maxDelay);
                        } else {
                            delay = maxDelay;
                        }
                    }
                }
            };

            switch (taskName) {
                case "WATCH_VIDEO":
                case "WATCH_VIDEO_ON_MOBILE":
                    let completed = false;
                    let watchVideo = async () => {
                        while (true) {
                            const secondsRemaining = secondsNeeded - secondsDone;
                            const chunk = this.getVideoChunkSeconds(secondsRemaining);
                            const timestamp = secondsDone + chunk;

                            if (!this.settings.hasAcceptedToUsePlugin || !this.settings.farmVideos || !this.completingQuests.get(quest.id)) {
                                console.log(`Stopping completing quest: ${questName}`);
                                this.completingQuests.set(quest.id, false);
                                break;
                            }

                            await new Promise(resolve => setTimeout(resolve, this.getVideoWaitMs(chunk)));
                            const res = await postWithRetry(`/quests/${quest.id}/video-progress`, { timestamp: Math.min(secondsNeeded, timestamp + Math.random()) });
                            completed = res.body.completed_at != null;
                            secondsDone = Math.min(secondsNeeded, timestamp);

                            if (secondsDone >= secondsNeeded) {
                                break;
                            }
                        }
                        if (!completed) {
                            await postWithRetry(`/quests/${quest.id}/video-progress`, { timestamp: secondsNeeded });
                        } else {
                            console.log(`Quest ${questName} completed!`);
                        }
                        this.completingQuests.set(quest.id, false);
                        if (!this.ignoredQuests) this.ignoredQuests = new Set();
                        this.ignoredQuests.add(quest.id);
                        this.scheduleNextQuestUpdate("completed");
                    }
                    watchVideo();
                    console.log(`Spoofing video for ${questName}.`);
                    break;

                case "PLAY_ON_DESKTOP":
                    this.apiDelay().then(() => RestApi.get({ url: `/applications/public?application_ids=${applicationId}` })).then(res => {
                        const appData = res.body[0];
                        const exeName = appData.executables?.find(x => x.os === "win32")?.name?.replace(">","") ?? appData.name.replace(/[\/\\:*?"<>|]/g, "");

                        const fakeGame = {
                            cmdLine: `C:\\Program Files\\${appData.name}\\${exeName}`,
                            exeName,
                            exePath: `c:/program files/${appData.name.toLowerCase()}/${exeName}`,
                            hidden: false,
                            isLauncher: false,
                            id: applicationId,
                            name: appData.name,
                            pid: pid,
                            pidPath: [pid],
                            processName: appData.name,
                            start: Date.now(),
                        };
                        const realGames = this.fakeGames.size == 0 ? RunningGameStore.getRunningGames() : [];
                        this.fakeGames.set(quest.id, fakeGame);
                        const fakeGames = Array.from(this.fakeGames.values());
                        DiscordModules.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: realGames, added: [fakeGame], games: fakeGames });

                        let lastUpdate = Date.now();
                        let playOnDesktop = (event) => {
                            if (event.questId !== quest.id) return;
                            lastUpdate = Date.now();
                            let progress = quest.config.configVersion === 1 ? event.userStatus.streamProgressSeconds : Math.floor(event.userStatus.progress.PLAY_ON_DESKTOP.value);
                            console.log(`Quest progress ${questName}: ${progress}/${secondsNeeded}`);

                            if (!this.settings.hasAcceptedToUsePlugin || !this.settings.farmPlayOnDesktop || !this.completingQuests.get(quest.id)) {
                                console.log("Stopping completing quest:", questName);
                                clearInterval(checkInterval);
                                this.fakeGames.delete(quest.id);
                                const games = RunningGameStore.getRunningGames();
                                const added = this.fakeGames.size == 0 ? games : [];
                                DiscordModules.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: added, games: games });
                                DiscordModules.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", playOnDesktop);
                                this.completingQuests.set(quest.id, false);
                                this.scheduleNextQuestUpdate("finished");
                            } else if (progress >= secondsNeeded) {
                                console.log(`Quest ${questName} completed!`);
                                clearInterval(checkInterval);
                                this.fakeGames.delete(quest.id);
                                const games = RunningGameStore.getRunningGames();
                                const added = this.fakeGames.size == 0 ? games : [];
                                DiscordModules.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: added, games: games });
                                DiscordModules.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", playOnDesktop);
                                this.completingQuests.set(quest.id, false);
                                if (!this.ignoredQuests) this.ignoredQuests = new Set();
                                this.ignoredQuests.add(quest.id);
                                this.scheduleNextQuestUpdate("finished");
                            }
                        }
                        DiscordModules.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", playOnDesktop);

                        const checkInterval = setInterval(() => {
                            if (!this.completingQuests.get(quest.id)) {
                                clearInterval(checkInterval);
                                return;
                            }
                            if (Date.now() - lastUpdate > 120000) { 
                                console.log(`No PLAY_ON_DESKTOP progress for ${questName}. Ignoring this quest for now...`);
                                clearInterval(checkInterval);
                                this.fakeGames.delete(quest.id);
                                const games = RunningGameStore.getRunningGames();
                                const added = this.fakeGames.size == 0 ? games : [];
                                DiscordModules.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: added, games: games });
                                DiscordModules.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", playOnDesktop);
                                this.completingQuests.set(quest.id, false);
                                if (!this.ignoredQuests) this.ignoredQuests = new Set();
                                this.ignoredQuests.add(quest.id);
                                this.scheduleNextQuestUpdate("finished");
                            }
                        }, 60000);

                        console.log(`Spoofed your game to ${applicationName}. Wait for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);
                    })
                    break;

                case "STREAM_ON_DESKTOP":
                    const fakeApp = {
                        id: applicationId,
                        name: `FakeApp ${applicationName} (AutoQuest)`,
                        pid: pid,
                        sourceName: null,
                    };
                    this.fakeApplications.set(quest.id, fakeApp);

                    let lastStreamUpdate = Date.now();
                    let streamOnDesktop = (event) => {
                        if (event.questId !== quest.id) return;
                        lastStreamUpdate = Date.now();
                        let progress = quest.config.configVersion === 1 ? event.userStatus.streamProgressSeconds : Math.floor(event.userStatus.progress.STREAM_ON_DESKTOP.value);
                        console.log(`Quest progress ${questName}: ${progress}/${secondsNeeded}`);

                        if (!this.settings.hasAcceptedToUsePlugin || !this.settings.farmStreamOnDesktop || !this.completingQuests.get(quest.id)) {
                            console.log("Stopping completing quest:", questName);
                            clearInterval(streamCheckInterval);
                            this.fakeApplications.delete(quest.id);
                            DiscordModules.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", streamOnDesktop);
                            this.completingQuests.set(quest.id, false);
                            this.scheduleNextQuestUpdate("finished");
                        } else if (progress >= secondsNeeded) {
                            console.log(`Quest ${questName} completed!`);
                            clearInterval(streamCheckInterval);
                            this.fakeApplications.delete(quest.id);
                            DiscordModules.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", streamOnDesktop);
                            this.completingQuests.set(quest.id, false);
                            if (!this.ignoredQuests) this.ignoredQuests = new Set();
                            this.ignoredQuests.add(quest.id);
                            this.scheduleNextQuestUpdate("finished");
                        }
                    }
                    DiscordModules.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", streamOnDesktop);

                    const streamCheckInterval = setInterval(() => {
                        if (!this.completingQuests.get(quest.id)) {
                            clearInterval(streamCheckInterval);
                            return;
                        }
                        if (Date.now() - lastStreamUpdate > 120000) { 
                            console.log(`No STREAM_ON_DESKTOP progress for ${questName}. Ignoring this quest for now...`);
                            clearInterval(streamCheckInterval);
                            this.fakeApplications.delete(quest.id);
                            DiscordModules.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", streamOnDesktop);
                            this.completingQuests.set(quest.id, false);
                            if (!this.ignoredQuests) this.ignoredQuests = new Set();
                            this.ignoredQuests.add(quest.id);
                            this.scheduleNextQuestUpdate("finished");
                        }
                    }, 60000);

                    console.log(`Spoofed your stream to ${applicationName}. Stream any window in vc for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);
                    console.log("Remember that you need at least 1 other person to be in the vc!");
                    break;

                case "PLAY_ACTIVITY":
                    const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id ?? Object.values(GuildChannelStore.getAllGuilds()).find(x => x != null && x.VOCAL.length > 0).VOCAL[0].channel.id;
                    const streamKey = `call:${channelId}:1`;

                    let playActivity = async () => {
                        console.log("Completing quest", questName, "-", quest.config.messages.questName);

                        while (true) {
                            const res = await postWithRetry(`/quests/${quest.id}/heartbeat`, { stream_key: streamKey, terminal: false });
                            const progress = res.body.progress.PLAY_ACTIVITY.value;
                            console.log(`Quest progress ${questName}: ${progress}/${secondsNeeded}`);

                            await new Promise(resolve => setTimeout(resolve, this.getHeartbeatIntervalMs()));

                            if (!this.settings.hasAcceptedToUsePlugin || !this.settings.farmPlayActivity || !this.completingQuests.get(quest.id)) {
                                console.log("Stopping completing quest:", questName);
                                this.completingQuests.set(quest.id, false);
                                this.scheduleNextQuestUpdate("finished");
                                break;
                            }

                            if (progress >= secondsNeeded) {
                                await postWithRetry(`/quests/${quest.id}/heartbeat`, { stream_key: streamKey, terminal: true });
                                console.log(`Quest ${questName} completed!`);
                                this.completingQuests.set(quest.id, false);
                                if (!this.ignoredQuests) this.ignoredQuests = new Set();
                                this.ignoredQuests.add(quest.id);
                                this.scheduleNextQuestUpdate("finished");
                                break;
                            }
                        }
                    }
                    playActivity();
                    break;

                default:
                    console.error("Unknown task type:", taskName);
                    this.completingQuests.set(quest.id, false);
                    break;
            }
        }
    }

    questsStatus() {
        if (!QuestsStore?.quests) {
            return { enrollable: 0, enrolled: 0, claimable: 0, claimed: 0, expired: 0 };
        }

        const availableQuests = [...QuestsStore.quests.values()];
        return availableQuests.reduce((acc, x) => {
            if (new Date(x.config.expiresAt).getTime() < Date.now()) {
                acc.expired++;
            } else if (x.userStatus?.claimedAt) {
                acc.claimed++;
            } else if (x.userStatus?.completedAt) {
                acc.claimable++;
            } else if (x.userStatus?.enrolledAt) {
                acc.enrolled++;
            } else {
                acc.enrollable++;
            }
            return acc;
        }, { enrollable: 0, enrolled: 0, claimable: 0, claimed: 0, expired: 0 });
    }

    QuestsCount = () => {
        if (!CountBadge || !Tooltip || !Flex) return null;

        const [status, setStatus] = React.useState(this.questsStatus());

        const checkForNewQuests = () => {
            setStatus(this.questsStatus());
        };

        React.useEffect(() => {
            if (!QuestsStore?.addChangeListener) return;
            QuestsStore.addChangeListener(checkForNewQuests);
            return () => {
                QuestsStore?.removeChangeListener(checkForNewQuests);
            };
        }, []);

        const children = [];
        if (status.enrollable > 0) {
            children.push(
                React.createElement(Tooltip, { text: "Enrollable" },
                    ({ onMouseEnter, onMouseLeave }) =>
                        React.createElement(CountBadge, {
                            onMouseEnter: onMouseEnter,
                            onMouseLeave: onMouseLeave,
                            count: status.enrollable,
                            color: "var(--status-danger)"
                        })
                )
            );
        }
        if (status.enrolled > 0) {
            children.push(
                React.createElement(Tooltip, { text: "Enrolled" },
                    ({ onMouseEnter, onMouseLeave }) =>
                        React.createElement(CountBadge, {
                            onMouseEnter: onMouseEnter,
                            onMouseLeave: onMouseLeave,
                            count: status.enrolled,
                            color: "var(--status-warning)"
                        })
                )
            );
        }
        if (status.claimable > 0) {
            children.push(
                React.createElement(Tooltip, { text: "Claimable" },
                    ({ onMouseEnter, onMouseLeave }) =>
                        React.createElement(CountBadge, {
                            onMouseEnter: onMouseEnter,
                            onMouseLeave: onMouseLeave,
                            count: status.claimable,
                            color: "var(--status-positive)"
                        })
                )
            );
        }
        if (status.claimed > 0) {
            children.push(
                React.createElement(Tooltip, { text: "Claimed" },
                    ({ onMouseEnter, onMouseLeave }) =>
                        React.createElement(CountBadge, {
                            onMouseEnter: onMouseEnter,
                            onMouseLeave: onMouseLeave,
                            count: status.claimed,
                            color: "var(--blurple-50)"
                        })
                )
            );
        }

        return React.createElement(Flex, {
            flexDirection: Flex.Direction.HORIZONTAL,
            justify: Flex.Justify.END,
            style: { gap: "5px" },
            className: "quest-button-badges",
            shrink: false
        }, ...children);
    }

    // type: "title-bar" | "settings-bar"
    QuestButton = ({ type }) => {
        const [state, setState] = React.useState(this.questsStatus());

        const checkForNewQuests = () => {
            setState(this.questsStatus());
        };

        React.useEffect(() => {
            if (!QuestsStore?.addChangeListener) return;
            QuestsStore.addChangeListener(checkForNewQuests);
            return () => {
                QuestsStore?.removeChangeListener(checkForNewQuests);
            };
        }, []);

        const questIcon = getQuestIcon();
        if (!questIcon) return null;

        const className = state.enrollable ? "quest-button-enrollable" : state.enrolled ? "quest-button-enrolled" : state.claimable ? "quest-button-claimable" : "";
        const tooltip = state.enrollable ? `${state.enrollable} Enrollable Quests` : state.enrolled ? `${state.enrolled} Enrolled Quests` : state.claimable ? `${state.claimable} Claimable Quests` : "Quests";
        if (type === "title-bar") {
            if (!TopBarButtonModule?.[TopBarButtonKey]) return null;
            return React.createElement(TopBarButtonModule[TopBarButtonKey], {
                className: className,
                iconClassName: undefined,
                disabled: navigateToQuestHome === undefined,
                showBadge: state.enrollable > 0 || state.enrolled > 0 || state.claimable > 0,
                badgePosition: "bottom",
                icon: questIcon,
                iconSize: 20,
                onClick: navigateToQuestHome,
                onContextMenu: undefined,
                tooltip: tooltip,
                tooltipPosition: "bottom",
                hideOnClick: false
            });
        } else if (type === "settings-bar") {
            if (!SettingsBarButton || !TopBarButtonModule?.[TopBarButtonKey]) return null;
            return React.createElement(SettingsBarButton, {
                tooltipText: tooltip,
                onContextMenu: undefined,
                onClick: navigateToQuestHome,
                disabled: navigateToQuestHome === undefined,
                className: "quest-button"
            }, React.createElement(TopBarButtonModule[TopBarButtonKey], {
                className: className,
                iconClassName: undefined,
                disabled: navigateToQuestHome === undefined,
                showBadge: state.enrollable > 0 || state.enrolled > 0 || state.claimable > 0,
                badgePosition: "bottom",
                icon: questIcon,
                iconSize: 20,
                onClick: navigateToQuestHome,
                onContextMenu: undefined,
                hideOnClick: false
            }));
        }
    }
};