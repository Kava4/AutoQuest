/**
 * @name AutoQuest
 * @description Complete Discord quests safely in the background with cooldowns and rate limiting.
 * @version 1.2.3
 * @author Kava4
 * @authorLink https://github.com/Kava4
 * @source https://github.com/Kava4/AutoQuest
 * @updateUrl https://raw.githubusercontent.com/Kava4/AutoQuest/main/AutoQuest.plugin.js
 */

const config = {
    changelog: [
        { title: "v1.2.3", type: "fixed", items: [
            "Video quests use START_QUEST enrollment and Discord's API client (fixes 404 on video-progress).",
            "Stopped failed video quests from instantly cycling to the next quest."
        ] },
        { title: "v1.2.2", type: "fixed", items: [
            "Fixed infinite \"Accepting quest\" loop when parallel mode is enabled."
        ] },
        { title: "v1.2.1", type: "added", items: [
            "Parallel mode: turn off \"One quest at a time\" to farm a video quest and a play quest together.",
            "Cooldown no longer blocks reward claims while another quest is still running."
        ] },
        { title: "v1.2.0", type: "fixed", items: [
            "Quest automation works again on the latest Discord update.",
            "Video, Play on Desktop, and reward claiming are fixed.",
            "Mobile-only video quests are skipped automatically on desktop.",
            "Cleaner settings panel and simplified option names."
        ] },
        { title: "v1.0.0", type: "added", items: [
            "Initial release with safety defaults, cooldowns, and quest filters."
        ] },
    ],
    settings: [
        {
            type: "category", id: "general", name: "General", collapsible: false, shown: true, settings: [
                { type: "switch", id: "acceptQuestsAutomatically", name: "Auto-accept quests", note: "Accept new quests from the Quests tab automatically.", value: true },
                { type: "switch", id: "claimRewardsAutomatically", name: "Auto-claim rewards", note: "Claim rewards as soon as a quest finishes.", value: true },
                { type: "switch", id: "completeQuestsSequentially", name: "One quest at a time", note: "Off = run one video + one play quest in parallel (faster). Two play quests still won't stack.", value: true },
            ]
        },
        {
            type: "category", id: "questTypes", name: "Quest types", collapsible: true, shown: true, settings: [
                { type: "switch", id: "farmVideos", name: "Watch video", note: "\"Watch X seconds\" quests — fastest (~30–60 sec).", value: true },
                { type: "switch", id: "farmPlayOnDesktop", name: "Play game", note: "\"Play for X minutes\" quests — slower (~15 min).", value: true },
                { type: "switch", id: "farmStreamOnDesktop", name: "Go Live / Stream", note: "Streaming quests — you must be in a voice channel.", value: true },
                { type: "switch", id: "farmPlayActivity", name: "Activities", note: "In-app activity quests (e.g. Poker, Chess).", value: true },
            ]
        },
        {
            type: "category", id: "rewards", name: "Rewards to farm", collapsible: true, shown: true, settings: [
                { type: "switch", id: "farmRewardCodes", name: "Game codes & keys", note: "Steam keys and similar reward codes.", value: true },
                { type: "switch", id: "farmInGame", name: "In-game items", note: "Rewards delivered inside a game.", value: true },
                { type: "switch", id: "farmCollectibles", name: "Profile decorations", note: "Avatars, nameplates, and profile effects.", value: true },
                { type: "switch", id: "farmVirtualCurrency", name: "Orbs", note: "Discord Orbs currency.", value: true },
                { type: "switch", id: "farmFractionalPremium", name: "Nitro trial", note: "Fractional Nitro / premium time rewards.", value: true },
            ]
        },
        {
            type: "category", id: "safety", name: "Safety", collapsible: true, shown: true, settings: [
                { type: "switch", id: "enableQuestCooldown", name: "Pause between quests", note: "Wait a random time after each quest before starting the next.", value: true },
                { type: "slider", id: "questCooldownMinMinutes", name: "Min pause (minutes)", note: "Shortest wait between quests.", value: 10, min: 0, max: 120, markers: [0, 10, 30, 60, 120] },
                { type: "slider", id: "questCooldownMaxMinutes", name: "Max pause (minutes)", note: "Longest wait between quests.", value: 30, min: 0, max: 180, markers: [0, 15, 30, 60, 120, 180] },
                { type: "switch", id: "enableApiDelay", name: "Slow down API calls", note: "Adds a small random delay before each Discord API request.", value: true },
                { type: "slider", id: "apiDelayMinSeconds", name: "Min API delay (seconds)", note: "Minimum random delay before API calls.", value: 1, min: 0, max: 30, markers: [0, 1, 5, 15, 30] },
                { type: "slider", id: "apiDelayMaxSeconds", name: "Max API delay (seconds)", note: "Maximum random delay before API calls.", value: 8, min: 0, max: 60, markers: [0, 5, 15, 30, 60] },
            ]
        },
        {
            type: "category", id: "advanced", name: "Advanced", collapsible: true, shown: false, settings: [
                { type: "slider", id: "videoChunkMinSeconds", name: "Video step min (seconds)", note: "Smallest progress jump per video update.", value: 2, min: 1, max: 15, markers: [1, 2, 5, 10, 15] },
                { type: "slider", id: "videoChunkMaxSeconds", name: "Video step max (seconds)", note: "Largest progress jump per video update.", value: 4, min: 1, max: 20, markers: [1, 4, 7, 10, 20] },
                { type: "slider", id: "videoSlowdownMinPercent", name: "Video speed min (%)", note: "100 = realtime, 120 = 20% slower than the video.", value: 120, min: 100, max: 300, markers: [100, 120, 150, 200, 300] },
                { type: "slider", id: "videoSlowdownMaxPercent", name: "Video speed max (%)", note: "Upper bound for how slowly video progress is sent.", value: 160, min: 100, max: 400, markers: [100, 160, 200, 300, 400] },
                { type: "slider", id: "videoExtraJitterMaxSeconds", name: "Video extra wait (seconds)", note: "Up to this many extra random seconds per video update.", value: 3, min: 0, max: 15, markers: [0, 3, 5, 10, 15] },
                { type: "slider", id: "heartbeatMinSeconds", name: "Activity heartbeat min (seconds)", note: "Minimum wait between activity quest heartbeats.", value: 18, min: 10, max: 120, markers: [10, 18, 30, 60, 120] },
                { type: "slider", id: "heartbeatMaxSeconds", name: "Activity heartbeat max (seconds)", note: "Maximum wait between activity quest heartbeats.", value: 28, min: 10, max: 180, markers: [10, 28, 60, 120, 180] },
                { type: "switch", id: "showQuestsButtonBadges", name: "Quest count badges", note: "Show completable/claimable counts on the sidebar Quests button.", value: true },
                { type: "dropdown", id: "questMenuFilter", name: "Quests tab filter", note: "Default sort filter when opening the Quests menu.", value: "recently_enrolled", options: [
                    { label: "Suggested", value: "suggested" },
                    { label: "Most Recent", value: "most_recent" },
                    { label: "Expiring Soon", value: "expiring_soon" },
                    { label: "Started", value: "recently_enrolled" },
                ]},
            ]
        },
        {
            type: "category", id: "internal", name: "Internal", collapsible: false, shown: false, settings: [
                { type: "switch", id: "hasAcceptedToUsePlugin", name: "Risk consent", note: "Set by the warning popup on first run.", value: false },
            ]
        },
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

const { Webpack, Data, UI, Patcher, DOM, React, Components, Utils, Plugins, Logger } = BdApi;
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
let CountBadge;
let QuestButtonWithKey;
let SortingFilterWithKey;
let modulesLoaded = false;
let modulesReady = false;

const isFluxDispatcher = (m) => m?._subscriptions
    && typeof m.subscribe === "function"
    && typeof m.dispatch === "function"
    && typeof m.__proto__?.flushWaitQueue === "function";

const isRestApiClient = (m) => m
    && typeof m.get === "function"
    && typeof m.post === "function"
    && typeof m.put === "function"
    && typeof m.patch === "function"
    && typeof m.del === "function"
    && !m._dispatcher;

function findRestApiClient() {
    const candidates = Webpack.getModules(isRestApiClient, { searchExports: true, first: false }) ?? [];
    if (!candidates.length) {
        const loose = Webpack.getModules((m) => isRestApiClient(m) || (
            m && typeof m.get === "function" && typeof m.post === "function"
            && typeof m.del === "function" && !m._dispatcher
        ), { searchExports: true, first: false }) ?? [];
        candidates.push(...loose);
    }

    return candidates.find(m => m.post.toString().includes("url"))
        ?? candidates[0]
        ?? null;
}

function normalizeApiPath(url) {
    if (typeof url !== "string") return "";
    return url.startsWith("/api/") ? url : `/api/v9${url}`;
}

let cachedAuthToken = null;
let authSnifferInstalled = false;

function installAuthSniffer() {
    if (authSnifferInstalled) return;
    authSnifferInstalled = true;

    const originalSetHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        if (typeof header === "string" && header.toLowerCase() === "authorization"
            && typeof value === "string" && value.length > 20) {
            cachedAuthToken = value;
        }
        return originalSetHeader.call(this, header, value);
    };
}

function getDiscordToken() {
    if (cachedAuthToken) return cachedAuthToken;

    const tokenModule = Webpack.getModule(m => typeof m?.getToken === "function", { searchExports: true })
        ?? Webpack.getModule(m => typeof m?.default?.getToken === "function", { searchExports: true });
    try {
        const token = tokenModule?.getToken?.() ?? tokenModule?.default?.getToken?.();
        if (typeof token === "string" && token.length > 20) {
            cachedAuthToken = token;
            return cachedAuthToken;
        }
    } catch {}

    const authHeaderModule = Webpack.getModule(m => typeof m?.getAuthorizationHeader === "function", { searchExports: true });
    try {
        const header = authHeaderModule?.getAuthorizationHeader?.();
        if (typeof header === "string" && header.length > 20) {
            cachedAuthToken = header;
            return cachedAuthToken;
        }
    } catch {}

    try {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        const raw = iframe.contentWindow?.localStorage?.getItem("token");
        document.body.removeChild(iframe);
        if (raw) {
            const token = JSON.parse(raw);
            if (typeof token === "string" && token.length > 20) {
                cachedAuthToken = token;
                return cachedAuthToken;
            }
        }
    } catch {}

    return null;
}

function clearDiscordToken() {
    cachedAuthToken = null;
}

async function ensureDiscordToken(maxAttempts = 6, delayMs = 500) {
    installAuthSniffer();
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const token = getDiscordToken();
        if (token) return token;
        if (attempt < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    return null;
}

function buildFakeGame(applicationId, gameName, pid, appData) {
    const name = appData?.name ?? gameName;
    const exeName = appData?.executables?.find(x => x.os === "win32")?.name?.replace(">", "")
        ?? `${name.replace(/[\/\\:*?"<>|]/g, "")}.exe`;
    return {
        cmdLine: `C:\\Program Files\\${name}\\${exeName}`,
        exeName,
        exePath: `c:/program files/${name.toLowerCase()}/${exeName}`,
        hidden: false,
        isLauncher: false,
        id: applicationId,
        name,
        pid,
        pidPath: [pid],
        processName: name,
        start: Date.now(),
    };
}

async function fetchApplicationData(applicationId) {
    const url = `/applications/public?application_ids=${applicationId}`;
    try {
        const res = await apiGet(url);
        return res?.body?.[0] ?? null;
    } catch (err) {
        if (!isAuthError(err)) throw err;
        clearDiscordToken();
        await ensureDiscordToken(4, 400);
        const res = await apiGet(url);
        return res?.body?.[0] ?? null;
    }
}

function isAuthError(err) {
    return err?.status === 401 || err?.status === 403;
}

function isSkippableQuestError(err) {
    return err?.status === 404 || err?.status === 403 || err?.status === 410;
}

function getTrafficMetadataSealed(questId) {
    try {
        return QuestsStore?.getQuest?.(questId)?.trafficMetadataSealed ?? null;
    } catch {
        return null;
    }
}

function isDesktopClient() {
    return typeof DiscordNative !== "undefined";
}

function isMobileVideoQuest(taskInfo) {
    return taskInfo?.taskKey === "WATCH_VIDEO_ON_MOBILE";
}

function getQuestPriority(quest) {
    const taskInfo = getQuestTaskInfo(quest);
    if (!taskInfo) return 1000;
    if (taskInfo.taskKey === "WATCH_VIDEO") return 0;
    if (isMobileVideoQuest(taskInfo)) return 200;
    if (taskInfo.handler === "WATCH_VIDEO") return 10;
    if (taskInfo.handler === "PLAY_ON_DESKTOP") return 20;
    if (taskInfo.handler === "PLAY_ACTIVITY") return 30;
    if (taskInfo.handler === "STREAM_ON_DESKTOP") return 40;
    return 100;
}

async function apiFetch(method, url, body) {
    installAuthSniffer();
    let token = getDiscordToken();
    if (!token) {
        token = await ensureDiscordToken();
    }
    if (!token) {
        return Promise.reject({
            status: 401,
            message: "Discord auth token not available. Switch channels once and retry.",
        });
    }

    const apiPath = normalizeApiPath(url);
    const fullUrl = `https://discord.com${apiPath}`;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, fullUrl, true);
        xhr.setRequestHeader("authorization", token);
        if (body != null) xhr.setRequestHeader("content-type", "application/json");
        xhr.onload = () => {
            let responseBody = null;
            try {
                responseBody = xhr.responseText ? JSON.parse(xhr.responseText) : null;
            } catch {
                responseBody = xhr.responseText;
            }

            if (xhr.status >= 200 && xhr.status < 300) {
                resolve({ body: responseBody, status: xhr.status });
            } else {
                reject({ status: xhr.status, body: responseBody, message: xhr.statusText });
            }
        };
        xhr.onerror = () => reject(new Error("XHR network error"));
        xhr.send(body != null ? JSON.stringify(body) : null);
    });
}

