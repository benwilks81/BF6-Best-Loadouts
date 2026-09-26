/* global BF6, BF6_DATA */
(function () {
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

  const SLOTS = [
    ['optic', 'sight'],
    ['barrel', 'barrel'],
    ['muzzle', 'muzzle'],
    ['grip', 'grip'],
    ['laser', 'laser'],
    ['light', 'light'],
    ['mag', 'mag'],
    ['ammo', 'ammo'],
    ['ergo', 'ergo'],
  ];

  const BUILDS = [
    { id: 'close', title: 'Close', band: '0–20 m. Best parts for hipfire, ADS speed, and headshot time to kill. Spotting is not scored.', get: (r) => r.performance?.close?.[0] },
    { id: 'mid', title: 'Medium', band: '20–50 m. Best parts for recoil, a clear optic, and headshot time to kill. Spotting is not scored.', get: (r) => r.performance?.mid?.[0] },
    { id: 'long', title: 'Long', band: '50–100 m+. Best parts for optic picture, recoil, and velocity. Spotting is not scored.', get: (r) => r.performance?.long?.[0] },
    { id: 'hipfire', title: 'Hipfire', band: 'From the hip. Best parts for hipfire spread and control. Spotting is not scored.', get: (r) => r.focusPerformance?.hipfire?.[0] },
    { id: 'recoil', title: 'Recoil', band: 'Best parts for recoil per shot and recovery. Spotting is not scored.', get: (r) => r.focusPerformance?.recoil?.[0] },
    { id: 'ads', title: 'ADS', band: 'Best parts for ADS speed and handling. Spotting is not scored.', get: (r) => r.focusPerformance?.ads?.[0] },
    { id: 'stealth-close', title: 'Close stealth', band: '0–20 m, with spotting scored. The parts are the best close build that also hides the shot.', stealth: true, get: (r) => r.stealthPerformance?.close?.[0] },
    { id: 'stealth-mid', title: 'Medium stealth', band: '20–50 m, with spotting scored. The parts are the best medium build that also hides the shot.', stealth: true, get: (r) => r.stealthPerformance?.mid?.[0] },
    { id: 'stealth-long', title: 'Long stealth', band: '50–100 m+, with spotting scored. The parts are the best long build that also hides the shot.', stealth: true, get: (r) => r.stealthPerformance?.long?.[0] },
    { id: 'thermal-close', title: 'Close thermal', band: '0–20 m with a thermal optic locked in, then the best remaining parts for close range.', thermal: true, get: (r) => r.thermalPerformance?.close?.[0] },
    { id: 'thermal-mid', title: 'Medium thermal', band: '20–50 m with a thermal optic locked in, then the best remaining parts for medium range.', thermal: true, get: (r) => r.thermalPerformance?.mid?.[0] },
    { id: 'thermal-long', title: 'Long thermal', band: '50–100 m+ with a thermal optic locked in, then the best remaining parts for long range.', thermal: true, get: (r) => r.thermalPerformance?.long?.[0] },
  ];

  const els = {
    lead: document.getElementById('whyLead'),
    note: document.getElementById('whyNote'),
    gun: document.getElementById('whyGun'),
    nav: document.getElementById('whyNav'),
    cards: document.getElementById('whyCards'),
  };

  const params = new URLSearchParams(location.search);
  const gunLevel = clampLevel(params.get('gunLevel'), 50);
  const includeChallenges = params.get('challenges') === '1';

  function clampLevel(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(9999, Math.floor(n)));
  }

  function esc(text) {
    return String(text ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function ammoName(entry) {
    if (!entry || typeof entry !== 'object') return entry;
    const label = AMMO_DISPLAY_NAMES[entry.id];
    return label ? { ...entry, name: label } : entry;
  }

  function tables() {
    const data = BF6_DATA;
    const ammoTypes = (data.ammo?.AMMO ?? []).map(ammoName);
    return {
      ...data.balance,
      MUZZLES: data.attachments.MUZZLES,
      BARRELS: data.attachments.BARRELS,
      GRIPS: data.attachments.GRIPS,
      LASERS: data.attachments.LASERS,
      LIGHTS: data.attachments.LIGHTS,
      SIGHTS: data.attachments.SIGHTS,
      ERGOS: data.attachments.ERGOS,
      WEAPON_MAG: data.attachments.WEAPON_MAG,
      WEAPON_ERGO: data.attachments.WEAPON_ERGO,
      WEAPON_ATTS: data.attachments.WEAPON_ATTS,
      AMMO: data.ammo,
      AMMO_TYPES: ammoTypes,
      WEAPON_AMMO: data.ammo?.WEAPON_AMMO ?? {},
      unlocks: data.unlocks,
    };
  }

  function joinBits(bits) {
    if (!bits.length) return '';
    if (bits.length === 1) return bits[0];
    return `${bits.slice(0, -1).join(', ')} and ${bits.at(-1)}`;
  }

  function emptyReason(slot) {
    if (slot === 'laser' || slot === 'light') {
      return 'Left off. The grip, or another slot, scored higher for these points.';
    }
    return 'Left off. Nothing in this slot raised this loadout’s score enough to spend the points.';
  }

  function slotReason(slot, part, build) {
    const id = part?.id;
    const empty = !part || id === 'none' || id === 'default' || part.name === 'None';
    if (slot === 'optic') {
      if (build.thermal) return 'Required for this build. This magnification is the best thermal picture at this range.';
      return 'Best sight picture for this range.';
    }
    if (empty) return emptyReason(slot);

    if (slot === 'muzzle') {
      if (build.stealth && part.suppressor) {
        const world = Math.round(54 * (part.worldSpotMult ?? 0));
        const map = Math.round(150 * (part.minimapSpotMult ?? 0.14));
        return `Best muzzle for this loadout because it hides the shot (${world} m world, ${map} m minimap) and keeps the recoil control this range still needs.`;
      }
      if ((part.adsRecoilTierMod ?? 0) > 0) {
        return 'Best muzzle for this loadout because it cuts recoil and speeds recovery, which this range scores.';
      }
      if (part.suppressor) return 'Best muzzle for this loadout because hiding the shot is worth more than the other muzzles here.';
      return 'Best muzzle for this loadout on the score for this gun.';
    }

    if (slot === 'barrel') {
      const bits = [];
      if ((part.hipSpreadTierMod ?? 0) < 0) bits.push('tighter hipfire');
      if ((part.velTierMod ?? 0) > 0) bits.push('more velocity');
      if ((part.adsTimeTierMod ?? 0) < 0) bits.push('faster ADS');
      if ((part.adsSpreadIncMult ?? 1) < 1) bits.push('less bloom');
      if ((part.movingAdsSpreadTierMod ?? 0) > 0) bits.push('tighter moving ADS');
      if (bits.length) return `Best barrel for this loadout because it gives ${joinBits(bits)}.`;
      return 'Best barrel for this loadout on the score for this gun.';
    }

    if (slot === 'grip') {
      const bits = [];
      if ((part.adsRecoilTierMod ?? 0) > 0) bits.push('less recoil');
      if ((part.adsTimeTierMod ?? 0) < 0) bits.push('faster ADS');
      if ((part.movingAdsSpreadTierMod ?? 0) > 0) bits.push('tighter moving ADS');
      if (bits.length) return `Best grip for this loadout because it gives ${joinBits(bits)}.`;
      return 'Best grip for this loadout on the score for this gun.';
    }

    if (slot === 'laser') return 'Best laser for this loadout because it tightens hipfire more than leaving the slot empty.';
    if (slot === 'light') return 'Best light for this loadout because its handling or hipfire gain is worth the points.';

    if (slot === 'mag') {
      const rounds = part.mag ? `${part.mag} rounds` : 'this magazine';
      return `Best magazine for this loadout because ${rounds} beat the other sizes once ADS and reload are counted.`;
    }

    if (slot === 'ammo') {
      if (id === 'synthetic') return 'Best ammo for this loadout because the higher headshot multiplier shortens headshot time to kill more than the other rounds.';
      if (id === 'hollow_pt') return 'Best ammo for this loadout because the extra headshot damage is worth more than the other rounds.';
      if (id === 'lightweight') return 'Best ammo for this loadout because the handling gain beats a headshot round on this gun.';
      if (id === 'standard') return 'Best ammo for this loadout because a special round does not gain enough to justify its cost.';
      if (String(id).startsWith('subsonic')) return 'Best ammo for this loadout because it is harder to spot, and this build scores that.';
      if (id === 'long_range') return 'Best ammo for this loadout because its ranged ballistics beat the other rounds on this gun.';
      if (id === 'penetration' || id === 'range_pen') return 'Best ammo for this loadout because the penetration trade beats the other rounds on this gun.';
      if (id === 'buckshot' || id === 'buckshot_00' || id === 'flechette' || id === 'slugs') {
        return 'Best shell for this loadout because it scores higher than the other shotgun ammo.';
      }
      return 'Best ammo for this loadout on the score for this gun.';
    }

    if (slot === 'ergo') {
      if (part.setsFireModeAuto) return 'Best ergo for this loadout because full-auto is worth the points on this gun.';
      if ((part.reloadSpeedMult ?? 1) > 1) return 'Best ergo for this loadout because the faster reload is worth the points.';
      return 'Best ergo for this loadout on the score for this gun.';
    }

    return 'Best choice for this loadout on the score for this gun.';
  }

  function partLabel(entry, slot, partKey) {
    return entry.labels?.[slot] || entry.parts?.[partKey]?.name || 'None';
  }

  function isPicked(part) {
    const id = part?.id;
    return Boolean(part) && id !== 'none' && id !== 'default' && part.name !== 'None';
  }

  function cardHtml(build, entry) {
    const items = SLOTS.filter(([, partKey]) => isPicked(entry.parts?.[partKey]))
      .map(([slot, partKey]) => {
        const part = entry.parts?.[partKey];
        const name = partLabel(entry, slot, partKey);
        const why = slotReason(slot, part, build);
        return `<li><span>${esc(slot)}</span><div><strong>${esc(name)}</strong><p>${esc(why)}</p></div></li>`;
      })
      .join('');
    return `<article class="reason-card" id="${esc(build.id)}" data-build="${esc(build.id)}">
      <h2>${esc(build.title)}</h2>
      <p>${esc(build.band)}</p>
      <ul class="reason-slots">${items}</ul>
    </article>`;
  }

  function render(weapon, balanceTables) {
    const result = BF6.recommendSets(weapon, BF6_DATA.attachments, balanceTables, {
      topN: 1,
      masteryLevel: gunLevel,
      includeChallenges,
    });
    const shown = BUILDS.filter((build) => {
      if (build.thermal && !result.hasThermal) return false;
      return Boolean(build.get(result)?.labels);
    });
    els.lead.textContent = `${weapon.name}. Each build below is that loadout only: the parts that were picked, and why each one is the best choice for it.`;
    const challengeNote = includeChallenges ? ', challenge parts on' : '';
    els.note.textContent = `Gun level ${gunLevel}${challengeNote}.`;
    els.nav.innerHTML = shown
      .map((build) => `<a href="#${esc(build.id)}">${esc(build.title)}</a>`)
      .join('');
    els.cards.innerHTML = shown.map((build) => cardHtml(build, build.get(result))).join('');
  }

  function init() {
    const weapons = (BF6_DATA.weapons ?? []).filter((weapon) => weapon && weapon.cls !== 'Sidearm');
    const byClass = new Map();
    for (const weapon of weapons) {
      const list = byClass.get(weapon.cls) ?? [];
      list.push(weapon);
      byClass.set(weapon.cls, list);
    }
    els.gun.innerHTML = [...byClass.entries()]
      .map(([cls, list]) => {
        const options = list
          .map((weapon) => `<option value="${esc(weapon.id)}">${esc(weapon.name)}</option>`)
          .join('');
        return `<optgroup label="${esc(cls)}">${options}</optgroup>`;
      })
      .join('');

    const requested = params.get('gun');
    const initial = weapons.some((weapon) => weapon.id === requested) ? requested : weapons[0]?.id;
    if (initial) els.gun.value = initial;

    const balanceTables = tables();
    const show = () => {
      const weapon = weapons.find((item) => item.id === els.gun.value);
      if (!weapon) return;
      const url = new URL(location.href);
      url.searchParams.set('gun', weapon.id);
      url.searchParams.set('gunLevel', String(gunLevel));
      if (includeChallenges) url.searchParams.set('challenges', '1');
      else url.searchParams.delete('challenges');
      history.replaceState(null, '', url);
      render(weapon, balanceTables);
    };
    els.gun.addEventListener('change', show);
    show();
  }

  try {
    init();
  } catch (err) {
    els.lead.textContent = `Could not explain this loadout. ${err.message}`;
    console.error(err);
  }
})();
