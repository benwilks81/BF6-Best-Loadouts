/* global BF6 */
window.BF6 = window.BF6 || {};

(function (BF6) {
  BF6.POINT_BUDGET = 100;

  /** Coerce attachment fields to finite numbers so hostile string pts cannot break scoring or XSS sinks. */
  function num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  BF6.num = num;

  BF6.RANGES = {
    close: { id: 'close', label: 'Close', meters: 12, band: '0–20 m' },
    mid: { id: 'mid', label: 'Medium', meters: 35, band: '20–50 m' },
    long: { id: 'long', label: 'Long', meters: 75, band: '50–100 m+' },
  };

  /** Specialist goals shown under the range layouts (tabbed, not in the main 3-col row). */
  BF6.FOCUSES = {
    hipfire: { id: 'hipfire', label: 'Hipfire', band: 'From the hip' },
    recoil: { id: 'recoil', label: 'Recoil', band: 'Control & recovery' },
    ads: { id: 'ads', label: 'ADS', band: 'Snap onto target' },
  };

  BF6.RANGE_WEIGHTS = {
      close: {
      ads: 1.15,
      recoil: 0.65,
      movingAds: 0.45,
      velocity: 0.1,
      hipfire: 1.35,
      mag: 0.55,
      optic: 0.4,
      stealth: 0.7,
      spread: 0.55,
      recovery: 0.35,
      reload: 0.55,
      handling: 0.4,
      hs: 0.95,
      hipControl: 0.45,
      fireMode: 0.9,
    },
    mid: {
      ads: 0.85,
      recoil: 1.25,
      movingAds: 1.0,
      velocity: 0.7,
      hipfire: 0.15,
      mag: 0.45,
      optic: 1.05,
      stealth: 0.95,
      spread: 1.1,
      recovery: 0.55,
      reload: 0.35,
      handling: 0.3,
      hs: 1.05,
      hipControl: 0.15,
      fireMode: 0.7,
    },
    long: {
      ads: 0.4,
      recoil: 1.35,
      movingAds: 1.15,
      velocity: 1.3,
      hipfire: 0.0,
      mag: 0.3,
      optic: 1.45,
      stealth: 0.85,
      spread: 1.25,
      recovery: 0.65,
      reload: 0.2,
      handling: 0.2,
      hs: 0.95,
      hipControl: 0.05,
      fireMode: 0.45,
    },
  };

  BF6.FOCUS_WEIGHTS = {
    hipfire: {
      ads: 0.2,
      recoil: 0.5,
      movingAds: 0.25,
      velocity: 0.05,
      hipfire: 2.35,
      mag: 0.4,
      optic: 0.08,
      stealth: 0.3,
      spread: 0.2,
      recovery: 0.35,
      reload: 0.4,
      handling: 0.65,
      hs: 0.45,
      hipControl: 1.75,
      fireMode: 0.85,
    },
    recoil: {
      ads: 0.35,
      recoil: 2.45,
      movingAds: 0.55,
      velocity: 0.2,
      hipfire: 0.1,
      mag: 0.2,
      optic: 0.35,
      stealth: 0.2,
      spread: 0.75,
      recovery: 1.85,
      reload: 0.15,
      handling: 0.25,
      hs: 0.55,
      hipControl: 0.1,
      fireMode: 0.4,
    },
    ads: {
      ads: 2.55,
      recoil: 0.55,
      movingAds: 0.9,
      velocity: 0.15,
      hipfire: 0.05,
      mag: 0.25,
      optic: 0.4,
      stealth: 0.15,
      spread: 0.4,
      recovery: 0.35,
      reload: 0.4,
      handling: 1.15,
      hs: 0.55,
      hipControl: 0.05,
      fireMode: 0.55,
    },
  };

  // Aim picture / target visibility by optic × engagement distance.
  BF6.OPTIC_AIM = {
    close: { iron: 0.42, std_optic: 0.55, var_low: 0.28, var_high: 0.12, thermal: 0.32, therm_hyb: 0.3 },
    mid: { iron: 0.18, std_optic: 0.58, var_low: 0.88, var_high: 0.72, thermal: 0.6, therm_hyb: 0.7 },
    long: { iron: 0.06, std_optic: 0.38, var_low: 0.86, var_high: 0.96, thermal: 0.74, therm_hyb: 0.84 },
  };

  BF6.FOCUS_OPTIC_PROFILE = {
    hipfire: 'close',
    recoil: 'mid',
    ads: 'close',
  };

  BF6.CLASS_RANGE_BIAS = {
    'Assault Rifle': { close: 1.0, mid: 1.15, long: 1.0 },
    Carbine: { close: 1.1, mid: 1.15, long: 0.9 },
    SMG: { close: 1.35, mid: 1.0, long: 0.7 },
    LMG: { close: 0.9, mid: 1.15, long: 1.1 },
    DMR: { close: 0.7, mid: 1.1, long: 1.35 },
    'Sniper Rifle': { close: 0.55, mid: 0.95, long: 1.45 },
    Shotgun: { close: 1.45, mid: 0.75, long: 0.4 },
  };

  BF6.byId = function byId(list) {
    return Object.fromEntries((list ?? []).map((item) => [item.id, item]));
  };

  function damageAtRange(weapon, range) {
    const points = weapon?.dmg;
    if (!Array.isArray(points) || points.length === 0) return null;
    if (range <= points[0].r) return points[0].d;
    for (let i = 1; i < points.length; i++) {
      const previous = points[i - 1];
      const point = points[i];
      if (range > point.r) continue;
      if (point.r === previous.r) return previous.d;
      return previous.d + (point.d - previous.d) * ((range - previous.r) / (point.r - previous.r));
    }
    return points.at(-1).d;
  }

  function bulletsToKill(damage, health = 100) {
    if (!(damage > 0)) return Infinity;
    return Math.ceil((health - 1e-9) / damage);
  }

  function timeToKillMsFromDamage(damage, rpm) {
    if (!(damage > 0) || !(rpm > 0)) return null;
    const btk = bulletsToKill(damage);
    if (!Number.isFinite(btk)) return null;
    return ((btk - 1) * 60000) / rpm;
  }

  function timeToKillMs(weapon, rangeMeters) {
    return timeToKillMsFromDamage(damageAtRange(weapon, rangeMeters), weapon.rpm);
  }

  function profileRangeMeters(profileId) {
    if (BF6.RANGES[profileId]) return BF6.RANGES[profileId].meters;
    const opticProfile = BF6.FOCUS_OPTIC_PROFILE[profileId] ?? 'mid';
    return BF6.RANGES[opticProfile]?.meters ?? 35;
  }

  BF6.profileRangeMeters = profileRangeMeters;
  BF6.damageAtRange = damageAtRange;
  BF6.timeToKillMsFromDamage = timeToKillMsFromDamage;

  function clampIndex(index, length) {
    return Math.max(0, Math.min(length - 1, index));
  }

  function resolveAdsTimeMs(baseTier, attachmentTierMod, magTierShift, adsSpdTiers) {
    const idx = clampIndex(baseTier + magTierShift - attachmentTierMod, adsSpdTiers.length);
    return adsSpdTiers[idx];
  }

  function resolveMovingAdsSpread(tierMod, movingAccTiers, defaultMovTier) {
    const idx = clampIndex(defaultMovTier - tierMod, movingAccTiers.length);
    return movingAccTiers[idx];
  }

  function resolveRecoil(weapon, recoilMult, recoilTierMod) {
    const mult = recoilMult ?? 0.94;
    const perShot = weapon.recoilV * Math.pow(mult, recoilTierMod);
    const reductionPct = 100 * (1 - Math.pow(mult, recoilTierMod));
    return { perShot, reductionPct };
  }

  function resolveVelocity(baseVel, barrel, velocityLadder = 0.8) {
    if (barrel?.velTierMod != null && Number.isInteger(barrel.velTierMod)) {
      return baseVel * velocityLadder ** -barrel.velTierMod;
    }
    if (typeof barrel?.velMult === 'number' && barrel.velMult > 0) {
      return baseVel * barrel.velMult;
    }
    return baseVel;
  }

  function resolveHipSpreadMin(weapon, hipCls, hipSpreadTiers, hipSpreadTierMod) {
    const tiers = hipSpreadTiers[hipCls];
    if (!tiers || !weapon.spread?.hipStand) return weapon.spread?.hipStand?.[0] ?? null;
    const curMin = weapon.spread.hipStand[0];
    let nearestIdx = 0;
    let nearestDiff = Math.abs(tiers[0] - curMin);
    for (let i = 1; i < tiers.length; i++) {
      const d = Math.abs(tiers[i] - curMin);
      if (d < nearestDiff) {
        nearestDiff = d;
        nearestIdx = i;
      }
    }
    const newIdx = clampIndex(nearestIdx + hipSpreadTierMod, tiers.length);
    return tiers[newIdx];
  }

  // Higher = harder to spot. Suppressors + subsonic ammo stack.
  function stealthRating(muzzle, ammo) {
    let worldSpot = muzzle?.worldSpot ?? 54;
    let minimapSpot = muzzle?.minimapSpot ?? 150;

    if (ammo?.worldSpot != null) worldSpot = Math.min(worldSpot, ammo.worldSpot);
    if (muzzle?.suppressor && ammo?.suppressedMinimapSpot != null) {
      minimapSpot = Math.min(minimapSpot, ammo.suppressedMinimapSpot);
    } else if (ammo?.minimapSpot != null) {
      minimapSpot = Math.min(minimapSpot, ammo.minimapSpot);
    }

    const world = 1 - Math.min(Math.max(worldSpot, 0), 54) / 54;
    const map = 1 - Math.min(Math.max(minimapSpot, 0), 150) / 150;
    return 0.35 * world + 0.65 * map;
  }

  function adsSpreadControl(barrel) {
    const inc = barrel?.spreadIncMult ?? 1;
    const decCoef = barrel?.spreadFiringDecCoefMult ?? 1;
    const decOff = barrel?.spreadFiringDecOffsetMult ?? 1;
    // Lower bloom + faster recovery = higher control.
    return (1 / Math.max(inc, 0.2)) * (0.65 * decCoef + 0.35 * (1 / Math.max(decOff, 0.2)));
  }

  function resolveHsMult(ammo, weapon, tables) {
    const base = tables.BASE_HS_MULT?.[weapon.id] ?? tables.AUTO_HS_MULT?.standard ?? 1.34;
    if (ammo == null) return base;
    // Synthetic tip uses the AUTO ladder even when the ammo row stores a numeric fallback.
    if (ammo.id === 'synthetic' || ammo.hsMult === 'synthetic') {
      return tables.AUTO_HS_MULT?.synthetic ?? (typeof ammo.hsMult === 'number' ? ammo.hsMult : 1.8);
    }
    if (ammo.hsMult == null) return base;
    if (ammo.hsMult === 'hp') {
      // raymdl: Hollow Point is 1.75× on HP_HS_HIGH weapons, otherwise the AUTO hp tier.
      const high = tables.HP_HS_HIGH;
      if (Array.isArray(high) && high.includes(weapon.id)) return 1.75;
      return tables.AUTO_HS_MULT?.hp ?? 1.57;
    }
    if (typeof ammo.hsMult === 'number') return ammo.hsMult;
    return tables.AUTO_HS_MULT?.[ammo.hsMult] ?? base;
  }

  function headshotTtkMs(weapon, hsMult, rangeMeters) {
    const body = damageAtRange(weapon, rangeMeters);
    if (body == null) return null;
    return timeToKillMsFromDamage(body * Math.max(hsMult, 0), weapon.rpm);
  }

  function headshotBtk(weapon, hsMult, rangeMeters) {
    const body = damageAtRange(weapon, rangeMeters);
    if (body == null) return null;
    return bulletsToKill(body * Math.max(hsMult, 0));
  }

  function hsTtkGain(statsHsTtk, stockHsTtk, statsHsMult, stockHsMult, statsHsBtk = null, stockHsBtk = null) {
    const multGain = (statsHsMult - stockHsMult) / Math.max(stockHsMult, 1);
    if (statsHsTtk == null || stockHsTtk == null) return multGain;

    let gain = 0;
    // Both already one-shot headshots: keep a small multiplier tie-break.
    if (stockHsTtk <= 0 && statsHsTtk <= 0) {
      gain = multGain * 0.25;
    } else {
      gain = (stockHsTtk - statsHsTtk) / Math.max(stockHsTtk, 1);
    }

    // Crossing a headshot breakpoint (e.g. 4HK → 3HK) is the real reason synth/HP matter.
    if (
      Number.isFinite(statsHsBtk) &&
      Number.isFinite(stockHsBtk) &&
      statsHsBtk < stockHsBtk
    ) {
      gain += 0.65 * (stockHsBtk - statsHsBtk);
    } else if (gain <= 1e-9 && multGain > 0) {
      // Same BTK, but higher mult still helps marginal ranges / damage drop-off.
      gain = multGain * 0.4;
    } else {
      gain += Math.max(0, multGain) * 0.12;
    }
    return gain;
  }

  function resolveReloadScore(magData, ergo, ladder) {
    const tier = magData?.reloadSpeedTier ?? 0;
    const mult = ergo?.reloadSpeedMult ?? 1;
    const ladderBoost = tier > 0 ? Math.pow(ladder ?? 1.13, tier) - 1 : 0;
    return ladderBoost + (mult - 1) * 1.5;
  }

  function resolveHandling(parts, magData) {
    const { grip, barrel, ammo, ergo } = parts;
    // Negative tier shifts are improvements in this dataset.
    const adsMove =
      (magData?.adsMoveSpeedTierShift ?? 0) +
      (grip?.adsMoveSpeedTierShift ?? 0) +
      (barrel?.adsMoveSpeedTierShift ?? 0) +
      (ammo?.adsMoveSpeedTierShift ?? 0);
    const sprint =
      (magData?.sprintRecoveryTierShift ?? 0) +
      (grip?.sprintRecoveryTierShift ?? 0) +
      (barrel?.sprintRecoveryTierShift ?? 0) +
      (ergo?.sprintRecoveryTierShift ?? 0);
    return -0.55 * adsMove - 0.45 * sprint;
  }

  BF6.evaluateLoadout = function evaluateLoadout(weapon, parts, tables, options = {}) {
    const { muzzle, barrel, grip, laser, mag, sight, light, ammo, ergo } = parts;
    const wm = tables.WEAPON_MAG[weapon.id];
    const magData = wm?.mags?.[mag.id] ?? mag ?? null;
    const rangeMeters = num(options.rangeMeters, BF6.RANGES.mid.meters);

    const adsAttachmentMod = (grip?.adsTimeTierMod ?? 0) + (barrel?.adsTimeTierMod ?? 0);
    const magAdsShift = magData?.adsTimeTierShift ?? 0;
    const baseAdsTier = wm?.defAds ?? 3;
    const adsTimeMs = resolveAdsTimeMs(
      baseAdsTier,
      adsAttachmentMod,
      magAdsShift,
      tables.ADS_SPD_TIERS,
    );

    const recoilTierMod =
      (grip?.adsRecoilTierMod ?? 0) +
      (muzzle?.adsRecoilTierMod ?? 0) +
      (ammo?.adsRecoilTierMod ?? 0) +
      (ergo?.adsRecoilTierMod ?? 0);
    const recoil = resolveRecoil(weapon, tables.RECOIL_MULT[weapon.id], recoilTierMod);
    const recoilRecovery = muzzle?.adsRecoilDecayMult ?? 1;

    const movingTierMod =
      (grip?.movingAdsSpreadTierMod ?? 0) +
      (barrel?.movingAdsSpreadTierMod ?? 0) +
      (laser?.movingAdsSpreadTierMod ?? 0) +
      (magData?.movingAdsSpreadTierMod ?? 0);
    const movingAdsSpread = resolveMovingAdsSpread(
      movingTierMod,
      tables.MOVING_ACC_TIERS,
      tables.DEFAULT_MOV_TIER ?? 3,
    );

    const hipSpreadTierMod =
      (muzzle?.hipSpreadTierMod ?? 0) +
      (barrel?.hipSpreadTierMod ?? 0) +
      (laser?.hipSpreadTierMod ?? 0);
    const hipSpread = resolveHipSpreadMin(
      weapon,
      tables.HIP_CLS[weapon.id],
      tables.HIP_SPREAD_TIERS,
      hipSpreadTierMod,
    );
    const hipControl = (laser?.hipSpreadDecayBoost ?? 0) + (light?.hipSpreadDecayBoost ?? 0);

    const bulletVel = resolveVelocity(weapon.bulletVel, barrel, tables.VELOCITY_LADDER);
    const bodyDmg = damageAtRange(weapon, rangeMeters);
    const ttk = timeToKillMsFromDamage(bodyDmg, weapon.rpm);
    const magSize = magData?.mag ?? weapon.mag;
    const hsMult = resolveHsMult(ammo, weapon, tables);
    const hsTtkMs = headshotTtkMs(weapon, hsMult, rangeMeters);
    const spreadControl = adsSpreadControl(barrel);
    const reloadScore = resolveReloadScore(magData, ergo, tables.RELOAD_SPEED_LADDER);
    const handling = resolveHandling(parts, magData);
    const stealth = stealthRating(muzzle, ammo);
    const fireMode =
      ergo?.setsFireModeAuto && weapon.fireMode !== 'auto'
        ? 1
        : ergo?.setsFireModeBurst && weapon.fireMode === 'auto'
          ? 0.2
          : 0;

    const pts =
      num(muzzle?.pts) +
      num(barrel?.pts) +
      num(grip?.pts) +
      num(laser?.pts) +
      num(magData?.pts) +
      num(sight?.pts) +
      num(light?.pts) +
      num(ammo?.pts) +
      num(ergo?.pts);

    return {
      pts,
      adsTimeMs,
      recoilPerShot: recoil.perShot,
      recoilReductionPct: recoil.reductionPct,
      recoilRecovery,
      movingAdsSpread,
      hipSpread,
      hipControl,
      bulletVel,
      rangeMeters,
      bodyDmg,
      ttkMs: ttk,
      magSize,
      hsMult,
      hsTtkMs,
      spreadControl,
      reloadScore,
      handling,
      adsRecoilTiers: recoilTierMod,
      sightId: sight?.id ?? 'iron',
      lightId: light?.id ?? 'none',
      muzzleId: muzzle?.id ?? 'none',
      ammoId: ammo?.id ?? 'standard',
      ergoId: ergo?.id ?? 'none',
      worldSpot: muzzle?.worldSpot ?? 54,
      minimapSpot: muzzle?.minimapSpot ?? 150,
      stealth,
      fireMode,
      suppressor: Boolean(muzzle?.suppressor),
    };
  };

  function opticAimFor(profileId, sightId) {
    const opticKey = BF6.OPTIC_AIM[profileId]
      ? profileId
      : (BF6.FOCUS_OPTIC_PROFILE[profileId] ?? 'mid');
    return BF6.OPTIC_AIM[opticKey]?.[sightId] ?? BF6.OPTIC_AIM[opticKey]?.std_optic ?? 0.3;
  }

  function explainGains(deltas, profileId) {
    const labels = {
      adsGain: 'faster ADS',
      recoilGain: 'less recoil',
      movingGain: 'tighter moving ADS',
      velGain: 'higher velocity',
      hipGain: 'better hipfire',
      magGain: 'larger mag',
      opticGain: 'clearer optic picture',
      stealthGain: 'harder to spot',
      spreadGain: 'tighter ADS bloom',
      recoveryGain: 'faster recoil recovery',
      reloadGain: 'faster reload',
      handlingGain: 'snappier handling',
      hsGain: 'stronger headshots',
      hipControlGain: 'stickier hipfire',
      fireModeGain: 'full-auto conversion',
    };
    const importance = {
      close: [
        'fireModeGain',
        'hipGain',
        'hipControlGain',
        'stealthGain',
        'adsGain',
        'hsGain',
        'reloadGain',
        'opticGain',
      ],
      mid: [
        'fireModeGain',
        'stealthGain',
        'opticGain',
        'recoilGain',
        'spreadGain',
        'recoveryGain',
        'adsGain',
        'hsGain',
      ],
      long: [
        'opticGain',
        'stealthGain',
        'spreadGain',
        'recoilGain',
        'velGain',
        'recoveryGain',
        'fireModeGain',
        'hsGain',
      ],
      hipfire: [
        'hipGain',
        'hipControlGain',
        'fireModeGain',
        'handlingGain',
        'reloadGain',
        'recoilGain',
        'adsGain',
      ],
      recoil: [
        'recoilGain',
        'recoveryGain',
        'spreadGain',
        'movingGain',
        'opticGain',
        'adsGain',
      ],
      ads: [
        'adsGain',
        'handlingGain',
        'movingGain',
        'reloadGain',
        'recoilGain',
        'opticGain',
      ],
    };

    return (importance[profileId] ?? importance.mid)
      .filter((key) => deltas[key] > 0.02)
      .slice(0, 3)
      .map((key) => labels[key]);
  }

  BF6.scoreVsStock = function scoreVsStock(stats, stock, profileId, weaponClass = null, weapon = null) {
    const weights = BF6.RANGE_WEIGHTS[profileId] ?? BF6.FOCUS_WEIGHTS[profileId];
    if (!weights) {
      return { score: 0, value: 0, ptsSpent: 0, deltas: {}, why: [] };
    }
    const classBias = BF6.CLASS_RANGE_BIAS[weaponClass]?.[profileId] ?? 1;
    const rangeMeters = profileRangeMeters(profileId);

    const adsGain = (stock.adsTimeMs - stats.adsTimeMs) / Math.max(stock.adsTimeMs, 1);
    const recoilGain = (stock.recoilPerShot - stats.recoilPerShot) / Math.max(stock.recoilPerShot, 0.01);
    const movingGain = (stock.movingAdsSpread - stats.movingAdsSpread) / Math.max(stock.movingAdsSpread, 0.01);
    const velGain = (stats.bulletVel - stock.bulletVel) / Math.max(stock.bulletVel, 1);
    const hipGain =
      stock.hipSpread != null && stats.hipSpread != null
        ? (stock.hipSpread - stats.hipSpread) / Math.max(stock.hipSpread, 0.01)
        : 0;
    const magGain = (stats.magSize - stock.magSize) / Math.max(stock.magSize, 1);
    const opticGain = opticAimFor(profileId, stats.sightId) - opticAimFor(profileId, stock.sightId);
    const stealthGain = (stats.stealth ?? 0) - (stock.stealth ?? 0);
    const spreadGain = (stats.spreadControl - stock.spreadControl) / Math.max(stock.spreadControl, 0.5);
    const recoveryGain = (stats.recoilRecovery - stock.recoilRecovery) / Math.max(stock.recoilRecovery, 1);
    const reloadGain = stats.reloadScore - stock.reloadScore;
    const handlingGain = (stats.handling - stock.handling) / 2;
    // Headshot ammo is scored by actual headshot TTK / breakpoint at this layout's range.
    const statsHsTtk =
      weapon != null ? headshotTtkMs(weapon, stats.hsMult, rangeMeters) : stats.hsTtkMs;
    const stockHsTtk =
      weapon != null ? headshotTtkMs(weapon, stock.hsMult, rangeMeters) : stock.hsTtkMs;
    const statsHsBtk = weapon != null ? headshotBtk(weapon, stats.hsMult, rangeMeters) : null;
    const stockHsBtk = weapon != null ? headshotBtk(weapon, stock.hsMult, rangeMeters) : null;
    const hsGain = hsTtkGain(
      statsHsTtk,
      stockHsTtk,
      stats.hsMult,
      stock.hsMult,
      statsHsBtk,
      stockHsBtk
    );
    const hipControlGain = stats.hipControl - stock.hipControl;
    const fireModeGain = (stats.fireMode ?? 0) - (stock.fireMode ?? 0);

    const raw =
      (weights.ads * adsGain +
        weights.recoil * recoilGain +
        weights.movingAds * movingGain +
        weights.velocity * velGain +
        weights.hipfire * hipGain +
        weights.mag * magGain +
        weights.optic * opticGain +
        weights.stealth * stealthGain +
        weights.spread * spreadGain +
        weights.recovery * recoveryGain +
        weights.reload * reloadGain +
        weights.handling * handlingGain +
        weights.hs * hsGain +
        weights.hipControl * hipControlGain +
        weights.fireMode * fireModeGain) *
      classBias;

    const invested = Math.max(stats.pts, 1);
    const value = raw / Math.pow(invested / 15, 0.7);
    const why = explainGains(
      {
        adsGain,
        recoilGain,
        movingGain,
        velGain,
        hipGain,
        magGain,
        opticGain,
        stealthGain,
        spreadGain,
        recoveryGain,
        reloadGain,
        handlingGain,
        hsGain,
        hipControlGain,
        fireModeGain,
      },
      profileId,
    );

    return {
      score: raw,
      value,
      ptsSpent: Math.max(stats.pts - stock.pts, 0),
      deltas: {
        adsGain,
        recoilGain,
        movingGain,
        velGain,
        hipGain,
        magGain,
        opticGain,
        stealthGain,
        spreadGain,
        recoveryGain,
        reloadGain,
        handlingGain,
        hsGain,
        hipControlGain,
        fireModeGain,
      },
      why,
    };
  };
})(window.BF6);