function getQuestEnrollCTA(handler) {
    if (handler === "WATCH_VIDEO" || handler === "PLAY_ACTIVITY" || handler === "ACHIEVEMENT_IN_ACTIVITY") {
        return "START_QUEST";
    }
    return "ACCEPT_QUEST";
}

async function ensureVideoQuestStarted(questId) {
    if (!QuestApplyAction || !QuestLocationMap) return;
    try {
        await QuestApplyAction(questId, {
            questContent: QuestLocationMap.QUEST_HOME_DESKTOP,
            questContentCTA: "START_QUEST",
            sourceQuestContent: 0,
        });
    } catch {}
}

async function apiPost(url, body) {
    if (RestApi?.post) {
        try {
            return await RestApi.post({ url, body });
        } catch (err) {
            const errText = String(err?.message ?? err);
            if (!errText.includes("toLowerCase")) throw err;
        }
    }
    return apiFetch("POST", url, body);
}

async function apiGet(url) {
    return apiFetch("GET", url);
}

const isQuestsStore = (m) => m?.getQuest && m?.quests instanceof Map;

const QUEST_TASK_ORDER = [
    { match: (key) => key === "ACHIEVEMENT_IN_ACTIVITY", handler: "ACHIEVEMENT_IN_ACTIVITY" },
    { match: (key) => key === "PLAY_ACTIVITY", handler: "PLAY_ACTIVITY" },
    { match: (key) => key.startsWith("STREAM"), handler: "STREAM_ON_DESKTOP" },
    { match: (key) => key.includes("VIDEO"), handler: "WATCH_VIDEO" },
    { match: (key) => key.startsWith("PLAY"), handler: "PLAY_ON_DESKTOP" },
];

