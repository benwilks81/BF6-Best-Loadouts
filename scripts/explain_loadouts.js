#!/usr/bin/env node
/**
 * Rewrite the README "why each option is chosen" section from the live optimizer.
 * Run after weapon/attachment stats or scoring change. The weekly refresh calls this.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const README = path.join(ROOT, 'README.md');
const START = '<!-- loadout-reasons:start -->';
const END = '<!-- loadout-reasons:end -->';
const MASTERY = 50;

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

const WEIGHT_PHRASES = {
  ads: 'ADS speed',
  recoil: 'recoil per shot',
  movingAds: 'moving ADS spread',
  velocity: 'bullet velocity',
  hipfire: 'hipfire spread',
  mag: 'magazine size',
  optic: 'optic picture',
  stealth: 'being harder to spot',
  spread: 'ADS bloom',
  recovery: 'recoil recovery',
  reload: 'reload speed',
  handling: 'handling',
  hs: 'headshot time to kill',
  hipControl: 'hipfire control',
  fireMode: 'full-auto conversion',
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
  { id: 'close', title: 'Close', band: '0–20 m', weights: 'close', get: (r) => r.performance?.close?.[0] },
  { id: 'mid', title: 'Medium', band: '20–50 m', weights: 'mid', get: (r) => r.performance?.mid?.[0] },
  { id: 'long', title: 'Long', band: '50–100 m+', weights: 'long', get: (r) => r.performance?.long?.[0] },
  { id: 'hipfire', title: 'Hipfire', band: 'from the hip', weights: 'hipfire', get: (r) => r.focusPerformance?.hipfire?.[0] },
  { id: 'recoil', title: 'Recoil', band: 'control and recovery', weights: 'recoil', get: (r) => r.focusPerformance?.recoil?.[0] },
  { id: 'ads', title: 'ADS', band: 'snap onto target', weights: 'ads', get: (r) => r.focusPerformance?.ads?.[0] },
  { id: 'stealth-close', title: 'Close stealth', band: '0–20 m, spotting scored', weights: 'close', stealth: true, get: (r) => r.stealthPerformance?.close?.[0] },
  { id: 'stealth-mid', title: 'Medium stealth', band: '20–50 m, spotting scored', weights: 'mid', stealth: true, get: (r) => r.stealthPerformance?.mid?.[0] },
  { id: 'stealth-long', title: 'Long stealth', band: '50–100 m+, spotting scored', weights: 'long', stealth: true, get: (r) => r.stealthPerformance?.long?.[0] },
  { id: 'thermal-close', title: 'Close thermal', band: '0–20 m, thermal optic locked', weights: 'close', thermal: true, get: (r) => r.thermalPerformance?.close?.[0] },
  { id: 'thermal-mid', title: 'Medium thermal', band: '20–50 m, thermal optic locked', weights: 'mid', thermal: true, get: (r) => r.thermalPerformance?.mid?.[0] },
  { id: 'thermal-long', title: 'Long thermal', band: '50–100 m+, thermal optic locked', weights: 'long', thermal: true, get: (r) => r.thermalPerformance?.long?.[0] },
];

function loadScripts() {
  const window = { BF6: {} };
  const context = { window, console };
  for (const file of ['js/embedded-data.js', 'js/stats.js', 'js/optimizer.js']) {
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
  }
  return window;
}

function tablesFor(data) {
  const ammoTypes = (data.ammo?.AMMO ?? []).map((entry) => {
    const label = AMMO_DISPLAY_NAMES[entry?.id];
    return label ? { ...entry, name: label } : entry;
  });
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

function fmtScore(n) {
  if (!Number.isFinite(n)) return null;
  return String(Math.round(n * 100) / 100);
}

function opticTableKey(BF6, build) {
  if (BF6.OPTIC_AIM[build.weights]) return build.weights;
  return BF6.FOCUS_OPTIC_PROFILE?.[build.weights] ?? 'mid';
}

function fmtNum(n) {
  if (!Number.isFinite(n)) return '—';
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function md(text) {
  return String(text ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function goalSentence(BF6, build) {
  const weights = BF6.RANGE_WEIGHTS[build.weights] ?? BF6.FOCUS_WEIGHTS[build.weights] ?? {};
  const ranked = Object.entries(weights)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key]) => WEIGHT_PHRASES[key] ?? key);
  const focus = ranked.length ? `Highest weights: ${ranked.join(', ')}.` : '';
  if (build.thermal) {
    return `A named thermal optic is locked in first, then the remaining points follow the ${build.weights} weights. ${focus} Spotting is not scored.`;
  }
  if (build.stealth) {
    return `${focus} Spotting is scored: world flash starts at 54 m and the minimap ping at 150 m, each multiplied by the muzzle, barrel, and ammo. A suppressor is 0 m in the world and 21 m on the minimap.`;
  }
  return `${focus} Spotting is not scored, so a suppressor's hide effect cannot beat recoil or hipfire on its own.`;
}

function tierPhrase(n, betterWhenPositive, noun) {
  const value = Number(n);
  if (!value) return null;
  const better = betterWhenPositive ? value > 0 : value < 0;
  const steps = Math.abs(value);
  const unit = steps === 1 ? 'tier' : 'tiers';
  return `${steps} ${noun} ${unit} ${better ? 'better' : 'worse'}`;
}

function spotPhrase(part) {
  const worldMult = part?.worldSpotMult ?? 1;
  const mapMult = part?.minimapSpotMult ?? 1;
  if (worldMult === 1 && mapMult === 1) return null;
  const world = 54 * worldMult;
  const map = 150 * mapMult;
  return `spotted at ${fmtNum(world)} m in the world and ${fmtNum(map)} m on the minimap`;
}

function effectsFor(slot, part, build) {
  const p = part ?? {};
  const bits = [];
  const push = (line) => {
    if (line) bits.push(line);
  };
  if (slot === 'optic') return bits;
  push(tierPhrase(p.adsRecoilTierMod, true, 'recoil'));
  if (p.adsRecoilDecayMult > 1) push(`recoil recovers at ${fmtNum(p.adsRecoilDecayMult)}×`);
  push(tierPhrase(p.hipSpreadTierMod, false, 'hipfire'));
  if (p.hipSpreadDecayBoost) push('hipfire settles faster');
  push(tierPhrase(p.velTierMod, true, 'velocity'));
  push(tierPhrase(p.adsTimeTierMod, false, 'ADS'));
  push(tierPhrase(p.movingAdsSpreadTierMod, true, 'moving ADS'));
  push(tierPhrase(p.adsMoveSpeedTierShift, false, 'handling'));
  const bloom = p.adsSpreadIncMult ?? p.spreadIncMult;
  if (typeof bloom === 'number' && bloom !== 1) push(bloom < 1 ? 'less ADS bloom per shot' : 'more ADS bloom per shot');
  if (p.setsFireModeAuto) push('converts the gun to full-auto');
  if (p.reloadSpeedMult > 1) push(`reload at ${fmtNum(p.reloadSpeedMult)}×`);
  if (slot === 'mag' && p.mag) push(`${p.mag} rounds`);
  if (slot === 'ammo') {
    if (p.id === 'synthetic' || p.hsMult === 'synthetic') push('higher headshot multiplier');
    if (p.id === 'hollow_pt' || p.hsMult === 'hp') push('higher headshot damage');
    if (String(p.id || '').startsWith('subsonic')) push('slower bullet, harder to spot when stealth is scored');
  }
  if (build.stealth || p.suppressor || (p.worldSpotMult != null && p.worldSpotMult !== 1)) {
    push(spotPhrase(p));
  }
  if (p.suppressor && !build.stealth) push('hides the shot, but this build does not score that');
  return bits;
}

function whySlot(slot, row, runner, total, build, BF6) {
  const name = row.name;
  const count = `${row.n} of ${total}`;
  if (slot === 'optic' && build.thermal) {
    return `${md(name)} on ${count} guns. The optic slot is forced to a thermal, then the magnification that fits this range wins.`;
  }
  if (slot === 'optic') {
    const table = BF6.OPTIC_AIM[opticTableKey(BF6, build)] ?? {};
    const score = fmtScore(table[row.id]);
    const other = runner ? ` ${md(runner.name)} is the next most common (${runner.n}).` : '';
    const scoreBit = score ? ` Its aim score at this range is ${score}.` : '';
    const picture = row.part?.noEffect ? ' The optic changes the picture score only, not recoil or spread.' : '';
    return `${md(name)} on ${count} guns.${other}${scoreBit}${picture}`;
  }
  const bits = effectsFor(slot, row.part, build);
  const empty = !row.id || row.id === 'none' || row.name === 'None' || row.name === '—';
  if (empty) {
    if (slot === 'laser' || slot === 'light') {
      return `Left empty on ${count} guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light.`;
    }
    return `Left empty on ${count} guns. Nothing in this slot raised the score enough to spend the points.`;
  }
  if (slot === 'ammo' && !bits.length) {
    bits.push('kept when special ammo does not earn its point cost');
  }
  if (slot === 'mag') bits.push('round count is scored against ADS and reload shifts');
  const detail = bits.length
    ? ` ${bits[0].charAt(0).toUpperCase()}${bits[0].slice(1)}${bits.length > 1 ? `; ${bits.slice(1).join('; ')}` : ''}.`
    : '';
  const cost = slot !== 'ammo' && Number.isFinite(row.part?.pts) ? ` (${fmtNum(row.part.pts)} pts)` : '';
  const alt = runner && runner.n >= Math.max(3, total * 0.15)
    ? ` ${md(runner.name)} is the next most common (${runner.n}).`
    : '';
  return `${md(name)}${cost} on ${count} guns.${detail}${alt}`;
}

function topWhy(entries) {
  const counts = new Map();
  for (const entry of entries) {
    for (const line of entry.ranked?.why ?? []) {
      counts.set(line, (counts.get(line) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([line]) => line);
}

function summarize(build, rows, BF6) {
  const lines = [];
  lines.push(`### ${build.title}`);
  lines.push('');
  lines.push(`${build.band}. ${goalSentence(BF6, build)}`);
  lines.push('');
  const cited = topWhy(rows.map((row) => row.entry));
  if (cited.length) {
    lines.push(`The on-site reason line is usually: ${cited.join(' · ')}.`);
    lines.push('');
  }
  lines.push('| Slot | Why it is chosen |');
  lines.push('| --- | --- |');
  for (const [label, partKey] of SLOTS) {
    const picks = rows.map((row) => {
      const part = row.entry.parts?.[partKey];
      const name = row.entry.labels?.[label] || part?.name || 'None';
      return { name, id: part?.id ?? name, part };
    });
    const ranked = new Map();
    for (const pick of picks) {
      const prev = ranked.get(pick.name);
      if (prev) prev.n += 1;
      else ranked.set(pick.name, { ...pick, n: 1 });
    }
    const ordered = [...ranked.values()].sort((a, b) => b.n - a.n);
    const winner = ordered[0];
    const runner = ordered[1];
    lines.push(`| ${label[0].toUpperCase()}${label.slice(1)} | ${whySlot(label, winner, runner, rows.length, build, BF6)} |`);
  }
  lines.push('');
  return lines.join('\n');
}

function generatedBody(BF6, data, results) {
  const refreshed = data.refreshedAt ? ` Data embedded ${data.refreshedAt}.` : '';
  const sections = [];
  for (const build of BUILDS) {
    const rows = [];
    for (const result of results) {
      if (build.thermal && !result.hasThermal) continue;
      const entry = build.get(result);
      if (!entry?.labels) continue;
      rows.push({ weapon: result.weapon, entry });
    }
    if (!rows.length) {
      const why = build.thermal
        ? `No primary has a named thermal optic unlocked at gun level ${MASTERY} (GRIM, PAS-35, TS-HD, or TH-RDS). This build shows on the site once those optics are in the data.`
        : `No gun produced this build at gun level ${MASTERY}.`;
      sections.push(`### ${build.title}\n\n${why}\n`);
      continue;
    }
    sections.push(summarize(build, rows, BF6));
  }
  return [
    `Generated for **gun level ${MASTERY}**, challenge parts off, one layout per primary (${results.length} guns).${refreshed}`,
    'Per-gun picks on the site can differ. These are the usual choices and the stats that make them win.',
    '',
    sections.join('\n'),
  ].join('\n');
}

function replaceSection(markdown, body) {
  const block = `${START}\n${body.trim()}\n${END}`;
  if (markdown.includes(START) && markdown.includes(END)) {
    const pattern = new RegExp(`${START}[\\s\\S]*?${END}`);
    return markdown.replace(pattern, block);
  }
  const heading = '## Why each option is chosen';
  const intro = [
    heading,
    '',
    'Each build keeps a 100-point budget. The table for that build says why the usual optic, barrel, muzzle, grip, laser, light, magazine, ammo, and ergo win.',
    'The weekly data refresh rewrites the block between the markers whenever weapon or attachment stats change. Do not edit that block by hand.',
    '',
    block,
    '',
  ].join('\n');
  const anchor = '## Keep the local site online';
  if (!markdown.includes(anchor)) return `${markdown.trim()}\n\n${intro}`;
  return markdown.replace(anchor, `${intro}${anchor}`);
}

function main() {
  const { BF6, BF6_DATA: data } = loadScripts();
  const tables = tablesFor(data);
  const weapons = (data.weapons ?? []).filter((weapon) => weapon && weapon.cls !== 'Sidearm');
  const results = [];
  for (const weapon of weapons) {
    const result = BF6.recommendSets(weapon, data.attachments, tables, {
      topN: 1,
      masteryLevel: MASTERY,
      includeChallenges: false,
    });
    if (result?.error) continue;
    results.push({ ...result, weapon });
  }
  if (!results.length) throw new Error('optimizer returned no layouts');
  const readme = fs.readFileSync(README, 'utf8');
  const next = replaceSection(readme, generatedBody(BF6, data, results));
  if (next === readme) {
    console.log('loadout reasons unchanged');
    return;
  }
  fs.writeFileSync(README, next.endsWith('\n') ? next : `${next}\n`);
  console.log(`updated README loadout reasons (${results.length} guns)`);
}

main();
