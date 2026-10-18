/* ==========================================================================
   Earthborne Rangers — Field Journal
   Vanilla JS, local-first. All progress lives in localStorage.
   ========================================================================== */

(() => {
  "use strict";

  const STORAGE_KEY = "earthborne-field-journal-v1";
  const SAVE_DELAY = 320;
  const STATE_VERSION = 1;

  const ASPECTS = [
    { key: "awa", abbr: "AWA", name: "Awareness", zh: "感知" },
    { key: "fit", abbr: "FIT", name: "Fitness", zh: "体能" },
    { key: "foc", abbr: "FOC", name: "Focus", zh: "专注" },
    { key: "spi", abbr: "SPI", name: "Spirit", zh: "精神" },
  ];

  const WEATHER_META = {
    "A Perfect Day": { kind: "sun", zh: "晴日" },
    Downpour: { kind: "rain", zh: "暴雨" },
    "Howling Wind": { kind: "wind", zh: "狂风" },
    "Howling Winds": { kind: "wind", zh: "狂风" },
  };

  const CAMPAIGNS = {
    valley: {
      title: "Lure of the Valley",
      kicker: "核心游戏 · Core Game",
      missionCount: 33,
      extraMissionCount: 0,
      rewardColumns: 3,
      notableColumns: 2,
      noteRows: 10,
      showSecondaryWeather: false,
      dayGroups: [
        { start: 1, end: 3, weather: "A Perfect Day" },
        { start: 4, end: 7, weather: "Downpour" },
        { start: 8, end: 9, weather: "A Perfect Day" },
        { start: 10, end: 12, weather: "Downpour" },
        { start: 13, end: 14, weather: "Howling Winds" },
        { start: 15, end: 17, weather: "Downpour" },
        { start: 18, end: 20, weather: "Howling Winds" },
        { start: 21, end: 22, weather: "A Perfect Day" },
        { start: 23, end: 25, weather: "Downpour" },
        { start: 26, end: 28, weather: "Howling Winds" },
        { start: 29, end: 30, weather: "A Perfect Day" },
      ],
    },
    legacy: {
      title: "Legacy of the Ancestors",
      kicker: "扩展 · Expansion",
      missionCount: 30,
      extraMissionCount: 10,
      rewardColumns: 3,
      notableColumns: 3,
      noteRows: 12,
      showSecondaryWeather: true,
      dayGroups: [
        { start: 1, end: 3, weather: "Downpour", arcologyWeather: "Enveloping Silence" },
        { start: 4, end: 6, weather: "A Perfect Day", arcologyWeather: "Glitterain" },
        { start: 7, end: 8, weather: "Howling Wind", arcologyWeather: "Shimmering Runoff" },
        { start: 9, end: 12, weather: "Downpour", arcologyWeather: "Enveloping Silence" },
        { start: 13, end: 15, weather: "A Perfect Day", arcologyWeather: "Glitterain" },
        { start: 16, end: 18, weather: "Downpour", arcologyWeather: "Enveloping Silence" },
        { start: 19, end: 21, weather: "A Perfect Day", arcologyWeather: "Glitterain" },
        { start: 22, end: 23, weather: "Howling Wind", arcologyWeather: "Shimmering Runoff" },
        { start: 24, end: 27, weather: "Downpour", arcologyWeather: "Enveloping Silence" },
        { start: 28, end: 30, weather: "A Perfect Day", arcologyWeather: "Glitterain" },
      ],
    },
  };

  const ACHIEVEMENTS = [
    {
      slug: "unplanned-reunion",
      name: "Unplanned Reunion",
      zhName: "意外的重逢",
      desc: "Have Dace and Aell in play at the same time.",
      zhDesc: "让 Dace 与 Aell 同时在场。",
      image: "assets/badges/unplanned-reunion.png",
    },
    {
      slug: "electric-slide",
      name: "Electric Slide",
      zhName: "电光舞步",
      desc: "Complete the campaign using the Electric Fog weather every day.",
      zhDesc: "在战役的每一天都使用 Electric Fog 天气并完成战役。",
      image: "assets/badges/electric-slide.png",
    },
    {
      slug: "no-stone-left-unturned",
      name: "No Stone Left Unturned",
      zhName: "掘地三尺",
      desc: "Have every path card in the deck in play at the same time.",
      zhDesc: "让牌库中的所有 path 卡同时在场。",
      image: "assets/badges/no-stone-left-unturned.png",
    },
    {
      slug: "the-pentaverate",
      name: "The Pentaverate",
      zhName: "五人行",
      desc: "Have five humans within reach of one Ranger at the same time.",
      zhDesc: "让五个人类同时处于同一名游侠的触及范围内。",
      image: "assets/badges/the-pentaverate.png",
    },
    {
      slug: "ship-of-theseus",
      name: "Ship of Theseus",
      zhName: "忒修斯之船",
      desc: "Replace every card in your deck with a reward card.",
      zhDesc: "用奖励卡替换牌库中的每一张卡。",
      image: "assets/badges/ship-of-theseus.png",
    },
    {
      slug: "hard-pass",
      name: "Hard Pass",
      zhName: "硬核跳过",
      desc: "Finish the campaign without completing a single story mission.",
      zhDesc: "完成战役，且没有完成任何一个故事任务。",
      image: "assets/badges/hard-pass.png",
    },
    {
      slug: "noodling",
      name: "Noodling",
      zhName: "摸鱼",
      desc: "Catch a fish in the Black Mud.",
      zhDesc: "在 Black Mud 钓到一条鱼。",
      image: "assets/badges/noodling.png",
    },
    {
      slug: "she-s-a-natural",
      name: "She’s A Natural!",
      zhName: "天生好手！",
      desc: "Have Quisi cause a Cloudhive swarm to be discarded.",
      zhDesc: "让 Quisi 导致一群 Cloudhive 被弃置。",
      image: "assets/badges/she-s-a-natural.png",
    },
    {
      slug: "big-tech",
      name: "Big Tech",
      zhName: "大家伙",
      desc: "Discard a gear with 10 or more tokens on it using Moment of Desperation.",
      zhDesc: "使用 Moment of Desperation 弃置一件带有 10 个或更多标记的装备。",
      image: "assets/badges/big-tech.png",
    },
    {
      slug: "how-d-that-get-in-there",
      name: "How’d That Get in There?",
      zhName: "这玩意儿怎么进去的？",
      desc: "Add a card without the printed flora trait to Hy’s soup.",
      zhDesc: "把一张没有印刷 flora 特性的卡加入 Hy 的汤里。",
      image: "assets/badges/how-d-that-get-in-there.png",
    },
    {
      slug: "pro-gamer",
      name: "Pro Gamer",
      zhName: "硬核玩家",
      desc: "Pet Oru 3R or more times during a single round.",
      zhDesc: "在单轮中抚摸 Oru 3R 次或更多。",
      image: "assets/badges/pro-gamer.png",
    },
    {
      slug: "enough-already",
      name: "Enough Already!",
      zhName: "够了吧！",
      desc: "Play the same moment 10 times in one day.",
      zhDesc: "在同一天打出同一个 moment 10 次。",
      image: "assets/badges/enough-already.png",
    },
    {
      slug: "unlimited-power",
      name: "Unlimited Power!",
      zhName: "无限能量！",
      desc: "Have 7 or more energy in a single aspect.",
      zhDesc: "在单一属性中拥有 7 点或更多能量。",
      image: "assets/badges/unlimited-power.png",
    },
    {
      slug: "people-person",
      name: "People Person",
      zhName: "社交达人",
      desc: "Clear three or more humans with the same test.",
      zhDesc: "用同一次检定清除三个或更多人类。",
      image: "assets/badges/people-person.png",
    },
    {
      slug: "log-flume",
      name: "Log Flume",
      zhName: "激流木筏",
      desc: "Travel from White Sky to Tumbledown in a single day.",
      zhDesc: "在一天内从 White Sky 前往 Tumbledown。",
      image: "assets/badges/log-flume.png",
    },
    {
      slug: "all-out-of-options",
      name: "All Out of Options",
      zhName: "无路可走",
      desc: "Have only four cards remaining in the challenge deck.",
      zhDesc: "挑战牌库中只剩四张牌。",
      image: "assets/badges/all-out-of-options.png",
    },
  ];

  const SOUNDTRACK_TRACKS = [
    {
      title: "Earthborne Rangers",
      fullLength: "4:05",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6c/f4/33/6cf43313-43bb-e6cc-10f4-0203933076d0/mzaf_7569946419411428355.plus.aac.p.m4a",
      appleUrl: "https://music.apple.com/us/album/earthborne-rangers/1802670455?i=1802670456&uo=4",
    },
    {
      title: "The Buck and The Wolhund",
      fullLength: "4:48",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b5/eb/13/b5eb1352-a674-3225-00a6-215c2e3ba1da/mzaf_16054156422169930349.plus.aac.p.m4a",
      appleUrl: "https://music.apple.com/us/album/the-buck-and-the-wolhund/1802670455?i=1802670457&uo=4",
    },
    {
      title: "Jaws of the Naiad",
      fullLength: "3:47",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/23/96/76/23967619-add2-3197-e7e1-4458ff0b6070/mzaf_17248550166455072475.plus.aac.p.m4a",
      appleUrl: "https://music.apple.com/us/album/jaws-of-the-naiad/1802670455?i=1802670458&uo=4",
    },
    {
      title: "Clouds Do Part",
      fullLength: "5:38",
      previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6d/7e/bc/6d7ebcc1-93be-8493-23c3-d621ec357be4/mzaf_12380840104496875066.plus.aac.p.m4a",
      appleUrl: "https://music.apple.com/us/album/clouds-do-part/1802670455?i=1802670459&uo=4",
    },
  ];

  const TABS = ["character", "campaign", "achievements", "soundtrack"];

  const ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const els = {};
  let state = loadState();
  let activeCampaign = state.ui.activeCampaign;
  let activeTab = "character";
  let activeFilter = "all";
  let saveTimer = null;
  let toastTimer = null;
  let menuOpen = false;
  let saveErrorShown = false;
  let soundtrackAudio = null;
  let soundtrackIndex = 0;
  let soundtrackReady = false;
  let soundtrackErrorAt = 0;

  /* ==========================================================================
     Utilities
     ========================================================================== */

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ESCAPES[character]);
  }

  function asString(value) {
    return typeof value === "string" ? value : "";
  }

  function clampInt(value, min, max, fallback) {
    const number = Number.parseInt(value, 10);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function emptyMission() {
    return { day: "", name: "", progress: 0, done: false };
  }

  function normalizeStringArray(value, length) {
    const source = Array.isArray(value) ? value : [];
    return Array.from({ length }, (_, index) => asString(source[index]));
  }

  function getByPath(root, path) {
    return path.split(".").reduce((node, key) => (node == null ? undefined : node[key]), root);
  }

  function setByPath(root, path, value) {
    const parts = path.split(".");
    let node = root;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const key = parts[index];
      if (node[key] == null) {
        node[key] = /^\d+$/.test(parts[index + 1]) ? [] : {};
      }
      node = node[key];
    }
    node[parts[parts.length - 1]] = value;
  }

  function todayStamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getDayMeta(campaignKey, day) {
    const config = CAMPAIGNS[campaignKey];
    const group = config.dayGroups.find((item) => day >= item.start && day <= item.end);
    const weather = group ? group.weather : "A Perfect Day";
    const meta = WEATHER_META[weather] || WEATHER_META["A Perfect Day"];
    return {
      weather,
      arcologyWeather: group && group.arcologyWeather ? group.arcologyWeather : "",
      kind: meta.kind,
      zh: meta.zh,
    };
  }

  function getNextDay(campaignState) {
    const index = campaignState.completedDays.findIndex((done) => !done);
    return index === -1 ? null : index + 1;
  }

  /* ==========================================================================
     Persistence and state
     ========================================================================== */

  function createCampaignState(key) {
    const config = CAMPAIGNS[key];
    return {
      completedDays: Array(30).fill(false),
      missions: Array.from({ length: config.missionCount }, emptyMission),
      extraMissions: Array.from({ length: config.extraMissionCount }, emptyMission),
      rangers: Array(4).fill(""),
      location: "",
      terrain: "",
      rewards: Array(config.rewardColumns).fill(""),
      notable: Array(config.notableColumns).fill(""),
    };
  }

  function createDefaultState() {
    return {
      version: STATE_VERSION,
      character: {
        name: "",
        aspects: { awa: 2, fit: 2, foc: 2, spi: 2 },
        personality: "",
        role: "",
        background: "",
        backgroundCards: Array(5).fill(""),
        specialty: "",
        specialtyCards: Array(5).fill(""),
        outsideInterest: "",
        decklist: Array(30).fill(""),
        trades: Array.from({ length: 7 }, () => ({ give: "", get: "" })),
      },
      campaigns: {
        valley: createCampaignState("valley"),
        legacy: createCampaignState("legacy"),
      },
      achievements: Object.fromEntries(ACHIEVEMENTS.map((achievement) => [achievement.slug, false])),
      ui: { activeCampaign: "valley" },
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: null,
      },
    };
  }

  function normalizeCampaign(raw, key) {
    const config = CAMPAIGNS[key];
    const base = createCampaignState(key);
    if (!raw || typeof raw !== "object") return base;

    const days = Array.isArray(raw.completedDays) ? raw.completedDays : [];
    base.completedDays = Array.from({ length: 30 }, (_, index) => days[index] === true);

    const normalizeMissions = (value, count) => {
      const source = Array.isArray(value) ? value : [];
      return Array.from({ length: count }, (_, index) => {
        const mission = source[index] && typeof source[index] === "object" ? source[index] : {};
        const rawDay = asString(mission.day).replace(/\D/g, "").slice(0, 2);
        return {
          day: rawDay === "" ? "" : String(clampInt(rawDay, 1, 30, 1)),
          name: asString(mission.name),
          progress: clampInt(mission.progress, 0, 3, 0),
          done: mission.done === true,
        };
      });
    };

    base.missions = normalizeMissions(raw.missions, config.missionCount);
    base.extraMissions = normalizeMissions(raw.extraMissions, config.extraMissionCount);
    base.rangers = normalizeStringArray(raw.rangers, 4);
    base.location = asString(raw.location);
    base.terrain = asString(raw.terrain);
    base.rewards = normalizeStringArray(raw.rewards, config.rewardColumns);
    base.notable = normalizeStringArray(raw.notable, config.notableColumns);
    return base;
  }

  function normalizeState(raw) {
    const base = createDefaultState();
    if (!raw || typeof raw !== "object") return base;

    const character = raw.character && typeof raw.character === "object" ? raw.character : {};
    const aspects = character.aspects && typeof character.aspects === "object" ? character.aspects : {};

    base.character.name = asString(character.name);
    base.character.aspects = {
      awa: clampInt(aspects.awa, 1, 3, 2),
      fit: clampInt(aspects.fit, 1, 3, 2),
      foc: clampInt(aspects.foc, 1, 3, 2),
      spi: clampInt(aspects.spi, 1, 3, 2),
    };
    base.character.personality = asString(character.personality);
    base.character.role = asString(character.role);
    base.character.background = asString(character.background);
    base.character.backgroundCards = normalizeStringArray(character.backgroundCards, 5);
    base.character.specialty = asString(character.specialty);
    base.character.specialtyCards = normalizeStringArray(character.specialtyCards, 5);
    base.character.outsideInterest = asString(character.outsideInterest);
    base.character.decklist = normalizeStringArray(character.decklist, 30);

    const trades = Array.isArray(character.trades) ? character.trades : [];
    base.character.trades = Array.from({ length: 7 }, (_, index) => {
      const trade = trades[index] && typeof trades[index] === "object" ? trades[index] : {};
      return { give: asString(trade.give), get: asString(trade.get) };
    });

    const campaigns = raw.campaigns && typeof raw.campaigns === "object" ? raw.campaigns : {};
    base.campaigns.valley = normalizeCampaign(campaigns.valley, "valley");
    base.campaigns.legacy = normalizeCampaign(campaigns.legacy, "legacy");

    if (raw.achievements && typeof raw.achievements === "object") {
      for (const achievement of ACHIEVEMENTS) {
        base.achievements[achievement.slug] = raw.achievements[achievement.slug] === true;
      }
    }

    if (raw.ui && raw.ui.activeCampaign && CAMPAIGNS[raw.ui.activeCampaign]) {
      base.ui.activeCampaign = raw.ui.activeCampaign;
    }

    base.version = STATE_VERSION;
    if (raw.meta && typeof raw.meta === "object") {
      base.meta.createdAt = asString(raw.meta.createdAt) || base.meta.createdAt;
      base.meta.updatedAt = asString(raw.meta.updatedAt) || null;
    }

    return base;
  }

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return createDefaultState();
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== "object") return createDefaultState();
      return normalizeState(parsed);
    } catch (error) {
      console.warn("Could not load journal state.", error);
      return createDefaultState();
    }
  }

  function saveNow() {
    window.clearTimeout(saveTimer);
    saveTimer = null;
    try {
      state.meta.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveState("saved");
      saveErrorShown = false;
    } catch (error) {
      console.warn("Could not save journal state.", error);
      setSaveState("error");
      if (!saveErrorShown) {
        saveErrorShown = true;
        toast("无法保存到浏览器，请先导出备份");
      }
    }
  }

  function scheduleSave() {
    setSaveState("saving");
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveNow, SAVE_DELAY);
  }

  function setSaveState(mode) {
    if (!els.saveState || !els.saveText) return;
    els.saveState.dataset.state = mode;
    els.saveText.textContent = mode === "saving" ? "保存中…" : mode === "error" ? "保存失败" : "已保存";
  }

  /* ==========================================================================
     Init
     ========================================================================== */

  function init() {
    cacheElements();
    bindEvents();
    renderAll();
    setupSoundtrack();

    const hash = window.location.hash.replace("#", "");
    const initialTab = TABS.includes(hash) ? hash : "character";
    setTab(initialTab, { updateHash: true, scroll: false });

    // Persist the normalized state on first run and make sure storage works.
    saveNow();
  }

  function cacheElements() {
    els.saveState = $("#save-state");
    els.saveText = $("#save-text");
    els.menuToggle = $("#menu-toggle");
    els.menu = $("#menu");
    els.toast = $("#toast");
    els.resetDialog = $("#reset-dialog");
    els.importInput = $("#import-input");

    els.views = $$(".view");
    els.tabs = $$(".tab");
    els.tabList = $(".tabs");

    els.aspectRow = $("#aspect-row");
    els.aspectTotal = $("#aspect-total");
    els.aspectTotalValue = $("#aspect-total-value");
    els.backgroundCards = $("#background-cards");
    els.specialtyCards = $("#specialty-cards");
    els.decklist = $("#decklist");
    els.decklistCount = $("#decklist-count");
    els.trades = $("#trades");

    els.campaignButtons = $$(".campaign-switch__button");
    els.campaignPrintTitle = $("#campaign-print-title");
    els.dayStrip = $("#day-strip");
    els.dayGroups = $("#day-groups");
    els.daySecondary = $("#day-secondary");
    els.dayLegendDual = $("#day-legend-dual");
    els.dayCount = $("#day-count");
    els.dayProgressBar = $("#day-progress-bar");
    els.completeNext = $('[data-action="complete-next"]');
    els.campaignRangers = $("#campaign-rangers");
    els.campaignLocation = $("#campaign-location");
    els.campaignTerrain = $("#campaign-terrain");
    els.missionGrid = $("#mission-grid");
    els.extraMissionsWrap = $("#extra-missions-wrap");
    els.extraMissionGrid = $("#extra-mission-grid");
    els.missionsActive = $("#missions-active");
    els.missionsDone = $("#missions-done");
    els.rewardNotes = $("#reward-notes");
    els.notableNotes = $("#notable-notes");

    els.achievementGrid = $("#achievement-grid");
    els.achievementEmpty = $("#achievement-empty");
    els.achievementRing = $("#achievement-ring");
    els.achievementCount = $("#achievement-count");
    els.achievementSummaryText = $("#achievement-summary-text");
    els.filterButtons = $$(".filter-button");
    els.filterAllCount = $("#filter-count-all");
    els.filterEarnedCount = $("#filter-count-earned");
    els.filterUnearnedCount = $("#filter-count-unearned");

    els.soundtrackPlayer = $(".player-card");
    els.soundtrackAudio = $("#soundtrack-audio");
    els.soundtrackTracklist = $("#soundtrack-tracklist");
    els.soundtrackToggle = $('[data-action="soundtrack-toggle"]');
    els.soundtrackNowTitle = $("#now-playing-title");
    els.soundtrackSeek = $("#soundtrack-seek");
    els.soundtrackCurrent = $("#soundtrack-current");
    els.soundtrackTotal = $("#soundtrack-total");
    els.soundtrackStatus = $("#soundtrack-status");
  }

  /* ==========================================================================
     Tabs, menu, toast
     ========================================================================== */

  function setTab(tab, options = {}) {
    const { updateHash = true, scroll = true } = options;
    if (!TABS.includes(tab)) tab = "character";
    activeTab = tab;

    if (tab !== "soundtrack" && soundtrackAudio && !soundtrackAudio.paused) {
      soundtrackAudio.pause();
    }

    for (const view of els.views) {
      view.hidden = view.dataset.view !== tab;
    }

    for (const button of els.tabs) {
      const selected = button.dataset.tab === tab;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    }

    if (updateHash) {
      try {
        history.replaceState(null, "", `#${tab}`);
      } catch {
        // Some browsers restrict history changes on file:// URLs.
      }
    }

    if (scroll) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }
  }

  function openMenu() {
    if (!els.menu) return;
    menuOpen = true;
    els.menu.hidden = false;
    els.menuToggle.setAttribute("aria-expanded", "true");
    const firstItem = $("button", els.menu);
    if (firstItem) firstItem.focus();
  }

  function closeMenu(options = {}) {
    const { restoreFocus = false } = options;
    if (!els.menu || !menuOpen) return;
    menuOpen = false;
    els.menu.hidden = true;
    els.menuToggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) els.menuToggle.focus();
  }

  function toggleMenu() {
    if (menuOpen) closeMenu({ restoreFocus: true });
    else openMenu();
  }

  function toast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2800);
  }

  /* ==========================================================================
     Character
     ========================================================================== */

  function renderAll() {
    activeCampaign = state.ui.activeCampaign;
    renderCharacter();
    renderCampaign(activeCampaign);
    renderAchievements();
    syncBoundFields(document);
    updateAspectTotal();
  }

  function syncBoundFields(root) {
    for (const field of $$("[data-bind]", root)) {
      const value = getByPath(state, field.dataset.bind);
      field.value = value == null ? "" : value;
    }
  }

  function renderCharacter() {
    syncBoundFields($("#view-character"));
    renderAspects();
    renderCardFields(els.backgroundCards, "character.backgroundCards");
    renderCardFields(els.specialtyCards, "character.specialtyCards");
    renderDecklist();
    renderTrades();
    updateDecklistCount();
  }

  function renderAspects() {
    els.aspectRow.innerHTML = ASPECTS.map((aspect) => {
      const value = state.character.aspects[aspect.key];
      return `
        <div class="aspect">
          <button
            type="button"
            class="aspect-diamond"
            data-action="aspect-inc"
            data-aspect="${aspect.key}"
            role="spinbutton"
            aria-valuemin="1"
            aria-valuemax="3"
            aria-valuenow="${value}"
            aria-label="${aspect.name} ${aspect.zh}，当前 ${value}，点击增加"
            title="左键增加 · Shift 点击或右键减少">
            <span class="aspect-inner">
              <span class="aspect-abbr">${aspect.abbr}</span>
              <span class="aspect-value">${value}</span>
            </span>
          </button>
          <span class="aspect-name">${aspect.name}<span>${aspect.zh}</span></span>
          <span class="aspect-pips" aria-hidden="true">
            ${[1, 2, 3].map((step) => `<i class="aspect-pip${value >= step ? " is-filled" : ""}"></i>`).join("")}
          </span>
        </div>
      `;
    }).join("");
    updateAspectTotal();
  }

  function updateAspectTotal() {
    const total = ASPECTS.reduce((sum, aspect) => sum + state.character.aspects[aspect.key], 0);
    els.aspectTotalValue.textContent = total;
    els.aspectTotal.classList.toggle("is-invalid", total !== 8);
  }

  function refreshAspect(aspectKey) {
    const button = $(`[data-action="aspect-inc"][data-aspect="${aspectKey}"]`, els.aspectRow);
    if (!button) return;
    const value = state.character.aspects[aspectKey];
    const aspect = ASPECTS.find((item) => item.key === aspectKey);
    const valueElement = $(".aspect-value", button);
    if (valueElement) valueElement.textContent = value;
    button.setAttribute("aria-valuenow", String(value));
    button.setAttribute("aria-label", `${aspect.name} ${aspect.zh}，当前 ${value}，点击增加`);
    const pips = $$(".aspect-pip", button.parentElement);
    pips.forEach((pip, index) => {
      pip.classList.toggle("is-filled", value >= index + 1);
    });
    updateAspectTotal();
  }

  function adjustAspect(aspectKey, delta) {
    const values = state.character.aspects;
    if (!(aspectKey in values)) return;
    let next = values[aspectKey] + delta;
    if (next > 3) next = 1;
    if (next < 1) next = 3;
    values[aspectKey] = next;
    refreshAspect(aspectKey);
    scheduleSave();
  }

  function renderCardFields(container, path) {
    const cards = getByPath(state, path) || [];
    container.innerHTML = Array.from({ length: 5 }, (_, index) => `
      <label class="card-field">
        <span class="card-field__index">Card ${index + 1}</span>
        <input
          class="line-input"
          type="text"
          data-bind="${path}.${index}"
          value="${escapeHtml(cards[index])}"
          placeholder="卡牌名称"
          autocomplete="off"
          data-enter-next>
      </label>
    `).join("");
  }

  function renderDecklist() {
    const cards = state.character.decklist;
    const column = (start, end) => `
      <div class="deck-column">
        ${Array.from({ length: end - start }, (_, offset) => {
          const index = start + offset;
          return `
            <label class="deck-line">
              <span class="deck-line__index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
              <span class="sr-only">牌库第 ${index + 1} 张</span>
              <input
                type="text"
                data-bind="character.decklist.${index}"
                value="${escapeHtml(cards[index])}"
                autocomplete="off"
                data-enter-next>
            </label>
          `;
        }).join("")}
      </div>
    `;
    els.decklist.innerHTML = column(0, 15) + column(15, 30);
    updateDecklistCount();
  }

  function updateDecklistCount() {
    if (!els.decklistCount) return;
    const filled = state.character.decklist.filter((card) => card.trim() !== "").length;
    els.decklistCount.textContent = `${filled} / 30`;
  }

  function renderTrades() {
    els.trades.innerHTML = state.character.trades.map((trade, index) => `
      <div class="trade-row">
        <input
          type="text"
          data-bind="character.trades.${index}.give"
          value="${escapeHtml(trade.give)}"
          placeholder="${index === 0 ? "给出" : ""}"
          aria-label="第 ${index + 1} 笔交易，给出"
          autocomplete="off"
          data-enter-next>
        <span class="trade-row__for" aria-hidden="true">for</span>
        <input
          type="text"
          data-bind="character.trades.${index}.get"
          value="${escapeHtml(trade.get)}"
          placeholder="${index === 0 ? "换得" : ""}"
          aria-label="第 ${index + 1} 笔交易，换得"
          autocomplete="off"
          data-enter-next>
      </div>
    `).join("");
  }

  /* ==========================================================================
     Campaign
     ========================================================================== */

  function switchCampaign(key) {
    if (!CAMPAIGNS[key] || key === activeCampaign) return;
    activeCampaign = key;
    state.ui.activeCampaign = key;
    renderCampaign(key);
    scheduleSave();
  }

  function renderCampaign(key) {
    const config = CAMPAIGNS[key];
    const campaign = state.campaigns[key];

    for (const button of els.campaignButtons) {
      const selected = button.dataset.campaign === key;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    }

    if (els.campaignPrintTitle) {
      els.campaignPrintTitle.textContent = `${config.title} · ${config.kicker}`;
    }

    renderDayTrack(key);
    renderRangers(key);
    renderMissions(key);
    renderNotes(key);

    els.campaignLocation.value = campaign.location;
    els.campaignTerrain.value = campaign.terrain;
    updateCampaignStats(key);

    // Keep the character/campaign heading in sync with the selected tracker.
    const dayTitle = $("#day-title");
    if (dayTitle) {
      dayTitle.innerHTML = `Day Track <span>日程</span>`;
    }
    const missionTitle = $("#missions-title");
    if (missionTitle) {
      missionTitle.innerHTML = `Missions <span>任务</span>`;
    }
    if (els.dayLegendDual) {
      els.dayLegendDual.hidden = !config.showSecondaryWeather;
    }
  }

  function renderDayTrack(key) {
    const campaign = state.campaigns[key];
    const nextDay = getNextDay(campaign);

    els.dayStrip.innerHTML = Array.from({ length: 30 }, (_, index) => {
      const day = index + 1;
      const meta = getDayMeta(key, day);
      const done = campaign.completedDays[index];
      const label = `第 ${day} 天，Valley 天气 ${meta.weather}${meta.arcologyWeather ? `，Arcology 天气 ${meta.arcologyWeather}` : ""}${done ? "，已完成" : ""}`;
      return `
        <button
          type="button"
          class="day-pill${done ? " is-done" : ""}${nextDay === day ? " is-next" : ""}"
          data-action="toggle-day"
          data-day="${day}"
          data-weather="${meta.kind}"
          aria-pressed="${done}"
          aria-label="${escapeHtml(label)}"
          title="${escapeHtml(label)}">
          <span aria-hidden="true">${day}</span>
        </button>
      `;
    }).join("");

    els.dayGroups.innerHTML = CAMPAIGNS[key].dayGroups.map((group) => {
      const meta = WEATHER_META[group.weather];
      return `
        <div
          class="day-group day-group--${meta.kind}"
          style="grid-column: ${group.start} / ${group.end + 1}"
          title="${escapeHtml(`${group.weather} · ${meta.zh}`)}">
          <span class="day-group__rule" aria-hidden="true"></span>
          <span class="day-group__label">${escapeHtml(group.weather)}</span>
        </div>
      `;
    }).join("");

    if (CAMPAIGNS[key].showSecondaryWeather) {
      els.daySecondary.hidden = false;
      els.daySecondary.innerHTML = CAMPAIGNS[key].dayGroups.map((group) => `
        <div
          class="day-secondary-item"
          style="grid-column: ${group.start} / ${group.end + 1}"
          title="Arcology 推荐天气">${escapeHtml(group.arcologyWeather)}</div>
      `).join("");
    } else {
      els.daySecondary.hidden = true;
      els.daySecondary.innerHTML = "";
    }

    refreshDayUI(key);
  }

  function refreshDayUI(key = activeCampaign) {
    const campaign = state.campaigns[key];
    const nextDay = getNextDay(campaign);
    const buttons = $$(".day-pill", els.dayStrip);

    buttons.forEach((button, index) => {
      const day = index + 1;
      const done = campaign.completedDays[index];
      const meta = getDayMeta(key, day);
      const label = `第 ${day} 天，Valley 天气 ${meta.weather}${meta.arcologyWeather ? `，Arcology 天气 ${meta.arcologyWeather}` : ""}${done ? "，已完成" : ""}`;
      button.classList.toggle("is-done", done);
      button.classList.toggle("is-next", nextDay === day);
      button.setAttribute("aria-pressed", String(done));
      button.setAttribute("aria-label", label);
      button.title = label;
    });

    const doneCount = campaign.completedDays.filter(Boolean).length;
    els.dayCount.textContent = doneCount;
    els.dayProgressBar.style.width = `${(doneCount / 30) * 100}%`;
    els.completeNext.disabled = nextDay === null;
    els.completeNext.textContent = nextDay === null ? "全部完成" : "标记下一日";
  }

  function toggleDay(day) {
    const campaign = state.campaigns[activeCampaign];
    if (!campaign || day < 1 || day > 30) return;
    campaign.completedDays[day - 1] = !campaign.completedDays[day - 1];
    refreshDayUI();
    scheduleSave();
  }

  function completeNextDay() {
    const campaign = state.campaigns[activeCampaign];
    const nextDay = getNextDay(campaign);
    if (nextDay === null) return;
    campaign.completedDays[nextDay - 1] = true;
    refreshDayUI();
    scheduleSave();
  }

  function renderRangers(key) {
    const campaign = state.campaigns[key];
    els.campaignRangers.innerHTML = campaign.rangers.map((name, index) => `
      <label class="ranger-line">
        <span class="ranger-line__index" aria-hidden="true">${index + 1}</span>
        <span class="sr-only">游侠 ${index + 1}</span>
        <input
          type="text"
          data-bind="campaigns.${key}.rangers.${index}"
          value="${escapeHtml(name)}"
          placeholder="Ranger name"
          autocomplete="off"
          data-enter-next>
      </label>
    `).join("");
  }

  function missionRowHtml(key, listKey, index, mission, isExtra = false) {
    const path = `campaigns.${key}.${listKey}.${index}`;
    const displayNumber = index + 1;
    const missionName = isExtra ? `追加任务 ${displayNumber}` : `任务 ${displayNumber}`;
    return `
      <div class="mission-row${mission.done ? " is-done" : ""}" data-mission-list="${listKey}" data-mission-index="${index}">
        <label class="mission-day">
          <span class="sr-only">${missionName}开始于第几天</span>
          <input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="2"
            data-bind="${path}.day"
            data-sanitize="mission-day"
            value="${escapeHtml(mission.day)}"
            placeholder="–"
            aria-label="${missionName}开始于第几天"
            autocomplete="off">
        </label>
        <input
          class="mission-name"
          type="text"
          data-bind="${path}.name"
          value="${escapeHtml(mission.name)}"
          placeholder="Mission name"
          aria-label="${missionName}名称"
          autocomplete="off"
          spellcheck="false">
        <div class="progress-pips" role="group" aria-label="${missionName}进度">
          ${[1, 2, 3].map((step) => `
            <button
              type="button"
              class="pip${mission.progress >= step ? " is-filled" : ""}"
              data-action="mission-progress"
              data-list="${listKey}"
              data-index="${index}"
              data-step="${step}"
              aria-pressed="${mission.progress >= step}"
              aria-label="${missionName}进度设为 ${step} / 3"
              title="${step} / 3">
              <span></span>
            </button>
          `).join("")}
        </div>
        <button
          type="button"
          class="mission-check"
          data-action="mission-done"
          data-list="${listKey}"
          data-index="${index}"
          aria-pressed="${mission.done}"
          aria-label="${mission.done ? "取消完成" : "标记完成"}${missionName}"
          title="${mission.done ? "取消完成" : "标记完成"}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>
        </button>
      </div>
    `;
  }

  function renderMissions(key) {
    const config = CAMPAIGNS[key];
    const campaign = state.campaigns[key];

    els.missionGrid.innerHTML = campaign.missions
      .map((mission, index) => missionRowHtml(key, "missions", index, mission))
      .join("");

    if (config.extraMissionCount > 0) {
      els.extraMissionsWrap.hidden = false;
      els.extraMissionGrid.innerHTML = campaign.extraMissions
        .map((mission, index) => missionRowHtml(key, "extraMissions", index, mission, true))
        .join("");
    } else {
      els.extraMissionsWrap.hidden = true;
      els.extraMissionGrid.innerHTML = "";
    }

    updateMissionStats(key);
  }

  function updateMissionStats(key = activeCampaign) {
    const campaign = state.campaigns[key];
    const allMissions = [...campaign.missions, ...campaign.extraMissions];
    const done = allMissions.filter((mission) => mission.done).length;
    const recorded = allMissions.filter((mission) => (
      mission.name.trim() !== "" ||
      mission.day !== "" ||
      mission.progress > 0 ||
      mission.done
    )).length;
    const active = Math.max(0, recorded - done);

    els.missionsActive.textContent = active;
    els.missionsDone.textContent = done;
  }

  function updateMissionProgress(button) {
    const listKey = button.dataset.list;
    const index = Number(button.dataset.index);
    const step = Number(button.dataset.step);
    const campaign = state.campaigns[activeCampaign];
    if (!campaign || !["missions", "extraMissions"].includes(listKey)) return;
    const mission = campaign[listKey][index];
    if (!mission) return;

    mission.progress = mission.progress === step ? step - 1 : step;

    const row = button.closest(".mission-row");
    if (row) {
      $$(".pip", row).forEach((pip, pipIndex) => {
        const filled = mission.progress >= pipIndex + 1;
        pip.classList.toggle("is-filled", filled);
        pip.setAttribute("aria-pressed", String(filled));
      });
    }

    updateMissionStats();
    scheduleSave();
  }

  function toggleMissionDone(button) {
    const listKey = button.dataset.list;
    const index = Number(button.dataset.index);
    const campaign = state.campaigns[activeCampaign];
    if (!campaign || !["missions", "extraMissions"].includes(listKey)) return;
    const mission = campaign[listKey][index];
    if (!mission) return;

    mission.done = !mission.done;
    const row = button.closest(".mission-row");
    if (row) row.classList.toggle("is-done", mission.done);
    button.setAttribute("aria-pressed", String(mission.done));
    const missionName = listKey === "extraMissions" ? `追加任务 ${index + 1}` : `任务 ${index + 1}`;
    button.setAttribute("aria-label", `${mission.done ? "取消完成" : "标记完成"}${missionName}`);
    button.title = mission.done ? "取消完成" : "标记完成";

    updateMissionStats();
    scheduleSave();
  }

  function renderNotes(key) {
    const config = CAMPAIGNS[key];
    const campaign = state.campaigns[key];
    const noteHeight = `${config.noteRows * 31}px`;

    els.rewardNotes.style.setProperty("--note-cols", config.rewardColumns);
    els.rewardNotes.style.setProperty("--note-height", noteHeight);
    els.rewardNotes.innerHTML = campaign.rewards.map((text, index) => `
      <label class="note-column">
        <span class="sr-only">奖励记录第 ${index + 1} 栏</span>
        <textarea
          class="lined-textarea"
          rows="${config.noteRows}"
          data-bind="campaigns.${key}.rewards.${index}"
          placeholder="${index === 0 ? "记录获得的奖励…" : ""}"
          spellcheck="false">${escapeHtml(text)}</textarea>
      </label>
    `).join("");

    els.notableNotes.style.setProperty("--note-cols", config.notableColumns);
    els.notableNotes.style.setProperty("--note-height", noteHeight);
    els.notableNotes.innerHTML = campaign.notable.map((text, index) => `
      <label class="note-column">
        <span class="sr-only">重要事件第 ${index + 1} 栏</span>
        <textarea
          class="lined-textarea"
          rows="${config.noteRows}"
          data-bind="campaigns.${key}.notable.${index}"
          placeholder="${index === 0 ? "记录值得记住的事…" : ""}"
          spellcheck="false">${escapeHtml(text)}</textarea>
      </label>
    `).join("");
  }

  function updateCampaignStats(key = activeCampaign) {
    updateMissionStats(key);
    const campaign = state.campaigns[key];
    const done = campaign.completedDays.filter(Boolean).length;
    els.dayCount.textContent = done;
    els.dayProgressBar.style.width = `${(done / 30) * 100}%`;
  }

  /* ==========================================================================
     Achievements
     ========================================================================== */

  function renderAchievements() {
    els.achievementGrid.innerHTML = ACHIEVEMENTS.map((achievement) => {
      const earned = state.achievements[achievement.slug] === true;
      return `
        <button
          type="button"
          class="achievement-card${earned ? " is-earned" : ""}"
          data-achievement="${achievement.slug}"
          data-earned="${earned}"
          aria-pressed="${earned}">
          <span class="achievement-card__badge">
            <img src="${achievement.image}" alt="" width="500" height="500">
            <span class="achievement-card__check" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7"/></svg>
            </span>
          </span>
          <span class="achievement-card__body">
            <span class="achievement-card__status">${earned ? "已达成 · Earned" : "未达成 · Unearned"}</span>
            <span class="achievement-card__title">
              ${escapeHtml(achievement.name)}
              <span>${escapeHtml(achievement.zhName)}</span>
            </span>
            <span class="achievement-card__desc">${escapeHtml(achievement.desc)}</span>
            <span class="achievement-card__desc-zh">${escapeHtml(achievement.zhDesc)}</span>
          </span>
        </button>
      `;
    }).join("");

    syncFilterButtons();
    updateAchievementSummary();
    applyAchievementFilter();
  }

  function toggleAchievement(card) {
    const slug = card.dataset.achievement;
    const achievement = ACHIEVEMENTS.find((item) => item.slug === slug);
    if (!achievement) return;

    const earned = !(state.achievements[slug] === true);
    state.achievements[slug] = earned;
    card.dataset.earned = String(earned);
    card.classList.toggle("is-earned", earned);
    card.setAttribute("aria-pressed", String(earned));

    const status = $(".achievement-card__status", card);
    if (status) status.textContent = earned ? "已达成 · Earned" : "未达成 · Unearned";

    if (earned) {
      card.classList.remove("just-earned");
      void card.offsetWidth;
      card.classList.add("just-earned");
      window.setTimeout(() => card.classList.remove("just-earned"), 850);
      toast(`已达成 · ${achievement.name}`);
    }

    updateAchievementSummary();
    applyAchievementFilter();
    scheduleSave();
  }

  function updateAchievementSummary() {
    const earned = ACHIEVEMENTS.filter((achievement) => state.achievements[achievement.slug]).length;
    const total = ACHIEVEMENTS.length;
    const unearned = total - earned;
    const percent = total === 0 ? 0 : Math.round((earned / total) * 100);

    els.achievementCount.textContent = earned;
    els.achievementRing.style.setProperty("--progress", percent);
    els.achievementRing.setAttribute("role", "progressbar");
    els.achievementRing.setAttribute("aria-valuemin", "0");
    els.achievementRing.setAttribute("aria-valuemax", String(total));
    els.achievementRing.setAttribute("aria-valuenow", String(earned));
    els.achievementRing.setAttribute("aria-label", `已获得 ${earned} / ${total} 枚成就徽章`);

    if (earned === 0) {
      els.achievementSummaryText.textContent = "尚未获得徽章";
    } else if (earned === total) {
      els.achievementSummaryText.textContent = "全部成就达成！";
    } else {
      els.achievementSummaryText.textContent = `已获得 ${earned} 枚徽章`;
    }

    els.filterAllCount.textContent = total;
    els.filterEarnedCount.textContent = earned;
    els.filterUnearnedCount.textContent = unearned;
  }

  function syncFilterButtons() {
    for (const button of els.filterButtons) {
      const selected = button.dataset.filter === activeFilter;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
  }

  function setFilter(filter) {
    if (!["all", "earned", "unearned"].includes(filter)) return;
    activeFilter = filter;
    syncFilterButtons();
    applyAchievementFilter();
  }

  function applyAchievementFilter() {
    let visible = 0;
    for (const card of $$(".achievement-card", els.achievementGrid)) {
      const earned = card.dataset.earned === "true";
      const show = activeFilter === "all" || (activeFilter === "earned" && earned) || (activeFilter === "unearned" && !earned);
      card.hidden = !show;
      if (show) visible += 1;
    }

    els.achievementEmpty.hidden = visible !== 0;
    if (visible !== 0) return;

    if (activeFilter === "earned") {
      els.achievementEmpty.textContent = "还没有达成任何成就。去山谷里走走吧。";
    } else if (activeFilter === "unearned") {
      els.achievementEmpty.textContent = "所有成就都已达成。山谷记得你的每一步。";
    } else {
      els.achievementEmpty.textContent = "暂时没有可显示的成就。";
    }
  }

  /* ==========================================================================
     Soundtrack preview player
     ========================================================================== */

  function setupSoundtrack() {
    if (soundtrackReady || !els.soundtrackAudio || !els.soundtrackTracklist) return;
    soundtrackReady = true;
    soundtrackAudio = els.soundtrackAudio;
    soundtrackAudio.preload = "none";
    soundtrackAudio.dataset.trackIndex = "";

    els.soundtrackTracklist.innerHTML = SOUNDTRACK_TRACKS.map((track, index) => `
      <div class="track-row${index === 0 ? " is-active" : ""}" data-track-row="${index}">
        <button
          type="button"
          class="track-main"
          data-action="soundtrack-track"
          data-track-index="${index}"
          aria-label="试听：${escapeHtml(track.title)}">
          <span class="track-number">${String(index + 1).padStart(2, "0")}</span>
          <span class="track-icon" aria-hidden="true">
            <svg class="icon-play" viewBox="0 0 24 24"><path d="M8 5.5 19 12 8 18.5v-13Z" fill="currentColor" stroke="none"/></svg>
            <svg class="icon-pause" viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" stroke="none"/></svg>
          </span>
          <span class="track-copy">
            <span class="track-name">${escapeHtml(track.title)}</span>
            <span class="track-sub">Official preview · 30 sec</span>
          </span>
          <span class="track-length">${escapeHtml(track.fullLength)}<small>全曲</small></span>
        </button>
        <a
          class="track-link"
          href="${escapeHtml(track.appleUrl)}"
          target="_blank"
          rel="noreferrer"
          aria-label="在 Apple Music 查看 ${escapeHtml(track.title)}">Apple ↗</a>
      </div>
    `).join("");

    resetSoundtrackProgress(30);
    els.soundtrackSeek.disabled = true;
    updateSoundtrackUI();

    soundtrackAudio.addEventListener("loadedmetadata", () => {
      const duration = Number.isFinite(soundtrackAudio.duration) && soundtrackAudio.duration > 0
        ? soundtrackAudio.duration
        : 30;
      els.soundtrackSeek.max = String(duration);
      els.soundtrackSeek.disabled = false;
      els.soundtrackTotal.textContent = formatTime(duration);
      updateSoundtrackProgress();
    });
    soundtrackAudio.addEventListener("timeupdate", updateSoundtrackProgress);
    soundtrackAudio.addEventListener("play", () => {
      soundtrackErrorAt = 0;
      updateSoundtrackUI();
    });
    soundtrackAudio.addEventListener("pause", updateSoundtrackUI);
    soundtrackAudio.addEventListener("ended", handleSoundtrackEnded);
    soundtrackAudio.addEventListener("error", () => {
      const code = soundtrackAudio.error ? soundtrackAudio.error.code : 0;
      if (!code || code === MediaError.MEDIA_ERR_ABORTED) return;
      els.soundtrackSeek.disabled = true;
      soundtrackAudio.dataset.trackIndex = "";
      updateSoundtrackUI();
      showSoundtrackError();
    });

    els.soundtrackSeek.addEventListener("input", () => {
      if (!soundtrackAudio.src) return;
      const duration = Number(soundtrackAudio.duration);
      if (!Number.isFinite(duration) || duration <= 0) return;
      const nextTime = Math.min(Number(els.soundtrackSeek.value), duration);
      try {
        soundtrackAudio.currentTime = nextTime;
      } catch {
        return;
      }
      els.soundtrackCurrent.textContent = formatTime(nextTime);
      els.soundtrackSeek.style.setProperty("--progress", `${(nextTime / duration) * 100}%`);
    });
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const whole = Math.floor(seconds);
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
  }

  function resetSoundtrackProgress(total = 30) {
    els.soundtrackSeek.max = String(total);
    els.soundtrackSeek.value = "0";
    els.soundtrackSeek.style.setProperty("--progress", "0%");
    els.soundtrackCurrent.textContent = "0:00";
    els.soundtrackTotal.textContent = formatTime(total);
  }

  function updateSoundtrackUI() {
    if (!soundtrackAudio) return;
    const track = SOUNDTRACK_TRACKS[soundtrackIndex];
    const playing = !soundtrackAudio.paused && !soundtrackAudio.ended;

    els.soundtrackNowTitle.textContent = track.title;
    els.soundtrackPlayer.classList.toggle("is-playing", playing);
    els.soundtrackToggle.classList.toggle("is-playing", playing);
    els.soundtrackToggle.setAttribute("aria-label", playing ? "暂停试听" : "播放试听");
    els.soundtrackToggle.setAttribute("aria-pressed", String(playing));

    for (const row of $$(".track-row", els.soundtrackTracklist)) {
      const index = Number(row.dataset.trackRow);
      const active = index === soundtrackIndex;
      const rowPlaying = active && playing;
      row.classList.toggle("is-active", active);
      row.classList.toggle("is-playing", rowPlaying);
      const button = $(".track-main", row);
      if (button) {
        button.setAttribute("aria-label", `${rowPlaying ? "暂停试听" : "试听"}：${SOUNDTRACK_TRACKS[index].title}`);
      }
    }

    if (els.soundtrackStatus) {
      els.soundtrackStatus.textContent = `${track.title}，${playing ? "正在播放" : "已暂停"}。官方 30 秒试听。`;
    }
  }

  function showSoundtrackError() {
    const now = Date.now();
    if (now - soundtrackErrorAt < 2500) return;
    soundtrackErrorAt = now;
    toast("试听加载失败，请检查网络，或前往 Apple Music / Bandcamp");
  }

  function loadCurrentSoundtrackTrack() {
    if (!soundtrackAudio) return;
    if (soundtrackAudio.src && soundtrackAudio.dataset.trackIndex === String(soundtrackIndex)) return;
    soundtrackAudio.src = SOUNDTRACK_TRACKS[soundtrackIndex].previewUrl;
    soundtrackAudio.dataset.trackIndex = String(soundtrackIndex);
    resetSoundtrackProgress(30);
    els.soundtrackSeek.disabled = true;
    soundtrackAudio.load();
  }

  function playSoundtrack() {
    if (!soundtrackAudio) return;
    loadCurrentSoundtrackTrack();
    if (soundtrackAudio.ended) soundtrackAudio.currentTime = 0;
    const promise = soundtrackAudio.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch((error) => {
        if (error && error.name === "AbortError") return;
        updateSoundtrackUI();
        showSoundtrackError();
      });
    }
  }

  function toggleSoundtrack() {
    if (!soundtrackAudio) return;
    if (soundtrackAudio.paused || soundtrackAudio.ended) playSoundtrack();
    else soundtrackAudio.pause();
  }

  function selectSoundtrackTrack(index, options = {}) {
    if (!Number.isInteger(index) || index < 0 || index >= SOUNDTRACK_TRACKS.length) return;
    const { play = false } = options;
    if (index === soundtrackIndex) {
      updateSoundtrackUI();
      if (play) playSoundtrack();
      return;
    }

    const wasPlaying = !soundtrackAudio.paused && !soundtrackAudio.ended;
    if (!soundtrackAudio.paused) soundtrackAudio.pause();
    soundtrackIndex = index;
    soundtrackAudio.dataset.trackIndex = "";
    resetSoundtrackProgress(30);
    els.soundtrackSeek.disabled = true;
    updateSoundtrackUI();

    if (play || wasPlaying) playSoundtrack();
  }

  function handleSoundtrackTrack(index) {
    if (index === soundtrackIndex && soundtrackAudio && soundtrackAudio.src) {
      if (soundtrackAudio.paused || soundtrackAudio.ended) playSoundtrack();
      else soundtrackAudio.pause();
      return;
    }
    selectSoundtrackTrack(index, { play: true });
  }

  function stepSoundtrack(delta) {
    const length = SOUNDTRACK_TRACKS.length;
    const wasPlaying = soundtrackAudio && !soundtrackAudio.paused && !soundtrackAudio.ended;
    const next = (soundtrackIndex + delta + length) % length;
    selectSoundtrackTrack(next, { play: Boolean(wasPlaying) });
  }

  function handleSoundtrackEnded() {
    updateSoundtrackUI();
    if (soundtrackIndex < SOUNDTRACK_TRACKS.length - 1) {
      selectSoundtrackTrack(soundtrackIndex + 1, { play: true });
    }
  }

  function updateSoundtrackProgress() {
    if (!soundtrackAudio) return;
    const duration = Number(soundtrackAudio.duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const current = Math.min(soundtrackAudio.currentTime || 0, duration);
    els.soundtrackSeek.value = String(current);
    els.soundtrackCurrent.textContent = formatTime(current);
    els.soundtrackTotal.textContent = formatTime(duration);
    els.soundtrackSeek.style.setProperty("--progress", `${(current / duration) * 100}%`);
  }

  /* ==========================================================================
     Backup and reset
     ========================================================================== */

  function exportBackup() {
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `earthborne-field-journal-${todayStamp()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("备份已导出");
  }

  async function importBackup(file) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Not a journal object");
      }
      if (!parsed.character && !parsed.campaigns && !parsed.achievements) {
        throw new Error("Not an Earthborne journal");
      }

      state = normalizeState(parsed);
      activeCampaign = state.ui.activeCampaign;
      activeFilter = "all";
      renderAll();
      saveNow();
      toast("备份已导入");
    } catch (error) {
      console.warn("Could not import backup.", error);
      toast("无法读取这个备份文件");
    }
  }

  function openResetDialog() {
    if (!els.resetDialog) return;
    els.resetDialog.returnValue = "";
    if (typeof els.resetDialog.showModal === "function") {
      els.resetDialog.showModal();
      return;
    }
    if (window.confirm("清空所有记录？这个操作无法撤销。")) {
      resetAll();
    }
  }

  function resetAll() {
    state = createDefaultState();
    activeCampaign = state.ui.activeCampaign;
    activeFilter = "all";
    renderAll();
    saveNow();
    toast("所有记录已清空");
  }

  /* ==========================================================================
     Interactions
     ========================================================================== */

  function bindEvents() {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("input", handleInput);
    document.addEventListener("change", handleChange);
    document.addEventListener("focusout", handleFocusOut);
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("contextmenu", handleContextMenu);

    els.menuToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMenu();
    });

    els.tabList.addEventListener("keydown", handleTabKeys);
    els.menu.addEventListener("keydown", handleMenuKeys);

    els.importInput.addEventListener("change", () => {
      const file = els.importInput.files && els.importInput.files[0];
      els.importInput.value = "";
      if (file) importBackup(file);
    });

    els.resetDialog.addEventListener("close", () => {
      if (els.resetDialog.returnValue === "confirm") resetAll();
    });

    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      if (TABS.includes(hash) && hash !== activeTab) {
        setTab(hash, { updateHash: false });
      }
    });

    window.addEventListener("beforeprint", prepareForPrint);
    window.addEventListener("afterprint", restoreAfterPrint);
    window.addEventListener("pagehide", () => {
      if (saveTimer) saveNow();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && saveTimer) saveNow();
    });

    // Always save any pending keystrokes when leaving the page.
    window.addEventListener("beforeunload", () => {
      if (saveTimer) saveNow();
    });
  }

  function handleDocumentClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (menuOpen && !target.closest(".menu-wrap")) {
      closeMenu();
    }

    const tab = target.closest("[data-tab]");
    if (tab) {
      setTab(tab.dataset.tab);
      return;
    }

    const campaignButton = target.closest(".campaign-switch__button[data-campaign]");
    if (campaignButton) {
      switchCampaign(campaignButton.dataset.campaign);
      return;
    }

    const filterButton = target.closest(".filter-button[data-filter]");
    if (filterButton) {
      setFilter(filterButton.dataset.filter);
      return;
    }

    const achievementCard = target.closest(".achievement-card[data-achievement]");
    if (achievementCard) {
      toggleAchievement(achievementCard);
      return;
    }

    const aspectButton = target.closest('[data-action="aspect-inc"]');
    if (aspectButton) {
      adjustAspect(aspectButton.dataset.aspect, event.shiftKey ? -1 : 1);
      return;
    }

    const actionTarget = target.closest("[data-action]");
    if (actionTarget) {
      handleAction(actionTarget.dataset.action, actionTarget);
    }
  }

  function handleAction(action, element) {
    switch (action) {
      case "toggle-day":
        toggleDay(Number(element.dataset.day));
        break;
      case "complete-next":
        completeNextDay();
        break;
      case "mission-progress":
        updateMissionProgress(element);
        break;
      case "mission-done":
        toggleMissionDone(element);
        break;
      case "soundtrack-toggle":
        toggleSoundtrack();
        break;
      case "soundtrack-prev":
        stepSoundtrack(-1);
        break;
      case "soundtrack-next":
        stepSoundtrack(1);
        break;
      case "soundtrack-track":
        handleSoundtrackTrack(Number(element.dataset.trackIndex));
        break;
      case "print":
        closeMenu({ restoreFocus: true });
        window.print();
        break;
      case "export":
        closeMenu({ restoreFocus: true });
        exportBackup();
        break;
      case "import":
        closeMenu({ restoreFocus: true });
        els.importInput.click();
        break;
      case "reset":
        closeMenu({ restoreFocus: true });
        openResetDialog();
        break;
      default:
        break;
    }
  }

  function handleInput(event) {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;

    if (field.dataset.sanitize === "mission-day") {
      const digits = field.value.replace(/\D/g, "").slice(0, 2);
      if (field.value !== digits) field.value = digits;
    }

    const bindPath = field.dataset.bind;
    if (bindPath) {
      setByPath(state, bindPath, field.value);

      if (bindPath.startsWith("character.decklist.")) {
        updateDecklistCount();
      }

      if (/^campaigns\.[a-z]+\.(missions|extraMissions)\.\d+\.(name|day)$/.test(bindPath)) {
        updateMissionStats();
      }

      scheduleSave();
      return;
    }

    const campaignField = field.dataset.campaignBind;
    if (campaignField === "location" || campaignField === "terrain") {
      state.campaigns[activeCampaign][campaignField] = field.value;
      scheduleSave();
    }
  }

  function handleChange(event) {
    const field = event.target;
    if (!(field instanceof HTMLInputElement)) return;
    if (field.dataset.sanitize !== "mission-day") return;
    if (field.value === "") return;

    const clamped = String(clampInt(field.value, 1, 30, 1));
    if (field.value !== clamped) {
      field.value = clamped;
      const bindPath = field.dataset.bind;
      if (bindPath) {
        setByPath(state, bindPath, clamped);
        updateMissionStats();
        scheduleSave();
      }
    }
  }

  function handleFocusOut(event) {
    const field = event.target;
    if (!(field instanceof HTMLInputElement)) return;
    if (field.dataset.sanitize !== "mission-day") return;
    if (field.value === "") return;

    const clamped = String(clampInt(field.value, 1, 30, 1));
    if (field.value !== clamped) {
      field.value = clamped;
      const bindPath = field.dataset.bind;
      if (bindPath) {
        setByPath(state, bindPath, clamped);
        updateMissionStats();
        scheduleSave();
      }
    }
  }

  function handleKeydown(event) {
    if (event.key === "Escape" && menuOpen) {
      closeMenu({ restoreFocus: true });
      return;
    }

    const aspectButton = event.target.closest && event.target.closest(".aspect-diamond");
    if (aspectButton) {
      const key = aspectButton.dataset.aspect;
      if (["ArrowUp", "ArrowRight", "+", "="].includes(event.key)) {
        event.preventDefault();
        adjustAspect(key, 1);
        return;
      }
      if (["ArrowDown", "ArrowLeft", "-", "_"].includes(event.key)) {
        event.preventDefault();
        adjustAspect(key, -1);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        state.character.aspects[key] = 1;
        refreshAspect(key);
        scheduleSave();
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        state.character.aspects[key] = 3;
        refreshAspect(key);
        scheduleSave();
        return;
      }
    }

    if (event.key !== "Enter") return;
    const field = event.target.closest && event.target.closest("input[data-enter-next]");
    if (!field) return;

    const group = field.closest("[data-enter-group]");
    if (!group) return;
    const fields = $$("input[data-enter-next]", group);
    const index = fields.indexOf(field);
    if (index === -1) return;

    event.preventDefault();
    const next = fields[index + 1];
    if (next) {
      next.focus();
      if (typeof next.select === "function") next.select();
    }
  }

  function handleTabKeys(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    const currentIndex = els.tabs.indexOf(document.activeElement);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + els.tabs.length) % els.tabs.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % els.tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = els.tabs.length - 1;

    const nextTab = els.tabs[nextIndex];
    nextTab.focus();
    setTab(nextTab.dataset.tab);
  }

  function handleMenuKeys(event) {
    if (!menuOpen) return;
    const items = $$("button", els.menu);
    if (!items.length) return;
    const currentIndex = items.indexOf(document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(currentIndex + 1 + items.length) % items.length].focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length].focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0].focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1].focus();
    } else if (event.key === "Tab") {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }
  }

  function handleContextMenu(event) {
    const button = event.target.closest && event.target.closest(".aspect-diamond");
    if (!button) return;
    event.preventDefault();
    adjustAspect(button.dataset.aspect, -1);
  }

  /* ==========================================================================
     Print helpers
     ========================================================================== */

  function prepareForPrint() {
    for (const field of $$(".lined-textarea")) {
      field.dataset.prePrintHeight = field.style.height || "";
      const height = Math.max(field.scrollHeight, field.clientHeight);
      field.style.height = `${height}px`;
      field.style.minHeight = `${height}px`;
    }
  }

  function restoreAfterPrint() {
    for (const field of $$(".lined-textarea")) {
      field.style.height = field.dataset.prePrintHeight || "";
      field.style.minHeight = "";
      delete field.dataset.prePrintHeight;
    }
  }

  /* ==========================================================================
     Go
     ========================================================================== */

  init();
})();