function getAppIdForTask(taskConfig, taskKey, legacyAppId) {
    return taskConfig?.tasks?.[taskKey]?.applications?.[0]?.id ?? legacyAppId ?? null;
}

function getQuestTaskInfo(quest) {
    const freshQuest = QuestsStore?.getQuest?.(quest?.id) ?? quest;
    const config = freshQuest?.config;
    const taskConfig = config?.taskConfig ?? config?.taskConfigV2;
    if (!taskConfig?.tasks || typeof taskConfig.tasks !== "object") return null;

    const legacyAppId = config?.application?.id ?? null;
    const taskKeys = Object.keys(taskConfig.tasks);

    for (const { match, handler } of QUEST_TASK_ORDER) {
        const taskKey = taskKeys.find(match);
        if (!taskKey) continue;

        const task = taskConfig.tasks[taskKey];
        const target = task?.target ?? 0;
        const appId = getAppIdForTask(taskConfig, taskKey, legacyAppId);
        const applicationName = config?.application?.name
            ?? task?.applications?.[0]?.name
            ?? config?.messages?.questName
            ?? freshQuest.id;

        return {
            quest: freshQuest,
            taskKey,
            handler,
            target,
            appId,
            applicationName,
            configVersion: config?.configVersion,
        };
    }

    return null;
}

