/* ===================== Save Jolli — game logic ===================== */

const SVGNS = "http://www.w3.org/2000/svg";
const $ = (id) => document.getElementById(id);
const screens = ["screen-title", "screen-intro", "screen-reveal", "screen-countdown", "screen-battle", "screen-win", "screen-lose"];
function show(id) {
  screens.forEach((s) => $(s).classList.toggle("active", s === id));
}
function ls(key, def) {
  const v = localStorage.getItem(key);
  return v === null ? def : v;
}

/* ---- deterministic randomness (same day => same enemy) ---- */
function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---- day / streak bookkeeping ---- */
const DAY_MS = 86400000;
function todayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }

if (!ls("sj_start", null)) localStorage.setItem("sj_start", String(midnight(new Date())));
const startMs = Number(ls("sj_start", midnight(new Date())));
const dayIndex = Math.max(0, Math.round((midnight(new Date()) - startMs) / DAY_MS));
let savedDays = Number(ls("sj_saved", "0"));

/* ---- pick today's enemy ---- */
let enemy = null;
let lastEnemyName = null;
function pickEnemy() {
  let pick;
  do { pick = PEOPLE[Math.floor(Math.random() * PEOPLE.length)]; }
  while (PEOPLE.length > 1 && pick.name === lastEnemyName);
  lastEnemyName = pick.name;
  enemy = pick;
}
pickEnemy();

/* ---- Jolli: the husband. an adult boy with normal short hair, no glasses,
       navy shirt. drawn at any size via head-radius r ---- */
function jolli(cx, cy, r, full) {
  const hc = "#241a12", skin = "#ffd9b3", shirt = "#34508f", dark = "#2e2018", pants = "#2e3a4a";
  const bw = 2.1 * r, bodyTop = cy + 0.9 * r, bh = (full ? 1.45 : 1.8) * r;
  let s = "";
  // legs (full body only)
  if (full) {
    const legY = bodyTop + bh;
    s += `<rect x="${cx - 0.42 * r}" y="${legY}" width="${0.34 * r}" height="${0.78 * r}" rx="${0.15 * r}" fill="${pants}"/>`;
    s += `<rect x="${cx + 0.08 * r}" y="${legY}" width="${0.34 * r}" height="${0.78 * r}" rx="${0.15 * r}" fill="${pants}"/>`;
  }
  // body
  s += `<rect x="${cx - bw / 2}" y="${bodyTop}" width="${bw}" height="${bh}" rx="${0.45 * r}" fill="${shirt}"/>`;
  // arms (full body only)
  if (full) {
    s += `<rect x="${cx - 1.18 * r}" y="${bodyTop + 0.12 * bh}" width="${0.34 * r}" height="${0.64 * bh}" rx="${0.16 * r}" fill="${skin}"/>`;
    s += `<rect x="${cx + 0.84 * r}" y="${bodyTop + 0.12 * bh}" width="${0.34 * r}" height="${0.64 * bh}" rx="${0.16 * r}" fill="${skin}"/>`;
  }
  // head
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${skin}"/>`;
  // normal short hair
  s += `<path d="M${cx - r} ${cy - 0.06 * r} Q${cx - 1.04 * r} ${cy - 1.34 * r} ${cx} ${cy - 1.32 * r} Q${cx + 1.04 * r} ${cy - 1.34 * r} ${cx + r} ${cy - 0.06 * r} Q${cx + 0.62 * r} ${cy - 0.6 * r} ${cx + 0.1 * r} ${cy - 0.66 * r} Q${cx - 0.4 * r} ${cy - 0.7 * r} ${cx - r} ${cy - 0.06 * r}Z" fill="${hc}"/>`;
  // eyebrows
  s += `<line x1="${cx - 0.55 * r}" y1="${cy - 0.2 * r}" x2="${cx - 0.27 * r}" y2="${cy - 0.24 * r}" stroke="${dark}" stroke-width="${0.1 * r}" stroke-linecap="round"/>`;
  s += `<line x1="${cx + 0.55 * r}" y1="${cy - 0.2 * r}" x2="${cx + 0.27 * r}" y2="${cy - 0.24 * r}" stroke="${dark}" stroke-width="${0.1 * r}" stroke-linecap="round"/>`;
  // eyes
  s += `<circle cx="${cx - 0.4 * r}" cy="${cy + 0.02 * r}" r="${0.12 * r}" fill="${dark}"/>`;
  s += `<circle cx="${cx + 0.4 * r}" cy="${cy + 0.02 * r}" r="${0.12 * r}" fill="${dark}"/>`;
  // smile
  s += `<path d="M${cx - 0.3 * r} ${cy + 0.45 * r} Q${cx} ${cy + 0.72 * r} ${cx + 0.3 * r} ${cy + 0.45 * r}" stroke="#9a5a44" stroke-width="${0.13 * r}" fill="none" stroke-linecap="round"/>`;
  return s;
}

