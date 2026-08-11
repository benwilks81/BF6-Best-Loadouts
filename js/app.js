/* global BF6, BF6_DATA */
(function () {
  const FAV_KEY = 'bf6-best-loadouts-favorites-v1';
  const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
  const LABEL_KEYS = ['optic', 'barrel', 'muzzle', 'grip', 'laser', 'light', 'mag', 'ammo', 'ergo'];
  const MAX_FAVORITES = 40;
  const IMG_BASE = 'https://media.battlefield6.gg/cdn-cgi/image/format=auto,quality=85,width=1000/media/';
  const CLASS_SLUG = {
    'Assault Rifle': 'AssaultRifle',
    Carbine: 'Carbine',
    SMG: 'SMG',
    LMG: 'LMG',
    DMR: 'DMR',
    'Sniper Rifle': 'SniperRifle',
    Shotgun: 'Shotgun',
  };
  // Filenames verified against media.battlefield6.gg
  const IMAGE_FILES = {
    m433: 'AssaultRifle-M433.png',
    b36a4: 'AssaultRifle-B36A4.png',
    ak4d: 'AssaultRifle-AK4D.png',
    tr7: 'AssaultRifle-TR7.png',
    kord6p67: 'AssaultRifle-KORD-6P67.png',
    nvo228e: 'AssaultRifle-NVO-228E.png',
    l85a3: 'AssaultRifle-L85A3.png',
    m4a1: 'Carbine-M4A1.png',
    m277: 'Carbine-M277.png',
    ak205: 'Carbine-AK-205.png',
    m417a2: 'Carbine-M417-A2.png',
    grtbc: 'Carbine-GRT-BC.png',
    qbz192: 'Carbine-QBZ-192.png',
    sg553r: 'Carbine-SG-553R.png',
    sor300sc: 'Carbine-SOR-300SC.png',
    sgx: 'SMG-SGX.png',
    pw5a3: 'SMG-PW5A3.png',
    pw7a2: 'SMG-PW7A2.png',
    umg40: 'SMG-UMG-40.png',
    usg90: 'SMG-USG-90.png',
    kv9: 'SMG-KV9.png',
    scw10: 'SMG-SCW-10.png',
    sl9: 'SMG-SL9.png',
    l110: 'LMG-L110.png',
    drsiar: 'LMG-DRS-IAR.png',
    m60: 'LMG-M60.png',
    rpkm: 'LMG-RPKM.png',
    m123k: 'LMG-M123K.png',
    m250: 'LMG-M250.png',
    kts100: 'LMG-KTS100-MK8.png',
    m240l: 'LMG-M240L.png',
    m39emr: 'DMR-M39-EMR.png',
    lmr27: 'DMR-LMR27.png',
    svk86: 'DMR-SVK-86.png',
    svdm: 'DMR-SVDM.png',
    psr: 'Sniper%20Rifle-PSR.png',
    miniscout: 'SniperRifle-Mini-Scout.png',
    m87a1: 'Shotgun-M87A1.png',
    m1014: 'Shotgun-M1014.png',
    ks18k: 'Shotgun-185KS-K.png',
  };

  const state = {
    weapons: [],
    attachments: null,
    tables: null,
    weaponId: null,
    filter: '',
    lastResult: null,
    resultCache: new Map(),
    favorites: [],
    expandedFavs: new Set(),
  };

  const els = {
    weapon: document.getElementById('weapon'),
    weaponList: document.getElementById('weaponList'),
    weaponFilter: document.getElementById('weaponFilter'),
    favToggle: document.getElementById('favToggle'),
    favorites: document.getElementById('favorites'),
    favList: document.getElementById('favList'),
    status: document.getElementById('status'),
    weaponMeta: document.getElementById('weaponMeta'),
    weaponTitle: document.getElementById('weaponTitle'),
    weaponImage: document.getElementById('weaponImage'),
    weaponImageFallback: document.getElementById('weaponImageFallback'),
    weaponFallbackClass: document.getElementById('weaponFallbackClass'),
    weaponFallbackName: document.getElementById('weaponFallbackName'),
    results: document.getElementById('results'),
    detail: document.getElementById('detail'),
    dataAge: document.getElementById('dataAge'),
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

    const { weapons, attachments, balance, ammo } = BF6_DATA;

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
      AMMO_TYPES: ammo?.AMMO ?? [],
      WEAPON_AMMO: ammo?.WEAPON_AMMO ?? {},
    };

    state.favorites = loadFavorites();
    fillWeapons();
    renderWeaponList();
    renderFavorites();
    renderDataAge(BF6_DATA.refreshedAt);
    bind();
    run();
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
            return `
              <button
                type="button"
                class="weapon-item${active}${fav}"
                role="option"
                aria-selected="${w.id === state.weaponId}"
                data-weapon-id="${escapeHtml(w.id)}"
              >
                <span class="weapon-item-name">${escapeHtml(w.name)}</span>
                <span class="weapon-item-cal">${escapeHtml(w.cal ?? '')}</span>
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

  function imageCandidates(weapon) {
    const known = IMAGE_FILES[weapon.id];
    const slug = CLASS_SLUG[weapon.cls] ?? weapon.cls.replaceAll(' ', '');
    const names = [
      weapon.name,
      weapon.name.replaceAll(' ', '-'),
      weapon.name.replaceAll(' ', ''),
      weapon.id.toUpperCase(),
    ];
    const files = [];
    if (known) files.push(known);
    for (const n of names) {
      files.push(`${slug}-${n}.png`);
      files.push(`${encodeURIComponent(weapon.cls)}-${n}.png`);
    }
    return [...new Set(files)].map((file) => IMG_BASE + file);
  }

  function showWeaponVisual(weapon) {
    els.weaponTitle.textContent = weapon.name;
    els.weaponFallbackClass.textContent = weapon.cls;
    els.weaponFallbackName.textContent = weapon.name;
    els.weaponImageFallback.hidden = false;
    els.weaponImage.hidden = true;
    els.weaponImage.removeAttribute('src');

    const urls = imageCandidates(weapon);
    let index = 0;

    const tryNext = () => {
      if (index >= urls.length) return;
      const url = urls[index++];
      const img = new Image();
      img.onload = () => {
        if (state.weaponId !== weapon.id) return;
        els.weaponImage.src = url;
        els.weaponImage.alt = `${weapon.name} weapon art`;
        els.weaponImage.hidden = false;
        els.weaponImageFallback.hidden = true;
        els.detail.classList.add('has-image');
      };
      img.onerror = tryNext;
      img.src = url;
    };

    els.detail.classList.remove('has-image');
    tryNext();
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

  function run() {
    const weapon = state.weapons.find((w) => w.id === state.weaponId);
    if (!weapon) return;

    updateFavButton();
    showWeaponVisual(weapon);
    els.weaponMeta.textContent = `${weapon.cls} · ${weapon.cal ?? ''} · ${Math.round(weapon.rpm)} RPM`.trim();

    const cached = state.resultCache.get(weapon.id);
    if (cached) {
      applyResult(weapon, cached);
      return;
    }

    els.status.textContent = `Finding best layouts for ${weapon.name}…`;
    els.detail.classList.add('is-loading');
    els.results.innerHTML = '';

    // Double rAF so the loading state paints before the (still sync) optimizer runs.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (state.weaponId !== weapon.id) return;
        const started = performance.now();
        const result = BF6.recommendSets(weapon, state.attachments, state.tables, { topN: 1 });
        state.resultCache.set(weapon.id, result);
        if (state.weaponId !== weapon.id) return;
        applyResult(weapon, result);
        if (!result.error && performance.now() - started > 250) {
          console.info(`[bf6] ${weapon.id} optimized in ${Math.round(performance.now() - started)}ms (${result.considered} evals)`);
        }
      });
    });
  }

  function bestForRange(result, rangeId) {
    return result.performance?.[rangeId]?.[0] ?? result.value?.[rangeId]?.[0] ?? null;
  }

  function renderResults(result) {
    els.results.classList.remove('is-booting');
    void els.results.offsetWidth;
    els.results.innerHTML = Object.values(BF6.RANGES)
      .map((range) => rangeCard(range, bestForRange(result, range.id)))
      .join('');
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
    if (!Object.keys(loadouts).length) return null;

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

        const detail = Object.values(BF6.RANGES)
          .map((range) => favLoadoutPanel(range, fav.loadouts?.[range.id]))
          .join('');

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
            <div class="fav-detail"${open ? '' : ' hidden'}>${detail}</div>
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