function getQuestProgress(userStatus, taskKey, configVersion) {
    if (configVersion === 1) return userStatus?.streamProgressSeconds ?? 0;
    const progressEntry = userStatus?.progress?.[taskKey];
    return Math.floor(progressEntry?.value ?? 0);
}

function findWebpackModule(filter, options = { searchExports: true }) {
    return Webpack.getModule(filter, options);
}

function waitForWebpackModule(filter, options = { searchExports: true }, timeoutMs = 30000) {
    const existing = findWebpackModule(filter, options);
    if (existing) return Promise.resolve(existing);

    return new Promise((resolve, reject) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
            reject(new Error("Timed out waiting for Discord module"));
        }, timeoutMs);

        Webpack.waitForModule(filter, { ...options, signal: controller.signal })
            .then((module) => {
                clearTimeout(timeout);
                resolve(module);
            })
            .catch((err) => {
                clearTimeout(timeout);
                reject(err);
            });
    });
}

function loadOptionalUiModules() {
    QuestButtonWithKey = [...(Webpack.getWithKey(Filters.byStrings("focusProps:", "interactiveClassName:")) ?? [])];
    SortingFilterWithKey = [...(Webpack.getWithKey(Filters.byStrings("selectedSortMethod", "onChange", "radioBarClassName"), { searchExports: true }) ?? [])];
    CountBadge = CountBadge
        || Webpack.getByStrings("renderBadgeCount", "disableColor", { searchExports: true });
}

