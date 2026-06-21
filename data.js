/* =====================================================================
   SAVE JOLLI — EDIT THIS FILE TO CHANGE THE GAME CONTENT
   ---------------------------------------------------------------------
   You can safely edit the two lists below. Keep the punctuation
   (commas, quotes, brackets) exactly as shown.

   1) PEOPLE       - the enemies. level 1 = easy ... 6 = mini-boss.
                    gender: "m" or "f"  (changes hair/dress/etc).
                    kid: true           (draws them small, like a child).
   2) WIN_MESSAGES - a sweet line shown when Akhi saves Jolli (random each win).

   NOTE: genders below are best guesses. Fix any that are wrong, and add
   `kid: true` to anyone who's a child. (?) marks ones I wasn't sure about.
   ===================================================================== */

const PEOPLE = [
  { name: "Anurag",   level: 2, relation: "friend",                 gender: "m" },
  { name: "Batta",    level: 2, relation: "friend",                 gender: "m" }, // (?)
  { name: "Veeresh",  level: 2, relation: "friend",                 gender: "m" },
  { name: "Amith",    level: 4, relation: "brother-in-law",         gender: "m" },
  { name: "Pragna",   level: 4, relation: "brother-in-law's wife",  gender: "f" },
  { name: "Janu",     level: 6, relation: "Mum",                    gender: "f" },
  { name: "Sheetal",  level: 4, relation: "sister",                 gender: "f" },
  { name: "Aditya",   level: 2, relation: "sister's husband",       gender: "m" },
  { name: "Sreedhar", level: 6, relation: "father-in-law",          gender: "m" },
  { name: "Chaya",    level: 4, relation: "mother-in-law",          gender: "f" },
  { name: "Prajju",   level: 2, relation: "friend",                 gender: "m" }, // (?)
  { name: "Priyanka", level: 2, relation: "friend",                 gender: "f" },
  { name: "Spurthi",  level: 2, relation: "friend",                 gender: "f" },
  { name: "Saif",     level: 2, relation: "friend",                 gender: "m" },
  { name: "Muzamil",  level: 2, relation: "friend",                 gender: "m" },
  { name: "GR",       level: 2, relation: "friend",                 gender: "m" }, // (?)
  { name: "Sachi",    level: 2, relation: "friend",                 gender: "m" },
  { name: "Benny",    level: 1, relation: "cousin's baby",          gender: "m", kid: true },
  { name: "Vinks",    level: 2, relation: "friend",                 gender: "m" },
  { name: "Prathima", level: 2, relation: "friend",                 gender: "f" },
  { name: "Samarth",  level: 2, relation: "friend",                 gender: "m" },
  { name: "Emma",     level: 3, relation: "colleague",              gender: "f" },
  { name: "Paul",     level: 3, relation: "colleague",              gender: "m" },
  { name: "Cat",      level: 3, relation: "colleague",              gender: "f" },
  { name: "Sneha",    level: 2, relation: "friend",                 gender: "f" },
  { name: "Gnani",    level: 2, relation: "friend",                 gender: "f" },
  { name: "Indu",     level: 2, relation: "friend",                 gender: "f" },
  { name: "Krati",    level: 2, relation: "friend",                 gender: "f" },
  { name: "Shreya",   level: 2, relation: "cousin",                 gender: "f" },
  { name: "Shamu",    level: 2, relation: "cousin",                 gender: "m" }, // (?)
  { name: "Vani",     level: 2, relation: "aunty",                  gender: "f" },
  { name: "Raju",     level: 2, relation: "uncle",                  gender: "m" },
  { name: "Reddy",    level: 2, relation: "uncle",                  gender: "m" },
  { name: "Paddu",    level: 2, relation: "cousin",                 gender: "f" }, // (?)
  { name: "Vasvi",    level: 2, relation: "cousin",                 gender: "f" },
  { name: "Pooja",    level: 2, relation: "cousin",                 gender: "f" },
];

const WIN_MESSAGES = [
  "You saved Jolli! He's all yours again.",
  "Jolli's free — and completely yours. I love you, Akhi.",
  "Rescued! Jolli says you're his favourite person, always.",
  "You did it! Jolli's safe in your arms again.",
  "Saved again! Jolli's the luckiest husband alive.",
  "Freed! Jolli loves you more with every rescue.",
];