/* ---- themed battle backdrop by relationship ----
   colleague -> London, friend -> Bangalore, family -> Davangere ---- */
function themeOf(rel) {
  if (/colleague/i.test(rel)) return "london";
  if (/friend/i.test(rel)) return "bangalore";
  return "davangere";
}
function themeBG(rel) {
  const t = themeOf(rel), base = 404;
  const bld = (x, w, ty, c) => `<rect x="${x}" y="${ty}" width="${w}" height="${base - ty}" rx="3" fill="${c}"/>`;
  const bush = (x, by, s, c) => `<rect x="${x - 2.2 * s}" y="${by - 12 * s}" width="${4.4 * s}" height="${12 * s}" rx="2" fill="#8a6a4a"/><circle cx="${x}" cy="${by - 16 * s}" r="${9 * s}" fill="${c}"/><circle cx="${x - 6 * s}" cy="${by - 12 * s}" r="${6 * s}" fill="${c}"/><circle cx="${x + 6 * s}" cy="${by - 12 * s}" r="${6 * s}" fill="${c}"/>`;
  let sky, items = "", label;
  if (t === "london") {
    sky = "#dbe3ec"; label = "London";
    items += bld(38, 30, 346, "#aeb7c2") + bld(74, 26, 332, "#bcc3cd") + bld(150, 30, 340, "#b3bbc6") + bld(186, 24, 328, "#c4cad3");
    items += bld(252, 20, 320, "#b3aa99") + `<polygon points="252,320 272,320 262,306" fill="#a89f8d"/><circle cx="262" cy="332" r="5" fill="#efe9da"/>`;
    items += `<rect x="58" y="386" width="44" height="16" rx="3" fill="#bd5a55"/><rect x="62" y="389" width="36" height="5" rx="1" fill="#e6dccb"/><circle cx="69" cy="403" r="3" fill="#3a3a3a"/><circle cx="95" cy="403" r="3" fill="#3a3a3a"/>`;
    items += bush(296, 404, 1, "#9fb39a");
  } else if (t === "bangalore") {
    sky = "#deedde"; label = "Bangalore";
    items += bld(72, 26, 330, "#aab9b1") + bld(104, 30, 316, "#9fb0b8") + bld(206, 26, 328, "#aab9b1") + bld(238, 30, 320, "#9fb0b8");
    items += bld(150, 40, 328, "#bcc7bc") + `<path d="M150 328 Q170 304 190 328 Z" fill="#aeb9ac"/><rect x="168" y="300" width="4" height="6" fill="#aeb9ac"/>`;
    items += bush(40, 404, 1.1, "#8fb38a") + bush(128, 404, 1, "#9cc096") + bush(296, 404, 1.1, "#8fb38a");
  } else {
    sky = "#fce3c1"; label = "home";
    items += `<circle cx="52" cy="314" r="12" fill="#f8cf8f"/>`; // warm sun
    // cosy houses with pitched roofs
    const home = (x, w, h, wall, roof) => { const top = base - h; return `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="2" fill="${wall}"/><polygon points="${x - 4},${top + 1} ${x + w + 4},${top + 1} ${x + w / 2},${top - 15}" fill="${roof}"/><rect x="${x + w / 2 - 4}" y="${base - 14}" width="8" height="14" rx="1" fill="${roof}"/>`; };
    items += home(38, 44, 50, "#e9cb9c", "#c98a5a") + home(96, 36, 40, "#e0bf8c", "#bd7f4f");
    items += home(248, 46, 54, "#e9cb9c", "#bd7f4f");
    const palm = (x, by) => `<rect x="${x - 2}" y="${by - 26}" width="4" height="26" rx="1.5" fill="#9a7a4a"/>` + [-1, -0.55, 0, 0.55, 1].map((a) => `<path d="M${x} ${by - 26} q ${a * 13} -6 ${a * 21} 3" stroke="#5f9a55" stroke-width="3.2" fill="none" stroke-linecap="round"/>`).join("") + `<circle cx="${x}" cy="${by - 26}" r="3" fill="#7a5a3a"/>`;
    items += palm(168, 404) + palm(300, 404) + palm(18, 404);
  }
  return `<rect x="24" y="296" width="292" height="112" rx="12" fill="${sky}"/>` + items;
}