async function loadDiscordModules() {
    try {
        QuestsStore = Webpack.getStore("QuestStore")
            || Webpack.getStore("QuestsStore")
            || findWebpackModule(isQuestsStore)
            || Webpack.getByKeys("getQuest", "quests", { searchExports: true });

        RunningGameStore = Webpack.getStore("RunningGameStore")
            || findWebpackModule(Filters.byStoreName("RunningGameStore"));

        ApplicationStreamingStore = Webpack.getStore("ApplicationStreamingStore")
            || findWebpackModule(Filters.byStoreName("ApplicationStreamingStore"));

        ChannelStore = Webpack.getStore("ChannelStore")
            || findWebpackModule(Filters.byStoreName("ChannelStore"));

        GuildChannelStore = Webpack.getStore("GuildChannelStore")
            || findWebpackModule(Filters.byStoreName("GuildChannelStore"));

        DiscordModules = findWebpackModule(isFluxDispatcher)
            || await waitForWebpackModule(isFluxDispatcher).catch(() => null);

        RestApi = findRestApiClient()
            || findWebpackModule(isRestApiClient)
            || await waitForWebpackModule(isRestApiClient).catch(() => null);

        QuestApplyAction = Webpack.getByStrings('type:"QUESTS_ENROLL_BEGIN"', { searchExports: true })
            || Webpack.getByStrings("QUESTS_ENROLL_BEGIN", { searchExports: true });

        QuestLocationMap = Webpack.getByKeys("QUEST_HOME_DESKTOP", { searchExports: true })
            || findWebpackModule(m => m?.QUEST_HOME_DESKTOP != null);

        CountBadge = Webpack.getByStrings("renderBadgeCount", "disableColor", { searchExports: true });
        loadOptionalUiModules();

        modulesReady = !!(QuestsStore?.quests && DiscordModules?.dispatch);
        modulesLoaded = modulesReady;

        if (!modulesReady) {
            Logger.error("AutoQuest", "Core Discord modules missing.", {
                QuestsStore: !!QuestsStore,
                RestApi: !!RestApi,
                DiscordModules: !!DiscordModules
            });
        }
    } catch (err) {
        modulesReady = false;
        modulesLoaded = false;
        Logger.error("AutoQuest", "Failed to load Discord modules", err);
    }

    return modulesReady;
}

const AUTOQUEST_BADGES_KEY = "autoquest-quest-badges";

