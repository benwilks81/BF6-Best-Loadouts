/* global BF6, BF6_DATA */
(function () {
  const FAV_KEY = 'bf6-best-loadouts-favorites-v1';
  const LEVEL_KEY = 'bf6-best-loadouts-levels-v1';
  const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
  const LABEL_KEYS = ['optic', 'barrel', 'muzzle', 'grip', 'laser', 'light', 'mag', 'ammo', 'ergo'];
  const MAX_FAVORITES = 40;
  const DEFAULT_PLAYER_LEVEL = 50;
  const DEFAULT_MASTERY_LEVEL = 50;
  // Soft sanity bound only — game ranks are not capped at the attachment unlock track (50).
  const LEVEL_INPUT_MAX = 9999;
  // Upstream data often stores ammo *category* names; show the in-game attachment names.
  const AMMO_DISPLAY_NAMES = {
    long_range: 'Match Grade',
    penetration: 'Tungsten Core',
    lightweight: 'Polymer Case',
    synthetic: 'Synthetic Tip',
    standard: 'FMJ',
    hollow_pt: 'Hollow Point',
    frangible: 'Frangible',
    subsonic: 'Subsonic',
    subsonic_hp: 'Sub HP',
    subsonic_pen: 'Sub Pen',
    range_pen: 'Range Pen',
  };
  // Curated latest weapon-facing patch overview (prototype). Keep only the newest notes.
  const LATEST_CHANGELOG = {
    id: '1.3.3.0',
    title: 'Update 1.3.3.0',
    dateLabel: '30 Jun 2026',
    url: 'https://www.ea.com/games/battlefield/battlefield-6/news/battlefield-6-game-update-1-3-3-0',
    bullets: [
      {
        text: 'Muzzle velocity down ~5% on most primaries; more lead needed at range.',
        weapons: null,
      },
      {
        text: 'Bullet drag up ~40% (Match Grade +100%); long shots drop faster.',
        weapons: null,
      },
      {
        text: 'Auto headshot mults raised to 1.4 / 1.57 / 1.8 by ammo type.',
        weapons: null,
      },
      {
        text: 'Stomach/limb damage reduced on autos; upper-body shots matter more.',
        weapons: null,
      },
      {
        text: 'Dispersion growth up ~14% on average; burst/tap fire rewarded farther out.',
        weapons: null,
      },
      {
        text: 'Recoil variation reduced for more predictable sustained fire.',
        weapons: null,
      },
      {
        text: 'Bolt-action sweet spots narrowed (M2010 ESR, SV-98, PSR, L115).',
        weapons: ['m2010esr', 'sv98', 'psr', 'l115', 'miniscout'],
      },
    ],
  };
  const IMG_BASE = 'https://media.battlefield6.gg/cdn-cgi/image/format=auto,quality=80,width=720/media/';
  const META_IMG = 'https://img.battlefieldmeta.gg';
  const IMG_CACHE_KEY = 'bf6-best-loadouts-img-cache-v4';
  // Weapon art: battlefield6.gg media filenames, or full https URLs from battlefieldmeta.gg.
  const IMAGE_FILES = {
    m433: 'AssaultRifle-M433.png',
    b36a4: 'AssaultRifle-B36A4.png',
    sor556: 'AssaultRifle-SOR-556-Mk2.png',
    ak4d: 'AssaultRifle-AK4D.png',
    tr7: 'AssaultRifle-TR7.png',
    kord6p67: 'AssaultRifle-KORD-6P67.png',
    nvo228e: 'AssaultRifle-NVO-228E.png',
    l85a3: 'AssaultRifle-L85A3.png',
    ef88: `${META_IMG}/ef88/gunFullDisplay`,
    vcr2: `${META_IMG}/vcr-2/gunFullDisplay`,
    m16a4: `${META_IMG}/m16a4/gunFullDisplay`,
    m4a1: 'Carbine-M4A1.png',
    m277: 'Carbine-M277.png',
    ak205: 'Carbine-AK-205.png',
    m417a2: 'Carbine-M417-A2.png',
    grtbc: 'Carbine-GRT-BC.png',
    qbz192: 'Carbine-QBZ-192.png',
    sg553r: 'Carbine-SG-553R.png',
    sor300sc: 'Carbine-SOR-300SC.png',
    brod3: `${META_IMG}/brod-3/gunFullDisplay`,
    sgx: 'SMG-SGX.png',
    pw5a3: 'SMG-PW5A3.png',
    pw7a2: 'SMG-PW7A2.png',
    umg40: 'SMG-UMG-40.png',
    usg90: 'SMG-USG-90.png',
    kv9: 'SMG-KV9.png',
    scw10: 'SMG-SCW-10.png',
    sl9: 'SMG-SL9.png',
    cz3a1: `${META_IMG}/cz3a1/gunFullDisplay`,
    pp19: `${META_IMG}/pp-19/gunFullDisplay`,
    l110: 'LMG-L110.png',
    drsiar: 'LMG-DRS-IAR.png',
    m60: 'LMG-M60.png',
    rpkm: 'LMG-RPKM.png',
    m123k: 'LMG-M123K.png',
    m250: 'LMG-M250.png',
    kts100: 'LMG-KTS100-MK8.png',
    m240l: 'LMG-M240L.png',
    m121a2: `${META_IMG}/m121-a2/gunFullDisplay`,
    rpk74m: `${META_IMG}/rpk-74m/gunFullDisplay`,
    m39emr: 'DMR-M39-EMR.png',
    lmr27: 'DMR-LMR27.png',
    svk86: 'DMR-SVK-86.png',
    svdm: 'DMR-SVDM.png',
    grtcps: `${META_IMG}/grt-cps/gunFullDisplay`,
    vssm: `${META_IMG}/vssm/gunFullDisplay`,
    m2010esr: 'Sniper%20Rifle-M2010-ESR.png',
    sv98: 'Sniper%20Rifle-SV-98.png',
    psr: 'Sniper%20Rifle-PSR.png',
    miniscout: 'SniperRifle-Mini-Scout.png',
    l115: `${META_IMG}/l115/gunFullDisplay`,
    m87a1: 'Shotgun-M87A1.png',
    m1014: 'Shotgun-M1014.png',
    ks18k: 'Shotgun-185KS-K.png',
    db12: `${META_IMG}/db-12/gunFullDisplay`,
  };

  const imageUrlCache = loadImageCache();

  const state = {
    weapons: [],
    attachments: null,
    tables: null,
    unlocks: null,
    weaponId: null,
    filter: '',
    playerLevel: DEFAULT_PLAYER_LEVEL,
    masteryLevel: DEFAULT_MASTERY_LEVEL,
    includeChallenges: false,
    spreadAim: 'ads',
    lastResult: null,
    resultCache: new Map(),
    activeOptimizeRequest: null,
    favorites: [],
    expandedFavs: new Set(),
  };

  const els = {
    weapon: document.getElementById('weapon'),
    weaponList: document.getElementById('weaponList'),
    weaponFilter: document.getElementById('weaponFilter'),
    playerLevel: document.getElementById('playerLevel'),
    masteryLevel: document.getElementById('masteryLevel'),
    includeChallenges: document.getElementById('includeChallenges'),
    favToggle: document.getElementById('favToggle'),
    favorites: document.getElementById('favorites'),
    favList: document.getElementById('favList'),
    status: document.getElementById('status'),
    weaponMeta: document.getElementById('weaponMeta'),
    weaponUnlockNote: document.getElementById('weaponUnlockNote'),
    changelogPatch: document.getElementById('changelogPatch'),
    changelogList: document.getElementById('changelogList'),
    changelogLink: document.getElementById('changelogLink'),
    weaponTitle: document.getElementById('weaponTitle'),
    weaponImage: document.getElementById('weaponImage'),
    weaponImageFallback: document.getElementById('weaponImageFallback'),
    weaponFallbackClass: document.getElementById('weaponFallbackClass'),
    weaponFallbackName: document.getElementById('weaponFallbackName'),
    weaponFallbackNote: document.getElementById('weaponFallbackNote'),
    results: document.getElementById('results'),
    detail: document.getElementById('detail'),
    dataAge: document.getElementById('dataAge'),
    spreadViz: document.getElementById('spreadViz'),
    spreadCanvas: document.getElementById('spreadCanvas'),
    spreadVizCaption: document.getElementById('spreadVizCaption'),
  };

  try {
    init();
  } catch (err) {
    els.status.textContent = `Failed to load data: ${err.message}`;
    console.error(err);
  }

  function init() {
    if (!window.BF6_DATA) {
      throw new Error('Missing embedded data. Run the weekly refresh script.');
    }

    const { weapons, attachments, balance, ammo, unlocks } = BF6_DATA;

    state.weapons = weapons
      .filter((w) => w && typeof w === 'object' && SAFE_ID.test(w.id) && w.cls !== 'Sidearm')
      .map((w) => ({
        ...w,
        id: String(w.id),
        name: String(w.name ?? w.id).slice(0, 80),
        cls: String(w.cls ?? 'Unknown').slice(0, 40),
        cal: w.cal == null ? '' : String(w.cal).slice(0, 32),
      }));
    state.attachments = attachments;
    state.unlocks = unlocks && typeof unlocks === 'object' ? unlocks : null;
    const ammoTypes = withAmmoDisplayNames(ammo?.AMMO ?? []);
    state.tables = {
      ...balance,
      MUZZLES: attachments.MUZZLES,
      BARRELS: attachments.BARRELS,
      GRIPS: attachments.GRIPS,
      LASERS: attachments.LASERS,
      LIGHTS: attachments.LIGHTS,
      SIGHTS: attachments.SIGHTS,
      ERGOS: attachments.ERGOS,
      WEAPON_MAG: attachments.WEAPON_MAG,
      WEAPON_ERGO: attachments.WEAPON_ERGO,
      WEAPON_ATTS: attachments.WEAPON_ATTS,
      AMMO: ammo,
      AMMO_TYPES: ammoTypes,
      WEAPON_AMMO: ammo?.WEAPON_AMMO ?? {},
      unlocks: state.unlocks,
    };

    const savedLevels = loadLevels();
    state.playerLevel = savedLevels.playerLevel;
    state.masteryLevel = savedLevels.masteryLevel;
    state.includeChallenges = savedLevels.includeChallenges;
    syncLevelInputs();

    state.favorites = loadFavorites();
    fillWeapons();
    renderWeaponList();
    renderFavorites();
    renderChangelog();
    renderDataAge(BF6_DATA.refreshedAt);
    bind();
    run();
  }

  function withAmmoDisplayNames(list) {
    return (list ?? []).map((entry) => {
      if (!entry || typeof entry !== 'object') return entry;
      const label = AMMO_DISPLAY_NAMES[entry.id];
      if (!label) return entry;
      return { ...entry, name: label };
    });
  }

  function renderChangelog() {
    const log = LATEST_CHANGELOG;
    if (!els.changelogList) return;

    if (els.changelogPatch) {
      els.changelogPatch.textContent = `${log.title} · ${log.dateLabel}`;
    }
    if (els.changelogLink) {
      els.changelogLink.href = log.url;
    }

    const bullets = Array.isArray(log.bullets) ? log.bullets : [];
    els.changelogList.innerHTML = bullets
      .map((bullet) => {
        const text = String(bullet?.text ?? '').slice(0, 180);
        if (!text) return '';
        return `<li>${escapeHtml(text)}</li>`;
      })
      .join('');
  }

  function attachmentUnlockCap() {
    return state.unlocks?.attachmentUnlockCap ?? 50;
  }

  function clampLevel(value, min, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(LEVEL_INPUT_MAX, Math.floor(n)));
  }

  function loadLevels() {
    try {
      const raw = localStorage.getItem(LEVEL_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        playerLevel: clampLevel(parsed.playerLevel, 1, DEFAULT_PLAYER_LEVEL),
        masteryLevel: clampLevel(parsed.masteryLevel, 0, DEFAULT_MASTERY_LEVEL),
        includeChallenges: Boolean(parsed.includeChallenges),
      };
    } catch {
      return {
        playerLevel: DEFAULT_PLAYER_LEVEL,
        masteryLevel: DEFAULT_MASTERY_LEVEL,
        includeChallenges: false,
      };
    }
  }

  function saveLevels() {
    try {
      localStorage.setItem(
        LEVEL_KEY,
        JSON.stringify({
          playerLevel: state.playerLevel,
          masteryLevel: state.masteryLevel,
          includeChallenges: state.includeChallenges,
        })
      );
    } catch {
      /* ignore quota / private mode */
    }
  }

  function syncLevelInputs() {
    if (els.playerLevel) {
      els.playerLevel.removeAttribute('max');
      els.playerLevel.value = String(state.playerLevel);
    }
    if (els.masteryLevel) {
      els.masteryLevel.removeAttribute('max');
      els.masteryLevel.value = String(state.masteryLevel);
    }
    if (els.includeChallenges) {
      els.includeChallenges.checked = state.includeChallenges;
    }
  }

  function applyLevelInputs({ rerun = true } = {}) {
    const nextPlayer = clampLevel(els.playerLevel?.value, 1, state.playerLevel);
    const nextMastery = clampLevel(els.masteryLevel?.value, 0, state.masteryLevel);
    const nextChallenges = Boolean(els.includeChallenges?.checked);
    const changed =
      nextPlayer !== state.playerLevel ||
      nextMastery !== state.masteryLevel ||
      nextChallenges !== state.includeChallenges;

    state.playerLevel = nextPlayer;
    state.masteryLevel = nextMastery;
    state.includeChallenges = nextChallenges;
    syncLevelInputs();
    saveLevels();
    renderWeaponList();

    if (!changed || !rerun) return;
    state.resultCache.clear();
    run();
  }

  function weaponUnlockLevel(weaponId) {
    const level = state.unlocks?.weapons?.[weaponId]?.unlockAtPlayerLevel;
    return Number.isFinite(Number(level)) ? Number(level) : null;
  }

  function isWeaponUnlocked(weaponId) {
    const need = weaponUnlockLevel(weaponId);
    if (need == null) return true;
    return state.playerLevel >= need;
  }

  function cacheKey(weaponId) {
    return `${weaponId}@m${state.masteryLevel}@c${state.includeChallenges ? 1 : 0}`;
  }

  function renderDataAge(iso) {
    if (!els.dataAge) return;
    if (!iso) {
      els.dataAge.textContent = 'data age unknown — run weekly refresh';
      return;
    }
    const when = new Date(iso);
    if (Number.isNaN(when.getTime())) {
      els.dataAge.textContent = `refreshed ${iso}`;
      return;
    }
    const days = Math.max(0, Math.floor((Date.now() - when.getTime()) / 86400000));
    const stamp = when.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const age = days === 0 ? 'today' : days === 1 ? '1 day ago' : `${days} days ago`;
    els.dataAge.textContent = `data refreshed ${stamp} (${age})`;
    if (days >= 10) els.dataAge.classList.add('is-stale');
  }

  function fillWeapons() {
    const byClass = new Map();
    for (const w of state.weapons) {
      if (!byClass.has(w.cls)) byClass.set(w.cls, []);
      byClass.get(w.cls).push(w);
    }

    const classes = [...byClass.keys()].sort();
    els.weapon.innerHTML = classes
      .map((cls) => {
        const opts = byClass
          .get(cls)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((w) => `<option value="${escapeHtml(w.id)}">${escapeHtml(w.name)}</option>`)
          .join('');
        return `<optgroup label="${escapeHtml(cls)}">${opts}</optgroup>`;
      })
      .join('');

    if (state.weaponId && state.weapons.some((w) => w.id === state.weaponId)) {
      els.weapon.value = state.weaponId;
    }
    state.weaponId = els.weapon.value;
  }

  function renderWeaponList() {
    const q = state.filter.trim().toLowerCase();
    const byClass = new Map();
    for (const w of state.weapons) {
      if (q && !`${w.name} ${w.cls} ${w.id}`.toLowerCase().includes(q)) continue;
      if (!byClass.has(w.cls)) byClass.set(w.cls, []);
      byClass.get(w.cls).push(w);
    }

    const classes = [...byClass.keys()].sort();
    if (!classes.length) {
      els.weaponList.innerHTML = `<p class="empty">No guns match that filter.</p>`;
      return;
    }

    els.weaponList.innerHTML = classes
      .map((cls) => {
        const guns = byClass
          .get(cls)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((w) => {
            const active = w.id === state.weaponId ? ' is-active' : '';
            const fav = isFavorite(w.id) ? ' is-fav' : '';
            const unlockAt = weaponUnlockLevel(w.id);
            const locked = unlockAt != null && !isWeaponUnlocked(w.id);
            const lockedClass = locked ? ' is-locked' : '';
            const unlockBadge =
              unlockAt == null
                ? ''
                : `<span class="weapon-item-unlock${locked ? ' is-locked' : ''}">${
                    locked ? 'Locked' : 'Unlock'
                  } · player lvl ${escapeHtml(String(unlockAt))}</span>`;
            return `
              <button
                type="button"
                class="weapon-item${active}${fav}${lockedClass}"
                role="option"
                aria-selected="${w.id === state.weaponId}"
                data-weapon-id="${escapeHtml(w.id)}"
              >
                <span class="weapon-item-top">
                  <span class="weapon-item-name">${escapeHtml(w.name)}</span>
                  <span class="weapon-item-cal">${escapeHtml(w.cal ?? '')}</span>
                </span>
                ${unlockBadge}
              </button>
            `;
          })
          .join('');
        return `
          <div class="weapon-group">
            <h3>${escapeHtml(cls)}</h3>
            <div class="weapon-group-list">${guns}</div>
          </div>
        `;
      })
      .join('');
  }

  function bind() {
    els.weaponFilter.addEventListener('input', () => {
      state.filter = els.weaponFilter.value;
      renderWeaponList();
    });

    els.weaponList.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-weapon-id]');
      if (!btn) return;
      selectWeapon(btn.dataset.weaponId);
    });

    for (const el of [els.playerLevel, els.masteryLevel]) {
      if (!el) continue;
      el.addEventListener('input', () => applyLevelInputs());
      el.addEventListener('change', () => applyLevelInputs());
    }
    if (els.includeChallenges) {
      els.includeChallenges.addEventListener('change', () => applyLevelInputs());
    }

    els.spreadViz?.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-spread-aim]');
      if (!btn) return;
      const aim = btn.dataset.spreadAim === 'hip' ? 'hip' : 'ads';
      if (state.spreadAim === aim) return;
      state.spreadAim = aim;
      els.spreadViz.querySelectorAll('[data-spread-aim]').forEach((el) => {
        const on = el.dataset.spreadAim === aim;
        el.classList.toggle('is-on', on);
        el.setAttribute('aria-pressed', String(on));
      });
      const weapon = state.weapons.find((w) => w.id === state.weaponId);
      if (weapon) renderSpreadViz(weapon);
    });

    if (els.spreadCanvas && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        const weapon = state.weapons.find((w) => w.id === state.weaponId);
        if (weapon) renderSpreadViz(weapon);
      });
      ro.observe(els.spreadCanvas);
    }

    els.favToggle.addEventListener('click', toggleFavorite);
    els.favList.addEventListener('click', (event) => {
      const removeBtn = event.target.closest('[data-remove-fav]');
      if (removeBtn) {
        removeFavorite(removeBtn.dataset.favWeapon);
        return;
      }

      const expandBtn = event.target.closest('[data-fav-expand]');
      if (expandBtn) {
        toggleFavExpand(expandBtn.dataset.favExpand);
        return;
      }

      const openBtn = event.target.closest('[data-fav-open]');
      if (!openBtn) return;
      selectWeapon(openBtn.dataset.favOpen);
    });
  }

  function selectWeapon(id) {
    if (!state.weapons.some((w) => w.id === id)) return;
    state.weaponId = id;
    els.weapon.value = id;
    renderWeaponList();
    run();
  }

  function toggleFavExpand(weaponId) {
    if (state.expandedFavs.has(weaponId)) state.expandedFavs.delete(weaponId);
    else state.expandedFavs.add(weaponId);
    renderFavorites();
  }

  function loadImageCache() {
    try {
      const raw = sessionStorage.getItem(IMG_CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function rememberImageUrl(weaponId, url) {
    imageUrlCache[weaponId] = url;
    try {
      sessionStorage.setItem(IMG_CACHE_KEY, JSON.stringify(imageUrlCache));
    } catch {
      /* ignore quota / private mode */
    }
  }

  function resolveImageUrl(file) {
    if (!file) return null;
    if (/^https?:\/\//i.test(file) || file.startsWith('data:')) return file;
    return IMG_BASE + file;
  }

  function weaponImageUrl(weapon) {
    const cached = imageUrlCache[weapon.id];
    if (cached) return cached;
    return resolveImageUrl(IMAGE_FILES[weapon.id]);
  }

  function showWeaponVisual(weapon) {
    els.weaponTitle.textContent = weapon.name;
    els.weaponFallbackClass.textContent = weapon.cls;
    els.weaponFallbackName.textContent = weapon.name;
    if (els.weaponFallbackNote) els.weaponFallbackNote.textContent = '';

    els.weaponImageFallback.hidden = false;
    els.weaponImage.hidden = true;
    els.detail.classList.remove('has-image');

    const url = weaponImageUrl(weapon);
    const img = els.weaponImage;
    img.alt = `${weapon.name} weapon art`;
    img.decoding = 'async';
    img.loading = 'eager';
    img.referrerPolicy = 'no-referrer';
    if ('fetchPriority' in img) img.fetchPriority = 'high';

    const finishMissing = () => {
      if (state.weaponId !== weapon.id) return;
      img.removeAttribute('src');
      img.hidden = true;
      els.weaponImageFallback.hidden = false;
      if (els.weaponFallbackNote) els.weaponFallbackNote.textContent = 'Weapon art unavailable';
      els.detail.classList.remove('has-image');
    };

    if (!url) {
      finishMissing();
      return;
    }

    img.onload = () => {
      if (state.weaponId !== weapon.id) return;
      rememberImageUrl(weapon.id, img.currentSrc || img.src);
      img.hidden = false;
      els.weaponImageFallback.hidden = true;
      els.detail.classList.add('has-image');
    };
    img.onerror = finishMissing;
    img.src = url;

    if (img.complete && img.naturalWidth > 0 && state.weaponId === weapon.id) {
      img.onload();
    }
  }

  function applyResult(weapon, result) {
    state.lastResult = result;
    els.detail.classList.remove('is-loading');

    if (result.error) {
      els.status.textContent = result.error;
      els.results.innerHTML = '';
      return;
    }

    els.status.textContent = '';
    renderResults(result);

    if (isFavorite(weapon.id)) {
      upsertFavorite(weapon, result);
      renderFavorites();
    }
  }

  function formatDamageStat(weapon) {
    const points = Array.isArray(weapon.dmg) ? weapon.dmg : null;
    if (!points?.length) return null;
    const values = points.map((p) => Number(p.d)).filter((n) => Number.isFinite(n));
    if (!values.length) return null;

    const fmt = (n) => {
      const rounded = Math.round(n * 10) / 10;
      return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    };

    const start = values[0];
    const min = Math.min(...values);
    const max = Math.max(...values);
    let text =
      max - min > 0.05
        ? `${fmt(start)} close → ${fmt(min)} far`
        : `${fmt(start)} body`;
    if (Number(weapon.pellets) > 1) text += ` × ${Math.round(weapon.pellets)} pellets`;
    return text;
  }

  function weaponStatRows(weapon) {
    const rows = [
      ['Class', weapon.cls],
      ['Caliber', weapon.cal || null],
      ['Body dmg', formatDamageStat(weapon)],
      ['RPM', Number.isFinite(Number(weapon.rpm)) ? String(Math.round(weapon.rpm)) : null],
      ['Magazine', weapon.mag == null ? null : String(weapon.mag)],
      [
        'Velocity',
        Number.isFinite(Number(weapon.bulletVel)) ? `${Math.round(weapon.bulletVel)} m/s` : null,
      ],
      [
        'ADS',
        Number.isFinite(Number(weapon.adsTime)) ? `${Math.round(weapon.adsTime)} ms` : null,
      ],
      ['Fire mode', weapon.fireMode ? String(weapon.fireMode) : null],
      ['Gun level', `${state.masteryLevel}`],
    ];

    if (state.masteryLevel >= attachmentUnlockCap()) {
      rows.push(['Track', `complete (${attachmentUnlockCap()})`]);
    }
    if (state.includeChallenges) rows.push(['Extras', 'challenge parts on']);

    return rows.filter(([, value]) => value != null && String(value).trim() !== '');
  }

  function renderWeaponStats(weapon) {
    if (!els.weaponMeta) return;
    els.weaponMeta.innerHTML = weaponStatRows(weapon)
      .map(
        ([label, value]) => `
          <li>
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(String(value))}</strong>
          </li>
        `
      )
      .join('');
  }

  function renderWeaponUnlockNote(weapon) {
    const note = els.weaponUnlockNote;
    if (!note) return;

    const unlockAt = weaponUnlockLevel(weapon.id);
    if (unlockAt == null) {
      note.hidden = true;
      note.textContent = '';
      note.classList.remove('is-locked');
      return;
    }

    const locked = !isWeaponUnlocked(weapon.id);
    note.hidden = false;
    note.classList.toggle('is-locked', locked);
    note.textContent = locked
      ? `Weapon locked — needs player level ${unlockAt} (you are ${state.playerLevel})`
      : `Weapon unlocks at player level ${unlockAt}`;
  }

  function metersToDeg(meters, rangeMeters) {
    return (Math.atan(meters / Math.max(rangeMeters, 1)) * 180) / Math.PI;
  }

  function mixHex(a, b, t) {
    const parse = (hex) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
    const [ar, ag, ab] = parse(a);
    const [br, bg, bb] = parse(b);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  function drawSoldierSilhouette(ctx, toX, toY, rangeMeters) {
    const w = metersToDeg(0.42, rangeMeters);
    const headR = metersToDeg(0.12, rangeMeters);
    const headY = metersToDeg(0.58, rangeMeters);
    const shoulderY = metersToDeg(0.38, rangeMeters);
    const hipY = metersToDeg(-0.18, rangeMeters);
    const footY = metersToDeg(-0.95, rangeMeters);
    const legGap = metersToDeg(0.06, rangeMeters);

    ctx.save();
    ctx.fillStyle = 'rgba(180, 196, 214, 0.16)';
    ctx.strokeStyle = 'rgba(180, 196, 214, 0.38)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(toX(0), toY(headY), Math.abs(toX(headR) - toX(0)), Math.abs(toY(headY) - toY(headY - headR)), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    const left = toX(-w / 2);
    const right = toX(w / 2);
    const top = toY(shoulderY);
    const mid = toY(hipY);
    ctx.moveTo(left, top);
    ctx.lineTo(right, top);
    ctx.lineTo(toX(w * 0.36), mid);
    ctx.lineTo(toX(-w * 0.36), mid);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX(-w * 0.32), mid);
    ctx.lineTo(toX(-legGap), footY);
    ctx.lineTo(toX(-w * 0.08), footY);
    ctx.lineTo(toX(-w * 0.04), mid);
    ctx.moveTo(toX(w * 0.32), mid);
    ctx.lineTo(toX(legGap), footY);
    ctx.lineTo(toX(w * 0.08), footY);
    ctx.lineTo(toX(w * 0.04), mid);
    ctx.stroke();
    ctx.restore();
  }

  function renderSpreadViz(weapon) {
    const canvas = els.spreadCanvas;
    if (!canvas || typeof BF6.simulateShotPattern !== 'function') return;

    const pattern = BF6.simulateShotPattern(weapon, {
      aim: state.spreadAim,
      rangeMeters: 25,
    });
    const { impacts, recoilPath, shotCount, pellets, rangeMeters, fireMode } = pattern;
    const aimLabel = state.spreadAim === 'hip' ? 'Hipfire' : 'ADS';
    const roundWord = pellets > 1 ? `shells × ${pellets} pellets` : fireMode === 'bolt' ? 'bolts' : 'rounds';
    if (els.spreadVizCaption) {
      els.spreadVizCaption.textContent = `${aimLabel} standing · ${shotCount} ${roundWord} on a soldier at ${rangeMeters} m`;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = Math.max(canvas.clientWidth || 720, 280);
    const cssH = Math.max(Math.round(cssW * 0.48), 220);
    const drawKey = `${weapon.id}|${state.spreadAim}|${Math.round(cssW)}`;
    if (canvas.dataset.drawKey === drawKey) return;
    canvas.dataset.drawKey = drawKey;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const xs = impacts.map((p) => p.x);
    const ys = impacts.map((p) => p.y);
    const silW = metersToDeg(0.5, rangeMeters);
    const silTop = metersToDeg(0.75, rangeMeters);
    const silBot = metersToDeg(-1.05, rangeMeters);
    let minX = Math.min(-silW, ...(xs.length ? xs : [0]));
    let maxX = Math.max(silW, ...(xs.length ? xs : [0]));
    let minY = Math.min(silBot, ...(ys.length ? ys : [0]));
    let maxY = Math.max(silTop, ...(ys.length ? ys : [0]));
    const padX = Math.max((maxX - minX) * 0.18, 0.55);
    const padY = Math.max((maxY - minY) * 0.16, 0.45);
    minX -= padX;
    maxX += padX;
    minY -= padY;
    maxY += padY;
    const spanX = Math.max(maxX - minX, 1.2);
    const spanY = Math.max(maxY - minY, 1.2);
    const margin = { l: 36, r: 16, t: 14, b: 28 };
    const plotW = cssW - margin.l - margin.r;
    const plotH = cssH - margin.t - margin.b;
    const scale = Math.min(plotW / spanX, plotH / spanY);
    const originX = margin.l + plotW / 2 - ((minX + maxX) / 2) * scale;
    const originY = margin.t + plotH / 2 + ((minY + maxY) / 2) * scale;
    const toX = (deg) => originX + deg * scale;
    const toY = (deg) => originY - deg * scale;

    ctx.fillStyle = '#07090c';
    ctx.fillRect(0, 0, cssW, cssH);

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    const step = spanX > 8 ? 2 : 1;
    for (let g = Math.ceil(minX); g <= maxX; g += step) {
      ctx.beginPath();
      ctx.moveTo(toX(g), margin.t);
      ctx.lineTo(toX(g), cssH - margin.b);
      ctx.stroke();
    }
    for (let g = Math.ceil(minY); g <= maxY; g += step) {
      ctx.beginPath();
      ctx.moveTo(margin.l, toY(g));
      ctx.lineTo(cssW - margin.r, toY(g));
      ctx.stroke();
    }
    ctx.restore();

    drawSoldierSilhouette(ctx, toX, toY, rangeMeters);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 106, 0, 0.28)';
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    recoilPath.forEach((p, i) => {
      if (i === 0) ctx.moveTo(toX(p.x), toY(p.y));
      else ctx.lineTo(toX(p.x), toY(p.y));
    });
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.7)';
    ctx.beginPath();
    ctx.moveTo(toX(-0.18), toY(0));
    ctx.lineTo(toX(0.18), toY(0));
    ctx.moveTo(toX(0), toY(-0.18));
    ctx.lineTo(toX(0), toY(0.18));
    ctx.stroke();
    ctx.restore();

    const lastShot = Math.max(shotCount - 1, 1);
    impacts.forEach((hit) => {
      const t = hit.shot / lastShot;
      ctx.beginPath();
      ctx.fillStyle = mixHex('#7dd3fc', '#ff6a00', t);
      const r = pellets > 1 ? 1.7 : hit.shot === 0 ? 3.1 : 2.4;
      ctx.globalAlpha = 0.55 + (1 - t) * 0.35;
      ctx.arc(toX(hit.x), toY(hit.y), r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(168, 176, 186, 0.75)';
    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.fillText('climb ↑', margin.l, 12);
    const cm = rangeMeters * Math.tan((Math.PI / 180) * 1) * 100;
    ctx.fillText(`1° ≈ ${Math.round(cm)} cm at ${rangeMeters} m`, margin.l, cssH - 8);
  }

  function run() {
    const weapon = state.weapons.find((w) => w.id === state.weaponId);
    if (!weapon) return;

    updateFavButton();
    showWeaponVisual(weapon);
    renderWeaponStats(weapon);
    renderWeaponUnlockNote(weapon);
    renderSpreadViz(weapon);

    const key = cacheKey(weapon.id);
    const cached = state.resultCache.get(key);
    if (cached) {
      applyResult(weapon, cached);
      return;
    }

    const locked = !isWeaponUnlocked(weapon.id);
    const unlockAt = weaponUnlockLevel(weapon.id);
    const challengeNote = state.includeChallenges ? ', challenge parts on' : '';
    els.status.textContent = locked
      ? `${weapon.name} unlocks at player level ${unlockAt}. Showing gun lvl ${state.masteryLevel} layouts${challengeNote}…`
      : `Finding best layouts for ${weapon.name} at gun lvl ${state.masteryLevel}${challengeNote}…`;
    els.detail.classList.add('is-loading');
    els.results.innerHTML = '';

    const requestId = `${key}:${Date.now()}`;
    state.activeOptimizeRequest = requestId;

    // Double rAF so the loading state paints before the (still sync) optimizer runs.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (state.weaponId !== weapon.id || state.activeOptimizeRequest !== requestId) return;
        const result = BF6.recommendSets(weapon, state.attachments, state.tables, {
          topN: 1,
          masteryLevel: state.masteryLevel,
          includeChallenges: state.includeChallenges,
        });
        state.resultCache.set(key, result);
        if (state.weaponId !== weapon.id || state.activeOptimizeRequest !== requestId) return;
        applyResult(weapon, result);
      });
    });
  }

  function bestForRange(result, rangeId) {
    return result.performance?.[rangeId]?.[0] ?? result.value?.[rangeId]?.[0] ?? null;
  }

  function bestForFocus(result, focusId) {
    return result.focusPerformance?.[focusId]?.[0] ?? result.focusValue?.[focusId]?.[0] ?? null;
  }

  function bestForThermalRange(result, rangeId) {
    return (
      result.thermalPerformance?.[rangeId]?.[0] ?? result.thermalValue?.[rangeId]?.[0] ?? null
    );
  }

  function thermalRangeMeta(range) {
    return {
      id: `thermal-${range.id}`,
      label: `${range.label} Thermal`,
      band: `${range.band} · named thermal optic`,
    };
  }

  function renderResults(result) {
    els.results.classList.remove('is-booting');
    void els.results.offsetWidth;

    const cards = [
      ...Object.values(BF6.RANGES).map((range) => rangeCard(range, bestForRange(result, range.id))),
      ...Object.values(BF6.FOCUSES).map((focus) => rangeCard(focus, bestForFocus(result, focus.id))),
    ];

    const thermalCards = Object.values(BF6.RANGES).map((range) =>
      rangeCard(thermalRangeMeta(range), bestForThermalRange(result, range.id))
    );
    const anyThermal = thermalCards.some((_, i) =>
      bestForThermalRange(result, Object.values(BF6.RANGES)[i].id)
    );

    if (result.hasThermal || anyThermal) {
      cards.push(`
        <div class="results-section" role="presentation">
          <h2>Thermal layouts</h2>
          <p>Best builds that lock a specific thermal optic (GRIM / PAS-35 / TS-HD / TH-RDS) first, then spend the remaining points.</p>
        </div>
      `);
      cards.push(...thermalCards);
    } else if (result.hasThermal === false) {
      cards.push(`
        <div class="results-section" role="presentation">
          <h2>Thermal layouts</h2>
          <p>No thermal optic unlocked for this gun at the current gun level.</p>
        </div>
      `);
    }

    els.results.innerHTML = cards.join('');
    els.results.classList.add('is-booting');
  }

  function rangeCard(range, entry) {
    if (!entry) {
      return `
        <section class="range-col" data-range="${range.id}">
          <header>
            <h2>${range.label}</h2>
            <p>${range.band}</p>
          </header>
          <p class="empty">No layout found.</p>
        </section>
      `;
    }

    const { labels, stats, ranked } = entry;
    const why = ranked.why.length ? ranked.why.join(' · ') : 'balanced gains';

    return `
      <section class="range-col" data-range="${range.id}">
        <header>
          <h2>${range.label}</h2>
          <p>${range.band}</p>
        </header>
        <div class="set-card single">
          <div class="set-meta">
            <span class="pts">${escapeHtml(formatPts(stats.pts))} / ${BF6.POINT_BUDGET} pts</span>
          </div>
          <ul class="att-list">
            <li><span>Optic</span><strong>${escapeHtml(labels.optic)}</strong></li>
            <li><span>Barrel</span><strong>${escapeHtml(labels.barrel)}</strong></li>
            <li><span>Muzzle</span><strong>${escapeHtml(labels.muzzle)}</strong></li>
            <li><span>Grip</span><strong>${escapeHtml(labels.grip)}</strong></li>
            <li><span>Laser</span><strong>${escapeHtml(labels.laser)}</strong></li>
            <li><span>Light</span><strong>${escapeHtml(labels.light)}</strong></li>
            <li><span>Mag</span><strong>${escapeHtml(labels.mag)}</strong></li>
            <li><span>Ammo</span><strong>${escapeHtml(labels.ammo ?? 'Standard')}</strong></li>
            <li><span>Ergo</span><strong>${escapeHtml(labels.ergo ?? 'None')}</strong></li>
          </ul>
          <p class="why">${escapeHtml(why)}</p>
        </div>
      </section>
    `;
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function sanitizeString(value, maxLen) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > maxLen) return null;
    return trimmed;
  }

  function sanitizeLabels(raw) {
    if (!isPlainObject(raw)) return null;
    const required = ['barrel', 'muzzle', 'grip', 'laser', 'mag'];
    for (const key of required) {
      if (typeof raw[key] !== 'string' || !raw[key].trim() || raw[key].length > 80) return null;
    }
    const defaults = {
      optic: '—',
      light: '—',
      ammo: 'Standard',
      ergo: 'None',
    };
    const labels = {};
    for (const key of LABEL_KEYS) {
      const fallback = defaults[key] ?? '';
      const src =
        typeof raw[key] === 'string' && raw[key].trim() ? raw[key].trim().slice(0, 80) : fallback;
      if (!src) return null;
      labels[key] = src;
    }
    return labels;
  }

  function sanitizeLoadout(raw) {
    if (!isPlainObject(raw)) return null;
    const labels = sanitizeLabels(raw.labels);
    if (!labels) return null;
    const pts = Number(raw.pts);
    if (!Number.isFinite(pts) || pts < 0 || pts > 500) return null;
    const why = Array.isArray(raw.why)
      ? raw.why
          .filter((line) => typeof line === 'string')
          .map((line) => line.trim().slice(0, 120))
          .filter(Boolean)
          .slice(0, 12)
      : [];
    return { labels, pts, why };
  }

  function sanitizeFavorite(raw) {
    if (!isPlainObject(raw)) return null;
    if (!SAFE_ID.test(raw.weaponId)) return null;
    const name = sanitizeString(raw.name, 80);
    const cls = sanitizeString(raw.cls, 40);
    if (!name || !cls) return null;
    if (!isPlainObject(raw.loadouts)) return null;

    const loadouts = {};
    for (const rangeId of Object.keys(BF6.RANGES)) {
      if (!(rangeId in raw.loadouts)) continue;
      const lo = sanitizeLoadout(raw.loadouts[rangeId]);
      if (!lo) return null;
      loadouts[rangeId] = lo;
    }
    for (const focusId of Object.keys(BF6.FOCUSES ?? {})) {
      if (!(focusId in raw.loadouts)) continue;
      const lo = sanitizeLoadout(raw.loadouts[focusId]);
      if (lo) loadouts[focusId] = lo;
    }
    for (const rangeId of Object.keys(BF6.RANGES)) {
      const key = `thermal_${rangeId}`;
      if (!(key in raw.loadouts)) continue;
      const lo = sanitizeLoadout(raw.loadouts[key]);
      if (lo) loadouts[key] = lo;
    }
    if (!Object.keys(BF6.RANGES).some((id) => loadouts[id])) return null;

    const savedAt = Number(raw.savedAt);
    return {
      weaponId: raw.weaponId,
      name,
      cls,
      savedAt: Number.isFinite(savedAt) ? savedAt : Date.now(),
      loadouts,
    };
  }

  function loadFavorites() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map(sanitizeFavorite).filter(Boolean).slice(0, MAX_FAVORITES);
    } catch {
      return [];
    }
  }

  function formatPts(pts) {
    const n = Number(pts);
    if (!Number.isFinite(n)) return '0';
    return String(Math.round(n * 100) / 100);
  }

  function saveFavorites() {
    localStorage.setItem(FAV_KEY, JSON.stringify(state.favorites.slice(0, MAX_FAVORITES)));
  }

  function isFavorite(weaponId) {
    return state.favorites.some((f) => f.weaponId === weaponId);
  }

  function updateFavButton() {
    const on = isFavorite(state.weaponId);
    els.favToggle.classList.toggle('is-on', on);
    els.favToggle.setAttribute('aria-pressed', String(on));
    els.favToggle.textContent = on ? '★ Favourited' : '☆ Favourite';
  }

  function toggleFavorite() {
    const weapon = state.weapons.find((w) => w.id === state.weaponId);
    if (!weapon || !state.lastResult || state.lastResult.error) return;

    if (isFavorite(weapon.id)) {
      removeFavorite(weapon.id);
    } else {
      upsertFavorite(weapon, state.lastResult);
      renderFavorites();
      updateFavButton();
      renderWeaponList();
    }
  }

  function upsertFavorite(weapon, result) {
    const loadouts = {};
    for (const range of Object.values(BF6.RANGES)) {
      const entry = bestForRange(result, range.id);
      if (!entry) continue;
      loadouts[range.id] = {
        labels: entry.labels,
        pts: entry.stats.pts,
        why: entry.ranked.why,
      };
    }
    for (const focus of Object.values(BF6.FOCUSES)) {
      const entry = bestForFocus(result, focus.id);
      if (!entry) continue;
      loadouts[focus.id] = {
        labels: entry.labels,
        pts: entry.stats.pts,
        why: entry.ranked.why,
      };
    }
    for (const range of Object.values(BF6.RANGES)) {
      const entry = bestForThermalRange(result, range.id);
      if (!entry) continue;
      loadouts[`thermal_${range.id}`] = {
        labels: entry.labels,
        pts: entry.stats.pts,
        why: entry.ranked.why,
      };
    }

    const next = {
      weaponId: weapon.id,
      name: weapon.name,
      cls: weapon.cls,
      savedAt: Date.now(),
      loadouts,
    };

    const idx = state.favorites.findIndex((f) => f.weaponId === weapon.id);
    if (idx >= 0) state.favorites[idx] = next;
    else state.favorites.unshift(next);
    saveFavorites();
  }

  function removeFavorite(weaponId) {
    state.favorites = state.favorites.filter((f) => f.weaponId !== weaponId);
    saveFavorites();
    renderFavorites();
    updateFavButton();
    renderWeaponList();
  }

  function renderFavorites() {
    const has = state.favorites.length > 0;
    els.favorites.hidden = !has;
    if (!has) {
      els.favList.innerHTML = '';
      return;
    }

    const known = new Set(state.favorites.map((f) => f.weaponId));
    for (const id of [...state.expandedFavs]) {
      if (!known.has(id)) state.expandedFavs.delete(id);
    }

    els.favList.innerHTML = state.favorites
      .map((fav) => {
        const open = state.expandedFavs.has(fav.weaponId);
        const summary = Object.values(BF6.RANGES)
          .map((range) => {
            const lo = fav.loadouts?.[range.id];
            if (!lo?.labels) return '';
            return `<div class="fav-range"><strong>${range.label}</strong> ${escapeHtml(lo.labels.optic ?? '—')}, ${escapeHtml(lo.labels.barrel)}, ${escapeHtml(lo.labels.grip)}</div>`;
          })
          .join('');

        const detailRanges = Object.values(BF6.RANGES)
          .map((range) => favLoadoutPanel(range, fav.loadouts?.[range.id]))
          .join('');
        const detailFocus = Object.values(BF6.FOCUSES)
          .map((focus) => favLoadoutPanel(focus, fav.loadouts?.[focus.id]))
          .join('');
        const detailThermal = Object.values(BF6.RANGES)
          .map((range) =>
            favLoadoutPanel(thermalRangeMeta(range), fav.loadouts?.[`thermal_${range.id}`])
          )
          .join('');
        const hasThermalFav = Object.values(BF6.RANGES).some(
          (range) => fav.loadouts?.[`thermal_${range.id}`]
        );

        return `
          <article class="fav-card${open ? ' is-open' : ''}">
            <div class="fav-top">
              <button type="button" class="fav-open" data-fav-open="${escapeHtml(fav.weaponId)}">
                <span class="fav-name">${escapeHtml(fav.name)}</span>
                <span class="fav-class">${escapeHtml(fav.cls)}</span>
              </button>
              <button
                type="button"
                class="fav-expand"
                data-fav-expand="${escapeHtml(fav.weaponId)}"
                aria-expanded="${open}"
                title="${open ? 'Hide layouts' : 'View full layouts'}"
              >
                ${open ? 'Hide' : 'Layouts'}
              </button>
              <button type="button" class="fav-remove" data-remove-fav data-fav-weapon="${escapeHtml(fav.weaponId)}" title="Remove favourite">✕</button>
            </div>
            <div class="fav-summary"${open ? ' hidden' : ''}>${summary}</div>
            <div class="fav-detail"${open ? '' : ' hidden'}>
              ${detailRanges}
              ${detailFocus}
              ${
                hasThermalFav
                  ? `<div class="fav-section-label">Thermal layouts</div>${detailThermal}`
                  : ''
              }
            </div>
          </article>
        `;
      })
      .join('');
  }

  function favLoadoutPanel(range, lo) {
    if (!lo?.labels) {
      return `
        <div class="fav-loadout" data-range="${range.id}">
          <h3>${range.label}</h3>
          <p class="empty">No layout saved.</p>
        </div>
      `;
    }

    const why = Array.isArray(lo.why) && lo.why.length ? lo.why.join(' · ') : '';
    return `
      <div class="fav-loadout" data-range="${range.id}">
        <header>
          <h3>${range.label}</h3>
          <span class="pts">${escapeHtml(formatPts(lo.pts))} / ${BF6.POINT_BUDGET} pts</span>
        </header>
        <ul class="att-list">
          <li><span>Optic</span><strong>${escapeHtml(lo.labels.optic ?? '—')}</strong></li>
          <li><span>Barrel</span><strong>${escapeHtml(lo.labels.barrel)}</strong></li>
          <li><span>Muzzle</span><strong>${escapeHtml(lo.labels.muzzle)}</strong></li>
          <li><span>Grip</span><strong>${escapeHtml(lo.labels.grip)}</strong></li>
          <li><span>Laser</span><strong>${escapeHtml(lo.labels.laser)}</strong></li>
          <li><span>Light</span><strong>${escapeHtml(lo.labels.light ?? '—')}</strong></li>
          <li><span>Mag</span><strong>${escapeHtml(lo.labels.mag)}</strong></li>
          <li><span>Ammo</span><strong>${escapeHtml(lo.labels.ammo ?? '—')}</strong></li>
          <li><span>Ergo</span><strong>${escapeHtml(lo.labels.ergo ?? '—')}</strong></li>
        </ul>
        ${why ? `<p class="why">${escapeHtml(why)}</p>` : ''}
      </div>
    `;
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
})();
