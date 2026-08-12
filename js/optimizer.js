/* global BF6 */
window.BF6 = window.BF6 || {};

(function (BF6) {
  const SLOT_ORDER = ['barrel', 'muzzle', 'grip', 'laser', 'mag', 'ammo', 'ergo', 'light', 'sight'];

  function lookupList(list, id, fallbackId = 'none') {
    return list.find((x) => x.id === id) ?? list.find((x) => x.id === fallbackId) ?? list[0];
  }

  function uniqueGrips(gripIds, gripsById) {
    const best = new Map();
    for (const id of gripIds) {
      const g = gripsById[id];
      if (!g || g.noEffect) continue;
      const key = [
        g.adsRecoilTierMod ?? 0,
        g.movingAdsSpreadTierMod ?? 0,
        g.adsTimeTierMod ?? 0,
        g.adsMoveSpeedTierShift ?? 0,
        g.sprintRecoveryTierShift ?? 0,
      ].join('|');
      const prev = best.get(key);
      if (!prev || (g.pts ?? 0) < (prev.pts ?? 0)) best.set(key, g);
    }
    return [...best.values()];
  }

  function uniqueMuzzles(muzzleIds, muzzlesById) {
    const best = new Map();
    for (const id of muzzleIds) {
      const m = muzzlesById[id];
      if (!m) continue;
      const key = [
        m.adsRecoilTierMod ?? 0,
        m.adsRecoilVariationTierMod ?? 0,
        m.hipSpreadTierMod ?? 0,
        m.adsRecoilDecayMult ?? 1,
        m.worldSpot ?? 54,
        m.minimapSpot ?? 150,
        m.suppressor ? 1 : 0,
      ].join('|');
      const prev = best.get(key);
      if (!prev || (m.pts ?? 0) < (prev.pts ?? 0)) best.set(key, m);
    }
    return [...best.values()];
  }

  function uniqueLasers(laserIds, lasersById) {
    const best = new Map();
    for (const id of laserIds) {
      const laser = lasersById[id];
      if (!laser) continue;
      const key = [
        laser.hipSpreadTierMod ?? 0,
        laser.movingAdsSpreadTierMod ?? 0,
        (laser.hipSpreadDecayBoost ?? 0).toFixed(3),
      ].join('|');
      const prev = best.get(key);
      if (!prev || (laser.pts ?? 0) < (prev.pts ?? 0)) best.set(key, laser);
    }
    return [...best.values()];
  }

  function uniqueMags(mags) {
    const best = new Map();
    for (const mag of mags) {
      const key = [
        mag.mag ?? 0,
        mag.adsTimeTierShift ?? 0,
        mag.movingAdsSpreadTierMod ?? 0,
        mag.reloadSpeedTier ?? 0,
        mag.sprintRecoveryTierShift ?? 0,
        mag.adsMoveSpeedTierShift ?? 0,
      ].join('|');
      const prev = best.get(key);
      if (!prev || (mag.pts ?? 0) < (prev.pts ?? 0)) best.set(key, mag);
    }
    return [...best.values()];
  }

  function uniqueLights(lightIds, lightsById) {
    const best = new Map();
    for (const id of lightIds) {
      const light = lightsById[id];
      if (!light) continue;
      if (light.noEffect && light.id !== 'none') continue;
      const key = [(light.hipSpreadDecayBoost ?? 0).toFixed(3), light.pts ?? 0].join('|');
      const prev = best.get(key);
      if (!prev || (light.pts ?? 0) < (prev.pts ?? 0)) best.set(key, light);
    }
    if (lightsById.none) best.set('none', lightsById.none);
    return [...best.values()];
  }

  function uniqueErgos(ergoIds, ergosById) {
    const out = [];
    const seen = new Set();
    for (const id of ['none', ...ergoIds]) {
      const ergo = ergosById[id];
      if (!ergo || seen.has(ergo.id)) continue;
      if (ergo.noEffect && ergo.id !== 'none') continue;
      seen.add(ergo.id);
      out.push(ergo);
    }
    return out;
  }

  function defaultSight(sightsById, sightList) {
    return (
      sightList.find((s) => s.id === 'iron') ??
      sightList.find((s) => s.id === 'std_optic') ??
      sightsById.iron ??
      sightsById.std_optic ??
      sightList[0]
    );
  }

  function preferredSight(profileId, sightPool) {
    const prefs = {
      close: ['std_optic', 'iron', 'var_low'],
      mid: ['var_low', 'std_optic', 'var_high'],
      long: ['var_high', 'var_low', 'std_optic', 'thermal'],
      hipfire: ['iron', 'std_optic', 'var_low'],
      recoil: ['std_optic', 'var_low', 'iron'],
      ads: ['std_optic', 'iron', 'var_low'],
    };
    for (const id of prefs[profileId] ?? []) {
      const hit = sightPool.find((s) => s.id === id);
      if (hit) return hit;
    }
    return sightPool[0];
  }

  function buildSightPool(atts, sightsById) {
    const ids = atts.sight?.length ? atts.sight : Object.keys(sightsById);
    const pool = ids.map((id) => sightsById[id]).filter(Boolean);
    if (!pool.length && sightsById.iron) pool.push(sightsById.iron);
    if (!pool.length && sightsById.std_optic) pool.push(sightsById.std_optic);
    return pool;
  }

  function buildAmmoPool(weapon, data, tables) {
    const ammoTypes = BF6.byId(tables.AMMO_TYPES ?? data.AMMO?.AMMO ?? []);
    const weaponAmmo = tables.WEAPON_AMMO?.[weapon.id] ?? data.AMMO?.WEAPON_AMMO?.[weapon.id];
    const defId = weaponAmmo?.def ?? 'standard';
    const entries = Object.entries(weaponAmmo?.ammo ?? { [defId]: 0 });
    const pool = entries
      .map(([id, pts]) => {
        const base = ammoTypes[id] ?? { id, name: id };
        return { ...base, pts: pts ?? base.pts ?? 0 };
      })
      .filter(Boolean);
    if (!pool.length) {
      pool.push({ id: 'standard', name: 'Standard', pts: 0, ...(ammoTypes.standard ?? {}) });
    }
    return { pool, defId };
  }

  function stockParts(weapon, data, tables) {
    const atts = data.WEAPON_ATTS[weapon.id] ?? {};
    const wm = data.WEAPON_MAG[weapon.id];
    const barrelId = atts.barrelDef ?? atts.barrel?.[0] ?? 'basic';
    const magId = wm?.def ?? Object.keys(wm?.mags ?? {})[0];
    const sightsById = BF6.byId(data.SIGHTS);
    const sightPool = buildSightPool(atts, sightsById);
    const { pool: ammos, defId } = buildAmmoPool(weapon, data, tables);
    const ammo = ammos.find((a) => a.id === defId) ?? ammos[0];
    const ergosById = BF6.byId(data.ERGOS);

    return {
      muzzle: lookupList(data.MUZZLES, 'none'),
      barrel: lookupList(data.BARRELS, barrelId, 'basic'),
      grip: lookupList(data.GRIPS, 'none'),
      laser: lookupList(data.LASERS, 'none'),
      light: lookupList(data.LIGHTS, 'none'),
      sight: defaultSight(sightsById, sightPool),
      mag: { id: magId, ...(wm?.mags?.[magId] ?? { pts: 0, mag: weapon.mag }) },
      ammo,
      ergo: ergosById.none ?? { id: 'none', name: 'None', pts: 0 },
    };
  }

  function clampMasteryLevel(level, maxLevel = 50) {
    const n = Number(level);
    if (!Number.isFinite(n)) return maxLevel;
    return Math.max(0, Math.min(maxLevel, Math.floor(n)));
  }

  function attachmentUnlockLevel(weaponUnlocks, slot, id) {
    if (!id || id === 'none' || id === 'default') return 0;
    const levels = weaponUnlocks?.attachments?.[slot];
    if (!levels || typeof levels !== 'object') return null;
    if (Object.prototype.hasOwnProperty.call(levels, id)) return levels[id];
    // Weapon-specific grip variants share the base unlock (fold_vert_svk86 → fold_vert).
    const base = String(id).replace(/_[a-z0-9]+$/i, '');
    if (base && base !== id && Object.prototype.hasOwnProperty.call(levels, base)) {
      return levels[base];
    }
    return null;
  }

  function isChallengeAttachment(weaponUnlocks, slot, id) {
    if (!id || !weaponUnlocks?.challengeAttachments) return false;
    const list = weaponUnlocks.challengeAttachments[slot];
    if (!Array.isArray(list)) return false;
    if (list.includes(id)) return true;
    const base = String(id).replace(/_[a-z0-9]+$/i, '');
    return Boolean(base && base !== id && list.includes(base));
  }

  function isAttachmentUnlocked(weaponUnlocks, slot, id, masteryLevel, { includeChallenges = false } = {}) {
    if (!id || id === 'none' || id === 'default' || id === 'iron') return true;
    if (isChallengeAttachment(weaponUnlocks, slot, id)) return includeChallenges;
    const need = attachmentUnlockLevel(weaponUnlocks, slot, id);
    // Unmapped attachments are treated as unavailable so we never invent max-level unlocks.
    if (need == null) return false;
    return masteryLevel >= need;
  }

  function filterPool(pool, weaponUnlocks, slot, masteryLevel, options = {}) {
    if (!weaponUnlocks) return pool;
    const kept = pool.filter((item) =>
      isAttachmentUnlocked(weaponUnlocks, slot, item?.id, masteryLevel, options)
    );
    return kept.length
      ? kept
      : pool.filter((item) => item?.id === 'none' || item?.id === 'default' || item?.id === 'iron');
  }

  function buildOptionPools(weapon, data, tables, options = {}) {
    const atts = data.WEAPON_ATTS[weapon.id];
    if (!atts) return null;

    const unlocks = options.unlocks ?? tables.unlocks ?? data.unlocks ?? null;
    const masteryMax = options.masteryMax ?? unlocks?.weaponMasteryMax ?? 50;
    const masteryLevel = clampMasteryLevel(options.masteryLevel ?? masteryMax, masteryMax);
    const includeChallenges = Boolean(options.includeChallenges);
    const weaponUnlocks = unlocks?.weapons?.[weapon.id] ?? null;
    const filterOpts = { includeChallenges };

    const muzzlesById = BF6.byId(data.MUZZLES);
    const barrelsById = BF6.byId(data.BARRELS);
    const gripsById = BF6.byId(data.GRIPS);
    const lasersById = BF6.byId(data.LASERS);
    const lightsById = BF6.byId(data.LIGHTS);
    const sightsById = BF6.byId(data.SIGHTS);
    const ergosById = BF6.byId(data.ERGOS);

    let muzzles = uniqueMuzzles(['none', ...(atts.muzzle ?? [])], muzzlesById);
    let barrels = (atts.barrel ?? ['basic']).map((id) => barrelsById[id]).filter(Boolean);
    if (!barrels.length) barrels.push(barrelsById.basic ?? barrelsById.none);

    let grips = [gripsById.none, ...uniqueGrips(atts.grip ?? [], gripsById)].filter(Boolean);
    let lasers = uniqueLasers(['none', ...(atts.laser ?? [])], lasersById);
    let lights = uniqueLights(['none', ...(atts.light ?? [])], lightsById);
    let sights = buildSightPool(atts, sightsById);

    const wm = data.WEAPON_MAG[weapon.id];
    let mags = uniqueMags(Object.entries(wm?.mags ?? {}).map(([id, mag]) => ({ id, ...mag })));
    if (!mags.length) mags.push({ id: 'default', name: 'Default', pts: 0, mag: weapon.mag });

    let { pool: ammos } = buildAmmoPool(weapon, data, tables);
    const ergoIds = data.WEAPON_ERGO?.[weapon.id]?.avail ?? [];
    let ergos = uniqueErgos(ergoIds, ergosById);

    muzzles = filterPool(muzzles, weaponUnlocks, 'muzzle', masteryLevel, filterOpts);
    barrels = filterPool(barrels, weaponUnlocks, 'barrel', masteryLevel, filterOpts);
    grips = filterPool(grips, weaponUnlocks, 'grip', masteryLevel, filterOpts);
    lasers = filterPool(lasers, weaponUnlocks, 'laser', masteryLevel, filterOpts);
    lights = filterPool(lights, weaponUnlocks, 'light', masteryLevel, filterOpts);
    sights = filterPool(sights, weaponUnlocks, 'sight', masteryLevel, filterOpts);
    mags = filterPool(mags, weaponUnlocks, 'mag', masteryLevel, filterOpts);
    ammos = filterPool(ammos, weaponUnlocks, 'ammo', masteryLevel, filterOpts);
    ergos = filterPool(ergos, weaponUnlocks, 'ergo', masteryLevel, filterOpts);

    if (!barrels.length) barrels.push(barrelsById.basic ?? barrelsById.none);
    if (!mags.length) mags.push({ id: 'default', name: 'Default', pts: 0, mag: weapon.mag });
    if (!sights.length && sightsById.iron) sights.push(sightsById.iron);
    if (!ergos.length && ergosById.none) ergos.push(ergosById.none);

    return {
      muzzles,
      barrels,
      grips,
      lasers,
      lights,
      sights,
      mags,
      ammos,
      ergos,
      masteryLevel,
      laserLightCombined: Boolean(atts.laserLightCombined || atts.laserGripLightCombined),
      bySlot: {
        barrel: barrels,
        muzzle: muzzles,
        grip: grips,
        laser: lasers,
        mag: mags,
        ammo: ammos,
        ergo: ergos,
        light: lights,
        sight: sights,
      },
    };
  }

  function cloneParts(parts) {
    return {
      muzzle: parts.muzzle,
      barrel: parts.barrel,
      grip: parts.grip,
      laser: parts.laser,
      light: parts.light,
      sight: parts.sight,
      mag: parts.mag,
      ammo: parts.ammo,
      ergo: parts.ergo,
    };
  }

  function isValidCombo(parts, pools) {
    if (!pools.laserLightCombined) return true;
    if (parts.laser?.id !== 'none' && parts.light?.id !== 'none') return false;
    return true;
  }

  function makeEntry(parts, stats, ranked) {
    return {
      parts,
      stats,
      ranked,
      labels: {
        muzzle: parts.muzzle.name,
        barrel: parts.barrel.name,
        grip: parts.grip.name,
        laser: parts.laser.name,
        light: parts.light.name,
        optic: parts.sight.name,
        mag: parts.mag.name ?? parts.mag.id,
        ammo: parts.ammo?.name ?? parts.ammo?.id ?? 'Standard',
        ergo: parts.ergo?.name ?? 'None',
      },
    };
  }

  function scoreParts(weapon, parts, tables, stockStats, rangeId, mode, pools) {
    if (!isValidCombo(parts, pools)) return null;
    const stats = BF6.evaluateLoadout(weapon, parts, tables);
    if (stats.pts > BF6.POINT_BUDGET) return null;
    const ranked = BF6.scoreVsStock(stats, stockStats, rangeId, weapon.cls);
    const metric = mode === 'value' ? ranked.value : ranked.score;
    return { parts, stats, ranked, metric };
  }

  function coordinateDescent(weapon, start, pools, tables, stockStats, rangeId, mode, passes = 2) {
    let current = cloneParts(start);
    let best = scoreParts(weapon, current, tables, stockStats, rangeId, mode, pools);
    if (!best) return null;
    let considered = 1;

    for (let pass = 0; pass < passes; pass++) {
      for (const slot of SLOT_ORDER) {
        const options = pools.bySlot[slot];
        for (const option of options) {
          const trial = cloneParts(current);
          trial[slot] = option;
          if (pools.laserLightCombined && trial.laser?.id !== 'none' && trial.light?.id !== 'none') {
            if (slot === 'laser') trial.light = pools.bySlot.light.find((l) => l.id === 'none') ?? trial.light;
            if (slot === 'light') trial.laser = pools.bySlot.laser.find((l) => l.id === 'none') ?? trial.laser;
          }
          const scored = scoreParts(weapon, trial, tables, stockStats, rangeId, mode, pools);
          considered += 1;
          if (!scored) continue;
          if (scored.metric > best.metric + 1e-9) {
            best = scored;
            current = cloneParts(trial);
          }
        }
      }
    }

    return { ...best, considered };
  }

  function insertTop(list, entry, topN, compare) {
    const key = [
      entry.parts.barrel.id,
      entry.parts.muzzle.id,
      entry.parts.grip.id,
      entry.parts.laser.id,
      entry.parts.light.id,
      entry.parts.sight.id,
      entry.parts.mag.id,
      entry.parts.ammo.id,
      entry.parts.ergo.id,
    ].join('|');
    if (list.some((x) => x.__key === key)) return;
    entry.__key = key;
    list.push(entry);
    list.sort(compare);
    if (list.length > topN) list.length = topN;
  }

  function optimizeProfile(weapon, pools, tables, stock, stockStats, profileId, topN) {
    const bestValue = [];
    const bestPerf = [];
    let considered = 0;
    const seeds = [];

    for (const barrel of pools.barrels) {
      const seed = cloneParts(stock);
      seed.barrel = barrel;
      seed.sight = preferredSight(profileId, pools.sights) ?? seed.sight;
      seeds.push(seed);
    }

    const suppressor = pools.muzzles.find((m) => m.suppressor);
    if (suppressor) {
      const seed = cloneParts(stock);
      seed.muzzle = suppressor;
      seed.sight = preferredSight(profileId, pools.sights) ?? seed.sight;
      seeds.push(seed);
    }

    // Hipfire-friendly seed: laser on when available.
    if (profileId === 'hipfire') {
      const laser = pools.lasers.find((l) => l.id !== 'none') ?? pools.lasers[0];
      if (laser) {
        const seed = cloneParts(stock);
        seed.laser = laser;
        seed.sight = preferredSight(profileId, pools.sights) ?? seed.sight;
        seeds.push(seed);
      }
    }

    for (const seed of seeds) {
      const perf = coordinateDescent(weapon, seed, pools, tables, stockStats, profileId, 'score', 2);
      if (perf) {
        considered += perf.considered;
        if (perf.ranked.score > 0.015) {
          insertTop(bestPerf, makeEntry(perf.parts, perf.stats, perf.ranked), topN, (a, b) => {
            if (b.ranked.score !== a.ranked.score) return b.ranked.score - a.ranked.score;
            return a.stats.pts - b.stats.pts;
          });
          insertTop(bestValue, makeEntry(perf.parts, perf.stats, perf.ranked), topN, (a, b) => {
            if (b.ranked.value !== a.ranked.value) return b.ranked.value - a.ranked.value;
            if (b.ranked.score !== a.ranked.score) return b.ranked.score - a.ranked.score;
            return a.stats.pts - b.stats.pts;
          });
        }
      }

      const value = coordinateDescent(weapon, seed, pools, tables, stockStats, profileId, 'value', 2);
      if (value) {
        considered += value.considered;
        if (value.ranked.score > 0.015) {
          insertTop(bestValue, makeEntry(value.parts, value.stats, value.ranked), topN, (a, b) => {
            if (b.ranked.value !== a.ranked.value) return b.ranked.value - a.ranked.value;
            if (b.ranked.score !== a.ranked.score) return b.ranked.score - a.ranked.score;
            return a.stats.pts - b.stats.pts;
          });
        }
      }
    }

    return { considered, value: bestValue, performance: bestPerf };
  }

  BF6.recommendSets = function recommendSets(
    weapon,
    data,
    tables,
    { topN = 1, masteryLevel, includeChallenges = false } = {}
  ) {
    const unlocks = tables.unlocks ?? data.unlocks ?? null;
    const pools = buildOptionPools(weapon, data, tables, {
      masteryLevel,
      masteryMax: unlocks?.weaponMasteryMax,
      unlocks,
      includeChallenges,
    });
    if (!pools) return { error: 'No attachment data for this weapon.' };

    const stock = stockParts(weapon, data, tables);
    const stockStats = BF6.evaluateLoadout(weapon, stock, tables);

    const bestByRange = { close: [], mid: [], long: [] };
    const maxPerf = { close: [], mid: [], long: [] };
    const bestByFocus = { hipfire: [], recoil: [], ads: [] };
    const maxFocus = { hipfire: [], recoil: [], ads: [] };
    let considered = 0;

    for (const rangeId of Object.keys(BF6.RANGES)) {
      const out = optimizeProfile(weapon, pools, tables, stock, stockStats, rangeId, topN);
      considered += out.considered;
      bestByRange[rangeId] = out.value;
      maxPerf[rangeId] = out.performance;
    }

    for (const focusId of Object.keys(BF6.FOCUSES)) {
      const out = optimizeProfile(weapon, pools, tables, stock, stockStats, focusId, topN);
      considered += out.considered;
      bestByFocus[focusId] = out.value;
      maxFocus[focusId] = out.performance;
    }

    return {
      considered,
      stock: { parts: stock, stats: stockStats },
      value: bestByRange,
      performance: maxPerf,
      focusValue: bestByFocus,
      focusPerformance: maxFocus,
    };
  };
})(window.BF6);