function hasInjectedChild(children, key, className) {
    if (!Array.isArray(children)) return false;
    return children.some(child => child?.key === key || (className && child?.props?.className?.includes?.(className)));
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

        this.handleUpdateQuests = () => {
            if (this.updateQuestsDebounce) clearTimeout(this.updateQuestsDebounce);
            this.updateQuestsDebounce = setTimeout(() => this.updateQuests(), 400);
        };

        this.completingQuests = new Map();
        this.claimingQuests = new Set();
        this.acceptingQuests = new Set();
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
        this.loadAndStart();
    }

    async loadAndStart() {
        const maxAttempts = 10;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (await loadDiscordModules()) break;

            if (attempt === maxAttempts - 1) {
                UI.showToast(`[${this.meta.name}] Discord modules not found. Plugin disabled.`, { type: "error", forceShow: true });
                setTimeout(() => Plugins.disable(this.meta.name), 0);
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
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

        installAuthSniffer();
        ensureDiscordToken().then(token => {
            if (!token) {
                UI.showToast(`[${this.meta.name}] Switch channels once if quests fail to start.`, { type: "info" });
            }
        });

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

        if (SortingFilterWithKey?.length >= 2 && typeof SortingFilterWithKey[1] === "string") {
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
        this.updateQuests();
    }

    stop() {
        QuestsStore?.removeChangeListener(this.handleUpdateQuests);
        this.stopAllFarming();
        Patcher.unpatchAll(this.meta.name);
        DOM.removeStyle(this.meta.name);
        modulesLoaded = false;
        modulesReady = false;
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

        if (this.claimingQuests) {
            this.claimingQuests.clear();
        }

        if (this.acceptingQuests) {
            this.acceptingQuests.clear();
        }

        if (this.updateQuestsDebounce) {
            clearTimeout(this.updateQuestsDebounce);
            this.updateQuestsDebounce = null;
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

    hasActiveCompletions() {
        return Array.from(this.completingQuests.values()).includes(true);
    }

    getActiveHandlers() {
        const handlers = new Set();
        for (const [questId, active] of this.completingQuests.entries()) {
            if (!active) continue;
            const info = getQuestTaskInfo(QuestsStore?.getQuest?.(questId) ?? { id: questId });
            if (info?.handler) handlers.add(info.handler);
        }
        return handlers;
    }

    canStartQuestHandler(handler) {
        const active = this.getActiveHandlers();
        if (this.settings.completeQuestsSequentially) {
            return active.size === 0;
        }
        return !active.has(handler);
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
        if (this.cooldownTimeout) {
            this.updateQuests();
            return;
        }

        if (!this.settings.completeQuestsSequentially && this.hasActiveCompletions()) {
            this.updateQuests();
            return;
        }

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

    ignoreQuest(questId, reason) {
        if (!this.ignoredQuests) this.ignoredQuests = new Set();
        this.ignoredQuests.add(questId);
        console.warn(`[${this.meta.name}] Ignoring quest ${questId}: ${reason}`);
    }

    getEnrolledHandlers(quests) {
        const handlers = new Set();
        for (const quest of quests) {
            const info = getQuestTaskInfo(quest);
            if (info?.handler) handlers.add(info.handler);
        }
        return handlers;
    }

    isQuestEligibleForFarming(quest) {
        if (this.ignoredQuests && this.ignoredQuests.has(quest.id)) return false;

        const taskInfo = getQuestTaskInfo(quest);
        if (!taskInfo) return false;

        const { handler } = taskInfo;
        if (isDesktopClient() && isMobileVideoQuest(taskInfo)) return false;

        const supported = (handler === "WATCH_VIDEO" && this.settings.farmVideos)
            || (handler === "PLAY_ON_DESKTOP" && this.settings.farmPlayOnDesktop)
            || (handler === "STREAM_ON_DESKTOP" && this.settings.farmStreamOnDesktop)
            || (handler === "PLAY_ACTIVITY" && this.settings.farmPlayActivity);

        if (!supported || handler === "ACHIEVEMENT_IN_ACTIVITY") return false;

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

        if (this.isOnQuestCooldown() && this.settings.completeQuestsSequentially) {
            return;
        }

        const onCooldown = this.isOnQuestCooldown();
        const availableQuests = [...QuestsStore.quests.values()];
        const acceptableQuests = availableQuests.filter(x => !x.userStatus?.enrolledAt && new Date(x.config.expiresAt).getTime() > Date.now()) || [];
        const completableQuests = availableQuests
            .filter(x => x.userStatus?.enrolledAt && !x.userStatus?.completedAt && new Date(x.config.expiresAt).getTime() > Date.now())
            .sort((a, b) => getQuestPriority(a) - getQuestPriority(b)) || [];
        const claimableQuests = availableQuests.filter(x => x.userStatus?.completedAt && !x.userStatus?.claimedAt && new Date(x.config.expiresAt).getTime() > Date.now()) || [];
        
        const logString = `Quests available: ${availableQuests.length} Acceptable: ${acceptableQuests.length} Completable: ${completableQuests.length} Claimable: ${claimableQuests.length}`;
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

        let hasCompletableEligible = completableQuests.some(q => this.isQuestEligibleForFarming(q));
        const maxAccepts = this.settings.completeQuestsSequentially ? 1 : 2;
        let acceptsThisPass = 0;
        const enrolledHandlers = this.getEnrolledHandlers(completableQuests);

        for (const quest of acceptableQuests) {
            if (onCooldown || acceptsThisPass >= maxAccepts) break;
            if (this.settings.completeQuestsSequentially && (this.hasActiveCompletions() || hasCompletableEligible)) {
                break;
            }
            if (!this.isQuestEligibleForFarming(quest)) continue;
            if (this.acceptingQuests.has(quest.id)) continue;

            const taskInfo = getQuestTaskInfo(quest);
            if (!taskInfo) continue;
            if (!this.settings.completeQuestsSequentially && enrolledHandlers.has(taskInfo.handler)) {
                continue;
            }

            this.acceptQuest(quest);
            acceptsThisPass++;
            enrolledHandlers.add(taskInfo.handler);
            if (this.settings.completeQuestsSequentially) {
                hasCompletableEligible = true;
            }
        }

        for (const quest of completableQuests) {
            if (onCooldown) break;
            if (this.completingQuests.get(quest.id) === true) {
                continue; // already completing
            }
            if (this.completingQuests.has(quest.id)) {
                this.completingQuests.delete(quest.id);
            }

            const taskInfo = getQuestTaskInfo(quest);
            if (!taskInfo || !this.canStartQuestHandler(taskInfo.handler)) {
                continue;
            }

            if (this.isQuestEligibleForFarming(quest)) {
                console.log("Starting to complete quest:", quest.config.messages.questName);
                this.completeQuest(quest);
            }
        }

        for (const quest of claimableQuests) {
            if (this.isQuestEligibleForFarming(quest)) {
                this.claimQuestReward(quest);
            }
        }
        /* console.log("Available quests updated:", availableQuests);
        console.log("Acceptable quests updated:", acceptableQuests);
        console.log("Completable quests updated:", completableQuests); */
    }

    acceptQuest(quest) {
        if (!this.settings.acceptQuestsAutomatically) return;
        if (this.acceptingQuests.has(quest.id)) return;

        const freshQuest = QuestsStore?.getQuest?.(quest.id) ?? quest;
        if (freshQuest.userStatus?.enrolledAt) return;

        this.acceptingQuests.add(quest.id);
        const questName = freshQuest.config.messages.questName;
        console.log("Accepting quest:", questName);

        const finishAccept = () => {
            this.acceptingQuests.delete(quest.id);
        };

        const taskInfo = getQuestTaskInfo(freshQuest);
        const enrollCTA = getQuestEnrollCTA(taskInfo?.handler);

        const enrollBody = {
            location: QuestLocationMap?.QUEST_HOME_DESKTOP ?? 11,
            is_targeted: false,
            metadata_sealed: null,
            traffic_metadata_sealed: getTrafficMetadataSealed(freshQuest.id),
        };

        const enrollViaApi = () => apiPost(`/quests/${freshQuest.id}/enroll`, enrollBody).then(() => {
            console.log("Accepted quest:", questName);
            finishAccept();
        }).catch(err => {
            finishAccept();
            console.error("Failed to accept quest:", questName, err);
        });

        if (!QuestApplyAction || !QuestLocationMap) {
            enrollViaApi();
            return;
        }

        const action = {
            questContent: QuestLocationMap.QUEST_HOME_DESKTOP,
            questContentCTA: enrollCTA,
            sourceQuestContent: 0,
        };
        QuestApplyAction(freshQuest.id, action).then(() => {
            console.log("Accepted quest:", questName);
            finishAccept();
        }).catch(() => {
            enrollViaApi();
        });
    }

    async claimQuestReward(quest) {
        if (!this.settings.claimRewardsAutomatically) return;
        if (this.claimingQuests.has(quest.id)) return;
        if (quest.userStatus?.claimedAt) return;

        this.claimingQuests.add(quest.id);
        const questName = quest.config.messages.questName;

        try {
            await this.apiDelay();
            await apiPost(`/quests/${quest.id}/claim-reward`, {
                platform: 0,
                location: QuestLocationMap?.QUEST_HOME_DESKTOP ?? 11,
                is_targeted: false,
                metadata_sealed: null,
                traffic_metadata_sealed: getTrafficMetadataSealed(quest.id),
            });
            console.log("Claimed reward for quest:", questName);
        } catch (err) {
            console.warn("Failed to claim reward for quest:", questName, err);
        } finally {
            this.claimingQuests.delete(quest.id);
        }
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

        try {
            const taskInfo = getQuestTaskInfo(quest);
            if (!taskInfo) {
                this.ignoreQuest(quest.id, "invalid or unknown task config");
                return;
            }

            const {
                quest: freshQuest,
                taskKey,
                handler,
                target: secondsNeeded,
                appId: applicationId,
                applicationName,
                configVersion,
            } = taskInfo;

            quest = freshQuest;
            const questName = quest.config?.messages?.questName ?? quest.id;
            let secondsDone = quest.userStatus?.progress?.[taskKey]?.value ?? 0;
            const isApp = typeof DiscordNative !== "undefined";

            if (handler === "ACHIEVEMENT_IN_ACTIVITY") {
                this.ignoreQuest(quest.id, "ACHIEVEMENT_IN_ACTIVITY is not supported yet");
                return;
            }

            if (!secondsNeeded || secondsNeeded <= 0) {
                this.ignoreQuest(quest.id, `invalid target (${secondsNeeded})`);
                return;
            }

            if ((handler === "PLAY_ON_DESKTOP" || handler === "STREAM_ON_DESKTOP") && !applicationId) {
                this.ignoreQuest(quest.id, "missing application id for game/stream quest");
                return;
            }

            if (!isApp && handler === "WATCH_VIDEO") {
                // video quests still work in browser
            } else if (!isApp) {
                console.log("This no longer works in browser for non-video quests. Use the discord desktop app to complete the", questName, "quest!");
                this.ignoreQuest(quest.id, "requires desktop app");
                return;
            }

            if (handler === "WATCH_VIDEO" && isMobileVideoQuest(taskInfo) && isDesktopClient()) {
                this.ignoreQuest(quest.id, "WATCH_VIDEO_ON_MOBILE is not supported on desktop");
                return;
            }

            this.completingQuests.set(quest.id, true);
            console.log(`Completing quest ${questName} (${quest.id}) - ${taskKey} for ${secondsNeeded} seconds.`);

            const pid = Math.floor(Math.random() * 30000) + 1000;

            const postWithRetry = async (url, body) => {
                let delay = 5;
                const maxDelay = 60;
                while (this.completingQuests.get(quest.id)) {
                    try {
                        await this.apiDelay();
                        return await apiPost(url, body);
                    } catch (err) {
                        if (isAuthError(err)) {
                            clearDiscordToken();
                            console.error(`[${this.meta.name}] Auth failed for quest ${questName}. Switch channels once, then reload Discord.`);
                            this.completingQuests.set(quest.id, false);
                            this.ignoreQuest(quest.id, "auth token unavailable");
                            throw err;
                        }
                        if (isSkippableQuestError(err)) {
                            console.warn(`[${this.meta.name}] Quest unavailable (${err.status}) for ${questName}. Skipping.`);
                            this.completingQuests.set(quest.id, false);
                            this.ignoreQuest(quest.id, `API returned ${err.status}`);
                            throw err;
                        }
                        console.warn(`Failed to POST to ${url} for quest ${questName}:`, err);
                        console.log("Retrying to POST for quest", questName, "in", delay, "seconds.");
                        await new Promise(resolve => setTimeout(resolve, delay * 1000));
                        delay = Math.min(delay < maxDelay ? delay * 2 : maxDelay, maxDelay);
                    }
                }
            };

            switch (handler) {
                case "WATCH_VIDEO":
                    let completed = false;
                    let watchVideo = async () => {
                        await ensureVideoQuestStarted(quest.id);
                        const enrolledAt = new Date(quest.userStatus?.enrolledAt ?? Date.now()).getTime();
                        const videoSpeed = 7;

                        while (true) {
                            if (!this.settings.hasAcceptedToUsePlugin || !this.settings.farmVideos || !this.completingQuests.get(quest.id)) {
                                console.log(`Stopping completing quest: ${questName}`);
                                this.completingQuests.set(quest.id, false);
                                return;
                            }

                            const maxAllowed = Math.floor((Date.now() - enrolledAt) / 1000) + 10;
                            const timestamp = secondsDone + videoSpeed;
                            if (maxAllowed - secondsDone < videoSpeed) {
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                continue;
                            }

                            await new Promise(resolve => setTimeout(resolve, randomDelayMs(videoSpeed * 1000, (videoSpeed + 2) * 1000)));
                            let res;
                            try {
                                res = await postWithRetry(`/quests/${quest.id}/video-progress`, {
                                    timestamp: Number(Math.min(secondsNeeded, timestamp + Math.random()).toFixed(6)),
                                });
                            } catch {
                                this.completingQuests.set(quest.id, false);
                                return;
                            }
                            if (!res?.body) {
                                this.completingQuests.set(quest.id, false);
                                return;
                            }
                            completed = res.body.completed_at != null;
                            const serverProgress = res.body.progress?.[taskKey]?.value ?? res.body.progress?.WATCH_VIDEO?.value;
                            secondsDone = Math.max(secondsDone, Math.min(secondsNeeded, serverProgress ?? timestamp));

                            if (completed || secondsDone >= secondsNeeded) {
                                break;
                            }
                        }

                        if (!completed) {
                            try {
                                await postWithRetry(`/quests/${quest.id}/video-progress`, {
                                    timestamp: Number(secondsNeeded.toFixed(6)),
                                });
                                completed = true;
                            } catch {
                                this.completingQuests.set(quest.id, false);
                                return;
                            }
                        }

                        console.log(`Quest ${questName} completed!`);
                        this.completingQuests.set(quest.id, false);
                        if (!this.ignoredQuests) this.ignoredQuests = new Set();
                        this.ignoredQuests.add(quest.id);
                        this.scheduleNextQuestUpdate("completed");
                    }
                    watchVideo().catch(err => {
                        if (!isAuthError(err)) {
                            console.error(`[${this.meta.name}] Video quest failed for ${questName}:`, err);
                        }
                        this.completingQuests.set(quest.id, false);
                    });
                    console.log(`Spoofing video for ${questName}.`);
                    break;

                case "PLAY_ON_DESKTOP":
                    (async () => {
                        await this.apiDelay();
                        let appData = null;
                        try {
                            appData = await fetchApplicationData(applicationId);
                        } catch (err) {
                            if (isAuthError(err)) {
                                console.warn(`[${this.meta.name}] Auth not ready for ${questName}. Will retry on next update.`);
                                this.completingQuests.set(quest.id, false);
                                return;
                            }
                            console.warn(`[${this.meta.name}] Using fallback app data for ${questName}:`, err);
                        }

                        const fakeGame = buildFakeGame(applicationId, applicationName, pid, appData);
                        const realGames = this.fakeGames.size == 0 ? RunningGameStore.getRunningGames() : [];
                        this.fakeGames.set(quest.id, fakeGame);
                        const fakeGames = Array.from(this.fakeGames.values());
                        DiscordModules.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: realGames, added: [fakeGame], games: fakeGames });

                        let lastUpdate = Date.now();
                        let playOnDesktop = (event) => {
                            if (event.questId !== quest.id) return;
                            lastUpdate = Date.now();
                            let progress = getQuestProgress(event.userStatus, taskKey, configVersion);
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
                    })().catch(err => {
                        console.error(`Failed to start PLAY_ON_DESKTOP for quest ${questName}:`, err);
                        this.completingQuests.set(quest.id, false);
                    });
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
                        let progress = getQuestProgress(event.userStatus, taskKey, configVersion);
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

                case "PLAY_ACTIVITY": {
                    const guildWithVoice = Object.values(GuildChannelStore.getAllGuilds()).find(x => x?.VOCAL?.length > 0);
                    const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id ?? guildWithVoice?.VOCAL?.[0]?.channel?.id;
                    if (!channelId) {
                        this.completingQuests.set(quest.id, false);
                        this.ignoreQuest(quest.id, "no voice channel available for activity quest");
                        break;
                    }
                    const streamKey = `call:${channelId}:1`;

                    let playActivity = async () => {
                        console.log("Completing quest", questName);

                        while (true) {
                            const res = await postWithRetry(`/quests/${quest.id}/heartbeat`, { stream_key: streamKey, terminal: false });
                            const progress = res.body.progress?.[taskKey]?.value ?? res.body.progress?.PLAY_ACTIVITY?.value ?? 0;
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
                }

                default:
                    this.ignoreQuest(quest.id, `unsupported handler ${handler}`);
                    this.completingQuests.set(quest.id, false);
                    break;
            }
        } catch (err) {
            console.error(`[${this.meta.name}] Failed to complete quest:`, quest?.config?.messages?.questName ?? quest?.id, err);
            this.completingQuests.set(quest?.id, false);
            if (quest?.id) this.ignoreQuest(quest.id, err?.message ?? "unexpected error");
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
};