/* ---- cute chibi (look derived from name hash + gender + kid flag) ---- */
function chibi(cx, cy, p) {
  const h = hashStr(p.name);
  const skins = ["#ffd9b3", "#f0c79a", "#e8b48a", "#d99e6a"];
  const shirts = ["#6abf8a", "#5aa0e6", "#e8a23a", "#9b7ad0", "#7fd0c0", "#5f8fd0", "#e87a7a", "#7aab6a", "#d98ac0", "#f0b24a"];
  const hairs = ["#3a2a1a", "#2e2a2a", "#5a3a2a", "#1a1a1a", "#6a4a2a"];
  const skin = skins[h % skins.length];
  const shirt = shirts[(h >> 3) % shirts.length];
  const hair = hairs[(h >> 6) % hairs.length];
  const female = p.gender === "f";
  const kid = !!p.kid;
  const baby = kid && /baby/i.test(p.relation || "");
  const glasses = ((h >> 11) & 1) === 1 && !baby;
  const mustache = !female && !kid && ((h >> 12) & 1) === 1;
  const longHair = female && ((h >> 9) & 1) === 1; // some women get a bun instead
  const pants = female ? "#7a6aa0" : "#4a4a4a";

  let s = "";
  // hair behind the head (women's long hair falls to the shoulders)
  if (female && !kid && !longHair) {
    s += `<path d="M${cx-25} ${cy+20} Q${cx-30} ${cy-18} ${cx} ${cy-26} Q${cx+30} ${cy-18} ${cx+25} ${cy+20} L${cx+18} ${cy+20} Q${cx+21} ${cy-6} ${cx} ${cy-9} Q${cx-21} ${cy-6} ${cx-18} ${cy+20}Z" fill="${hair}"/>`;
  }
  // head
  s += `<circle cx="${cx}" cy="${cy}" r="23" fill="${skin}"/>`;
  // top hair
  if (kid) {
    s += `<path d="M${cx-15} ${cy-11} Q${cx} ${cy-30} ${cx+15} ${cy-11} Q${cx+7} ${cy-19} ${cx} ${cy-19} Q${cx-7} ${cy-19} ${cx-15} ${cy-11}Z" fill="${hair}"/>`;
    s += `<path d="M${cx-1} ${cy-19} q5 -8 -3 -11" stroke="${hair}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else {
    s += `<path d="M${cx-23} ${cy-2} Q${cx-23} ${cy-30} ${cx} ${cy-28} Q${cx+23} ${cy-30} ${cx+23} ${cy-2} Q${cx+16} ${cy-15} ${cx} ${cy-15} Q${cx-16} ${cy-15} ${cx-23} ${cy-2}Z" fill="${hair}"/>`;
    if (female && longHair) s += `<circle cx="${cx}" cy="${cy-25}" r="8" fill="${hair}"/>`;
  }
  // eyes
  s += `<ellipse cx="${cx-8}" cy="${cy}" rx="3.2" ry="4.2" fill="#3a2a1a"/>`;
  s += `<ellipse cx="${cx+8}" cy="${cy}" rx="3.2" ry="4.2" fill="#3a2a1a"/>`;
  // grumpy eyebrows (it's an enemy!) — babies stay innocent
  if (!baby) {
    s += `<line x1="${cx-12}" y1="${cy-8}" x2="${cx-4}" y2="${cy-6}" stroke="#3a2a1a" stroke-width="2" stroke-linecap="round"/>`;
    s += `<line x1="${cx+12}" y1="${cy-8}" x2="${cx+4}" y2="${cy-6}" stroke="#3a2a1a" stroke-width="2" stroke-linecap="round"/>`;
  }
  if (glasses) {
    s += `<circle cx="${cx-8}" cy="${cy}" r="6" fill="none" stroke="#3a3a3a" stroke-width="1.6"/>`;
    s += `<circle cx="${cx+8}" cy="${cy}" r="6" fill="none" stroke="#3a3a3a" stroke-width="1.6"/>`;
    s += `<line x1="${cx-2}" y1="${cy}" x2="${cx+2}" y2="${cy}" stroke="#3a3a3a" stroke-width="1.6"/>`;
  }
  // cheeks (kids extra rosy)
  const cr = kid ? 4.2 : 3;
  s += `<circle cx="${cx-14}" cy="${cy+8}" r="${cr}" fill="#f0a080"/>`;
  s += `<circle cx="${cx+14}" cy="${cy+8}" r="${cr}" fill="#f0a080"/>`;
  if (mustache) s += `<rect x="${cx-8}" y="${cy+10}" width="16" height="3.5" rx="1.5" fill="#4a3326"/>`;
  // mouth (women get lips)
  if (female) s += `<path d="M${cx-5} ${cy+14} Q${cx} ${cy+18} ${cx+5} ${cy+14}" stroke="#c45a6a" stroke-width="2.8" fill="none"/>`;
  else s += `<path d="M${cx-7} ${cy+15} Q${cx} ${cy+12} ${cx+7} ${cy+15}" stroke="#6a4a3a" stroke-width="2.2" fill="none"/>`;
  // earrings for women
  if (female && !kid) {
    s += `<circle cx="${cx-22}" cy="${cy+6}" r="2" fill="#e8b94c"/>`;
    s += `<circle cx="${cx+22}" cy="${cy+6}" r="2" fill="#e8b94c"/>`;
  }
  // body (women wear a dress)
  if (female && !kid) {
    s += `<path d="M${cx-14} ${cy+20} L${cx+14} ${cy+20} L${cx+20} ${cy+54} L${cx-20} ${cy+54}Z" fill="${shirt}"/>`;
  } else {
    s += `<rect x="${cx-16}" y="${cy+20}" width="32" height="32" rx="11" fill="${shirt}"/>`;
  }
  // arms
  s += `<rect x="${cx-22}" y="${cy+26}" width="8" height="20" rx="4" fill="${skin}"/>`;
  s += `<rect x="${cx+14}" y="${cy+26}" width="8" height="20" rx="4" fill="${skin}"/>`;
  // legs
  const legY = (female && !kid) ? cy + 54 : cy + 50;
  s += `<rect x="${cx-12}" y="${legY}" width="9" height="16" rx="4" fill="${pants}"/>`;
  s += `<rect x="${cx+3}" y="${legY}" width="9" height="16" rx="4" fill="${pants}"/>`;

  // kids/babies are smaller — scale the whole figure about their feet
  const feetY = legY + 16;
  const scale = baby ? 0.66 : (kid ? 0.82 : 1);
  if (scale !== 1) s = `<g transform="translate(${cx} ${feetY}) scale(${scale}) translate(${-cx} ${-feetY})">${s}</g>`;
  return s;
}

/* ---- combat tuning ----
   Every tap throws a small attack ball at the enemy (tap faster => more balls).
   14 taps fills the ring => Akhi's POWER attack. The enemy charges its OWN ring
   over time and fires power attacks back. Akhi has lots of HP, so she only loses
   if she basically stops tapping.                                          */
const TAP_GAIN = 1 / 14;                        // 14 taps fills the ring
const DECAY = 0.05;                             // charge lost per second when idle
const TAP_DMG = 3;                              // small ball damage
const POWER_DMG = 30;                           // Akhi's power-attack damage
const AKHI_MAX = 200;
const ENEMY_TAP_INTERVAL = 1.0;                 // enemy throws a small jab this often
// COMPETITIVE tuning: the enemy hits hard and fast. higher-level enemies have
// more HP, so they survive longer and pummel Akhi more — you must tap fast to win.
// (roughly: friends need ~5 taps/sec, mid ~6, mini-bosses ~7+, or you lose.)
let enemyMaxHP = 0;
let ENEMY_FILL = 0;       // seconds for the enemy to charge a power
let ENEMY_POWER_DMG = 0;  // enemy power damage — a heavy chunk of Akhi's life
let ENEMY_TAP_DMG = 0;    // small jab damage to Akhi (constant chip)
function setEnemyStats() {
  // hard from the very first save, and keeps ramping ~4% per save (capped 1.5x).
  // split across HP + damage (sqrt) so it stays beatable for a fast tapper.
  const diff = Math.min(1.5, 1 + savedDays * 0.04);
  const s = Math.sqrt(diff);
  enemyMaxHP = (270 + enemy.level * 35) * s;
  ENEMY_FILL = 3.2;
  ENEMY_POWER_DMG = 46 * s;
  ENEMY_TAP_DMG = 2.8 * s;
}
setEnemyStats();

let charge = 0;
let enemyCharge = 0;
let enemyTapTimer = 0;
let foeHp = enemyMaxHP;
let akhiHp = AKHI_MAX;
let fighting = false;
let lastTs = 0;

const ringC = 2 * Math.PI * 40;
const enemyRingC = 2 * Math.PI * 42;

function paint() {
  $("charge-ring").setAttribute("stroke-dasharray", `${charge * ringC} ${ringC}`);
  $("enemy-ring").setAttribute("stroke-dasharray", `${Math.min(1, enemyCharge) * enemyRingC} ${enemyRingC}`);
  $("foe-hp").setAttribute("width", Math.max(0, 114 * (foeHp / enemyMaxHP)));
  $("akhi-hp").setAttribute("width", Math.max(0, 114 * (akhiHp / AKHI_MAX)));
}

/* floating damage number */
function floatText(x, y, txt, color) {
  const t = document.createElementNS(SVGNS, "text");
  t.setAttribute("x", x); t.setAttribute("y", y);
  t.setAttribute("fill", color); t.setAttribute("font-size", "16");
  t.setAttribute("font-weight", "700"); t.setAttribute("text-anchor", "middle");
  t.textContent = txt; $("fx").appendChild(t);
  const t0 = performance.now(), dur = 700;
  (function step(tm) {
    const k = Math.min(1, (tm - t0) / dur);
    t.setAttribute("y", y - 24 * k); t.setAttribute("opacity", 1 - k);
    if (k < 1) requestAnimationFrame(step); else t.remove();
  })(performance.now());
}

/* briefly (re)play a css class animation */
function anim(id, cls, dur) {
  const el = $(id);
  el.classList.remove(cls);
  void el.getBoundingClientRect();
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), dur);
}

/* impact spark at a point */
function spark(x, y, color, big) {
  const c = document.createElementNS(SVGNS, "circle");
  c.setAttribute("cx", x); c.setAttribute("cy", y);
  c.setAttribute("r", "2"); c.setAttribute("fill", color);
  $("fx").appendChild(c);
  const max = big ? 26 : 13, dur = big ? 320 : 220, t0 = performance.now();
  (function step(t) {
    const k = Math.min(1, (t - t0) / dur);
    c.setAttribute("r", 2 + (max - 2) * k);
    c.setAttribute("opacity", 1 - k);
    if (k < 1) requestAnimationFrame(step); else c.remove();
  })(performance.now());
}

/* fly an attack ball, then run onHit when it lands */
function ball(fromX, toX, r, color, dur, onHit) {
  const c = document.createElementNS(SVGNS, "circle");
  c.setAttribute("r", r); c.setAttribute("cy", "330");
  c.setAttribute("cx", fromX); c.setAttribute("fill", color);
  $("fx").appendChild(c);
  const t0 = performance.now();
  (function step(t) {
    const k = Math.min(1, (t - t0) / dur);
    c.setAttribute("cx", fromX + (toX - fromX) * k);
    if (k < 1) requestAnimationFrame(step);
    else { c.remove(); if (onHit) onHit(); }
  })(performance.now());
}

function smallAttack() {
  ball(120, 222, 5, "#1bb5a0", 200, () => {
    if (!fighting) return;
    spark(232, 330, "#15d6bb", false);
    anim("foe-bounce", "flinch-r", 160);
    foeHp -= TAP_DMG; paint();
    if (foeHp <= 0) victory();
  });
}

function powerAttack() {
  Sound.power();
  anim("akhi-bounce", "lunge", 160);
  ball(116, 226, 14, "#f6a93a", 300, () => {
    if (!fighting) return;
    spark(236, 330, "#ffcf5a", true);
    anim("foe-bounce", "recoil-r", 440);
    $("hit-flash").textContent = "POWER!";
    $("hit-flash").setAttribute("opacity", "1");
    setTimeout(() => $("hit-flash").setAttribute("opacity", "0"), 320);
    floatText(246, 304, "-" + POWER_DMG, "#d8741a");
    foeHp -= POWER_DMG; paint();
    if (foeHp <= 0) victory();
  });
}

function enemyPower() {
  Sound.enemyHit();
  anim("foe-bounce", "lunge-l", 180);
  ball(220, 116, 13, "#e8453f", 320, () => {
    if (!fighting) return;
    spark(108, 330, "#ff6f5a", true);
    anim("akhi-bounce", "recoil-l", 440);
    anim("scene", "shake-scene", 320);
    floatText(92, 304, "-" + Math.round(ENEMY_POWER_DMG), "#e8453f");
    akhiHp -= ENEMY_POWER_DMG; paint();
    if (akhiHp <= 0) { akhiHp = 0; paint(); lose(); }
  });
}

function enemySmallAttack() {
  ball(220, 118, 5, "#e8453f", 220, () => {
    if (!fighting) return;
    spark(110, 330, "#ff6f5a", false);
    anim("akhi-bounce", "flinch-l", 160);
    akhiHp -= ENEMY_TAP_DMG; paint();
    if (akhiHp <= 0) { akhiHp = 0; paint(); lose(); }
  });
}

function startBattle() {
  setEnemyStats();
  charge = 0; enemyCharge = 0; enemyTapTimer = 0; foeHp = enemyMaxHP; akhiHp = AKHI_MAX;
  $("fx").innerHTML = "";
  $("day-label").textContent = `Day ${dayIndex + 1}`;
  $("saved-label").textContent = `Saved Jolli: ${savedDays} ${savedDays === 1 ? "time" : "times"}`;
  $("foe-name").textContent = enemy.name;
  $("foe-rel").textContent = enemy.relation;
  $("foe").innerHTML = chibi(246, 330, enemy);
  $("bg").innerHTML = themeBG(enemy.relation);
  $("akhi-bounce").classList.remove("dance");
  $("foe-bounce").classList.remove("defeated");
  $("hit-flash").setAttribute("opacity", "0");
  paint();
  show("screen-battle");
  fighting = true;
  lastTs = performance.now();
  requestAnimationFrame(loop);
}

function loop(ts) {
  if (!fighting) return;
  const dt = Math.min(0.05, (ts - lastTs) / 1000);
  lastTs = ts;
  if (charge < 1) charge = Math.max(0, charge - DECAY * dt);
  enemyCharge += dt / ENEMY_FILL;
  if (enemyCharge >= 1) { enemyCharge = 0; enemyPower(); }
  enemyTapTimer += dt;
  if (enemyTapTimer >= ENEMY_TAP_INTERVAL) { enemyTapTimer -= ENEMY_TAP_INTERVAL; enemySmallAttack(); }
  paint();
  requestAnimationFrame(loop);
}

function tap() {
  if (!fighting) return;
  Sound.tap();
  anim("akhi-bounce", "lunge", 160);
  smallAttack();
  charge += TAP_GAIN;
  if (charge >= 0.999) { charge = 0; powerAttack(); }
  paint();
}

function victory() {
  if (!fighting) return;
  fighting = false;
  foeHp = 0; enemyCharge = 0; paint();
  $("hit-flash").setAttribute("opacity", "0");
  // enemy topples over, Akhi breaks into a dance
  $("foe-bounce").classList.add("defeated");
  $("akhi-bounce").classList.remove("lunge", "recoil-l", "flinch-l");
  $("akhi-bounce").classList.add("dance");
  // victory banner + a little confetti
  const vt = document.createElementNS(SVGNS, "text");
  vt.setAttribute("x", "170"); vt.setAttribute("y", "252"); vt.setAttribute("text-anchor", "middle");
  vt.setAttribute("fill", "#1bb5a0"); vt.setAttribute("font-size", "34"); vt.setAttribute("font-weight", "700");
  vt.setAttribute("font-family", "'Luckiest Guy','Baloo 2',cursive");
  vt.textContent = "YOU WIN!";
  $("fx").appendChild(vt);
  const cele = ["❤️", "✨", "🎉", "⭐", "💛"];
  for (let i = 0; i < 8; i++) setTimeout(() => floatText(60 + Math.random() * 70, 360, cele[i % cele.length], "#e0853a"), i * 280);
  Sound.win();
  setTimeout(finishWin, 3200); // dance for ~3s, then the win screen
}

function finishWin() {
  savedDays += 1; // every save counts now
  localStorage.setItem("sj_saved", String(savedDays));
  $("win-msg").textContent = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)];
  $("win-streak").textContent = `Saved Jolli: ${savedDays} ${savedDays === 1 ? "time" : "times"}`;
  show("screen-win");
  rainHearts();
}

function lose() {
  fighting = false;
  Sound.lose();
  show("screen-lose");
}

function rainHearts() {
  const box = $("confetti");
  box.innerHTML = "";
  const emojis = ["❤️", "✨", "🎉", "⭐", "💛", "🧡"];
  for (let i = 0; i < 18; i++) {
    const h = document.createElement("div");
    h.className = "heart";
    h.textContent = emojis[i % emojis.length];
    h.style.left = Math.random() * 100 + "%";
    h.style.bottom = "10%";
    h.style.animationDuration = 1.4 + Math.random() * 1.6 + "s";
    h.style.animationDelay = Math.random() * 0.6 + "s";
    box.appendChild(h);
  }
  setTimeout(() => (box.innerHTML = ""), 3200);
}

/* ---- reveal page: "Today you are saving Jolli from..." ---- */
function showIntro() {
  Sound.start();
  show("screen-intro");
}
function showReveal() {
  pickEnemy();
  $("reveal-card").innerHTML = '<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg"><text x="60" y="98" fill="#c9b79a" font-size="84" font-weight="700" text-anchor="middle">?</text></svg>';
  $("reveal-name").innerHTML = "&nbsp;";
  $("reveal-rel").innerHTML = "&nbsp;";
  $("btn-reveal").style.display = "";
  $("btn-fight").style.display = "none";
  show("screen-reveal");
}
function revealPerson() {
  $("reveal-card").innerHTML = `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg">${chibi(60, 52, enemy)}</svg>`;
  $("reveal-card").classList.remove("pop"); void $("reveal-card").getBoundingClientRect(); $("reveal-card").classList.add("pop");
  $("reveal-name").textContent = enemy.name;
  $("reveal-rel").textContent = enemy.relation;
  $("btn-reveal").style.display = "none";
  $("btn-fight").style.display = "";
}

/* ---- countdown page: 3, 2, 1, GO! ---- */
function startCountdown() {
  show("screen-countdown");
  const el = $("count-num");
  const seq = ["3", "2", "1", "GO!"];
  let i = 0;
  (function tick() {
    el.textContent = seq[i];
    el.classList.remove("pop"); void el.getBoundingClientRect(); el.classList.add("pop");
    i++;
    if (i < seq.length) setTimeout(tick, 650);
    else setTimeout(startBattle, 600);
  })();
}

/* ---- wire up buttons / input ---- */
$("btn-play").addEventListener("click", showIntro);
$("btn-savehim").addEventListener("click", showReveal);
$("btn-reveal").addEventListener("click", revealPerson);
$("btn-fight").addEventListener("click", startCountdown);
$("btn-retry").addEventListener("click", showReveal);
$("btn-replay-win").addEventListener("click", () => show("screen-title"));
/* "Yay!" is just celebratory text now — no click action */

const btnMute = $("btn-mute");
function paintMute() { btnMute.textContent = Sound.isMuted() ? "🔇" : "🔊"; }
paintMute();
btnMute.addEventListener("click", () => {
  const nowMuted = Sound.toggleMute();
  if (!nowMuted) Sound.start();
  paintMute();
});

const tapTarget = $("tap-target");
tapTarget.addEventListener("pointerdown", (e) => { e.preventDefault(); tap(); });
document.addEventListener("keydown", (e) => { if (e.code === "Space") { e.preventDefault(); tap(); } });
/* block any touch-drag from nudging/zooming the page */
document.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
document.addEventListener("gesturestart", (e) => e.preventDefault());
document.addEventListener("dblclick", (e) => e.preventDefault());

/* draw Jolli (husband) into his three spots */
$("jolli-title").innerHTML = jolli(100, 52, 14, true);
$("jolli-cage").innerHTML = jolli(170, 118, 15, true);
$("jolli-win").innerHTML = jolli(148, 92, 21, false);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
