export interface Rarity {
  name: string
  color: string
  tier: number
  glow: string
}

export interface MonsterItem {
  name: string
  img: string
  rarity: Rarity
  weight: number
  sellMin: number
  sellMax: number
}

export interface MonsterCase {
  name: string
  shortName: string
  accent: string
  accentDark: string
  price: number
  risk: 'safe' | 'low' | 'medium' | 'high' | 'extreme'
  description: string
  items: MonsterItem[]
}

export const RARITY: Record<string, Rarity> = {
  MILSPEC:    { name: 'Mil-Spec',         color: '#4b69ff', tier: 1, glow: 'rgba(75,105,255,0.4)' },
  RESTRICTED: { name: 'Restricted',       color: '#8847ff', tier: 2, glow: 'rgba(136,71,255,0.4)' },
  CLASSIFIED: { name: 'Classified',       color: '#d32ce6', tier: 3, glow: 'rgba(211,44,230,0.4)' },
  COVERT:     { name: 'Covert',           color: '#eb4b4b', tier: 4, glow: 'rgba(235,75,75,0.5)' },
  SPECIAL:    { name: 'Exceedingly Rare', color: '#ffd700', tier: 5, glow: 'rgba(255,215,0,0.5)' },
}

/** Deterministic sell value for an item based on its name */
export function getItemSellValue(item: MonsterItem): number {
  let hash = 0
  for (let i = 0; i < item.name.length; i++) {
    hash = ((hash << 5) - hash + item.name.charCodeAt(i)) | 0
  }
  const t = (Math.abs(hash) % 1000) / 1000
  const { sellMin, sellMax } = item
  return Math.round(sellMin + t * (sellMax - sellMin))
}

/*
 * Economics (calculated expected values):
 *
 *   SAFE   $2  → EV $2.08  (~104% return, basically break-even grind)
 *   LOW    $5  → EV $4.26  ( ~85% return, lose ~$0.75/spin)
 *   MEDIUM $10 → EV $6.99  ( ~70% return, lose ~$3/spin)
 *   HIGH   $25 → EV $15.01 ( ~60% return, lose ~$10/spin)
 *   EXTREME $50→ EV $25.59 ( ~51% return, lose ~$25/spin)
 *
 * Rarity drop rates roughly follow CS:GO's 5x-per-tier structure,
 * adjusted per case so riskier cases have heavier common weights.
 * Commons always return 25-50% of case cost so no pull feels worthless.
 */

export const CASES: Record<string, MonsterCase> = {
  /* ─────────────────────────────────────────────
   * SAFE — $2 — EV $2.08 — ~104% return
   * You can grind this forever and roughly break even.
   * 75% common, 15% restricted, 7% classified, 3% special.
   * ───────────────────────────────────────────── */
  rehab: {
    name: 'Monster Rehab',
    shortName: 'Rehab',
    accent: '#e8d44d',
    accentDark: '#4d4518',
    price: 2,
    risk: 'safe',
    description: 'Steady sips. Barely any risk, grind all day.',
    items: [
      { name: 'Tea + Lemonade',      img: '/monster/rehab/tea+lemonade.webp',       rarity: RARITY.MILSPEC,    weight: 40, sellMin: 1, sellMax: 2 },
      { name: 'Green Tea',           img: '/monster/rehab/greentea.webp',           rarity: RARITY.MILSPEC,    weight: 35, sellMin: 1, sellMax: 2 },
      { name: 'Peach Tea',           img: '/monster/rehab/peachtea.webp',           rarity: RARITY.RESTRICTED, weight: 15, sellMin: 2, sellMax: 3 },
      { name: 'Strawberry Lemonade', img: '/monster/rehab/strawberrylemonade.webp', rarity: RARITY.CLASSIFIED, weight: 7,  sellMin: 3, sellMax: 5 },
      { name: 'Wild Berry Tea',      img: '/monster/rehab/wildberrytea.webp',       rarity: RARITY.SPECIAL,    weight: 3,  sellMin: 8, sellMax: 12 },
    ]
  },

  /* ─────────────────────────────────────────────
   * LOW — $5 — EV $4.26 — ~85% return
   * Lose about $0.75 per spin. Restricted hits (~27%)
   * return 60-100% of cost, so 1 in 4 spins feels decent.
   * ───────────────────────────────────────────── */
  original: {
    name: 'Monster Original',
    shortName: 'Original',
    accent: '#4eff00',
    accentDark: '#1a5200',
    price: 5,
    risk: 'low',
    description: 'The OG. Small losses, occasional profit.',
    items: [
      { name: 'Original Green',              img: '/monster/original/originalgreen.webp',            rarity: RARITY.MILSPEC,    weight: 30, sellMin: 1, sellMax: 2 },
      { name: 'Lo-Carb',                     img: '/monster/original/locarb.webp',                   rarity: RARITY.MILSPEC,    weight: 28, sellMin: 1, sellMax: 2 },
      { name: 'Zero Sugar',                  img: '/monster/original/zerosugar.webp',                rarity: RARITY.MILSPEC,    weight: 28, sellMin: 1, sellMax: 2 },
      { name: 'Electric Blue',               img: '/monster/original/electricblue.webp',             rarity: RARITY.RESTRICTED, weight: 14, sellMin: 3, sellMax: 5 },
      { name: 'Zero Sugar Strawberry Shot',  img: '/monster/original/zerosugarstrawberryshot.webp',  rarity: RARITY.RESTRICTED, weight: 12, sellMin: 3, sellMax: 5 },
      { name: 'Strawberry Shot',             img: '/monster/original/strawberryshot.webp',           rarity: RARITY.RESTRICTED, weight: 12, sellMin: 3, sellMax: 6 },
      { name: 'Nitro Super Dry',             img: '/monster/original/nitrosuperdry.webp',            rarity: RARITY.CLASSIFIED, weight: 6,  sellMin: 8, sellMax: 12 },
      { name: 'Orange Dreamsicle',           img: '/monster/original/orangledreamsicle.webp',        rarity: RARITY.CLASSIFIED, weight: 6,  sellMin: 8, sellMax: 12 },
      { name: 'Lando Norris',                img: '/monster/original/landonorris.webp',              rarity: RARITY.COVERT,     weight: 2,  sellMin: 15, sellMax: 25 },
      { name: 'Super Premium Import',        img: '/monster/original/superpremiumimport.webp',       rarity: RARITY.COVERT,     weight: 2,  sellMin: 15, sellMax: 30 },
      { name: 'Reserve Peaches & Cream',     img: '/monster/original/reservepeachesandcream.webp',   rarity: RARITY.SPECIAL,    weight: 1,  sellMin: 40, sellMax: 60 },
      { name: 'Reserve Orange Dreamsicle',   img: '/monster/original/reserveorangedreamsicle.webp',  rarity: RARITY.SPECIAL,    weight: 1,  sellMin: 50, sellMax: 75 },
    ]
  },

  /* ─────────────────────────────────────────────
   * MEDIUM — $10 — EV $6.99 — ~70% return
   * Lose about $3 per spin. Restricted hits (~27%)
   * return 40-70% of cost. Classified+ is profit.
   * ───────────────────────────────────────────── */
  ultra: {
    name: 'Monster Ultra',
    shortName: 'Ultra',
    accent: '#00d4ff',
    accentDark: '#003d4d',
    price: 10,
    risk: 'medium',
    description: 'Balanced stakes. Losses add up, wins feel real.',
    items: [
      { name: 'Ultra White',                 img: '/monster/ultra/white.webp',              rarity: RARITY.MILSPEC,    weight: 25, sellMin: 1, sellMax: 3 },
      { name: 'Ultra Blue',                  img: '/monster/ultra/blue.webp',               rarity: RARITY.MILSPEC,    weight: 25, sellMin: 1, sellMax: 3 },
      { name: 'Ultra Red',                   img: '/monster/ultra/red.webp',                rarity: RARITY.MILSPEC,    weight: 22, sellMin: 1, sellMax: 3 },
      { name: 'Ultra Black',                 img: '/monster/ultra/black.webp',              rarity: RARITY.MILSPEC,    weight: 22, sellMin: 1, sellMax: 3 },
      { name: 'Ultra Sunrise',               img: '/monster/ultra/sunrise.webp',            rarity: RARITY.RESTRICTED, weight: 12, sellMin: 4, sellMax: 7 },
      { name: 'Ultra Violet',                img: '/monster/ultra/violet.webp',             rarity: RARITY.RESTRICTED, weight: 12, sellMin: 4, sellMax: 7 },
      { name: 'Ultra Rosa',                  img: '/monster/ultra/rosa.webp',               rarity: RARITY.RESTRICTED, weight: 10, sellMin: 4, sellMax: 7 },
      { name: 'Ultra Watermelon',            img: '/monster/ultra/watermelon.webp',         rarity: RARITY.RESTRICTED, weight: 10, sellMin: 4, sellMax: 7 },
      { name: 'Ultra Paradise',              img: '/monster/ultra/paradise.webp',           rarity: RARITY.CLASSIFIED, weight: 5,  sellMin: 10, sellMax: 18 },
      { name: 'Ultra Peachy Keen',           img: '/monster/ultra/peachykeen.webp',         rarity: RARITY.CLASSIFIED, weight: 5,  sellMin: 10, sellMax: 18 },
      { name: 'Ultra Fiesta Mango',          img: '/monster/ultra/fiestamango.webp',        rarity: RARITY.CLASSIFIED, weight: 4,  sellMin: 10, sellMax: 18 },
      { name: 'Ultra Strawberry Dreams',     img: '/monster/ultra/strawberrydreams.webp',   rarity: RARITY.CLASSIFIED, weight: 4,  sellMin: 10, sellMax: 18 },
      { name: 'Ultra Blue Haiwan',           img: '/monster/ultra/bluehaiwan.webp',         rarity: RARITY.COVERT,     weight: 2,  sellMin: 25, sellMax: 45 },
      { name: 'Ultra Vice Guava',            img: '/monster/ultra/viceguava.webp',          rarity: RARITY.COVERT,     weight: 2,  sellMin: 25, sellMax: 45 },
      { name: 'Ultra Punk Punch',            img: '/monster/ultra/punkpunch.webp',          rarity: RARITY.COVERT,     weight: 1,  sellMin: 25, sellMax: 45 },
      { name: 'Ultra Wild Passion',          img: '/monster/ultra/wildpassion.webp',        rarity: RARITY.COVERT,     weight: 1,  sellMin: 25, sellMax: 45 },
      { name: 'Ultra Fantasy Ruby Red',      img: '/monster/ultra/fantasyrubyred.webp',     rarity: RARITY.SPECIAL,    weight: 1,  sellMin: 80, sellMax: 175 },
      { name: 'Ultra Red White & Blue Razz', img: '/monster/ultra/redwhitebluerazz.webp',  rarity: RARITY.SPECIAL,    weight: 1,  sellMin: 100, sellMax: 200 },
    ]
  },

  /* ─────────────────────────────────────────────
   * HIGH — $25 — EV $15.01 — ~60% return
   * Most spins hurt (~$10 loss). But Restricted
   * returns $12-22 (48-88%), and Classified+ is profit.
   * Special pays $300-750 on a $25 bet.
   * ───────────────────────────────────────────── */
  juice: {
    name: 'Monster Juice',
    shortName: 'Juice',
    accent: '#ff6b35',
    accentDark: '#4d1f10',
    price: 25,
    risk: 'high',
    description: 'Most pulls sting. The wins make up for it.',
    items: [
      { name: 'Pipeline Punch',        img: '/monster/juice/pipelinepunch.webp',       rarity: RARITY.MILSPEC,    weight: 35, sellMin: 3, sellMax: 8 },
      { name: 'Mango Loco',            img: '/monster/juice/mangoloco.webp',           rarity: RARITY.MILSPEC,    weight: 32, sellMin: 3, sellMax: 8 },
      { name: 'Pacific Punch',         img: '/monster/juice/pacificpunch.webp',        rarity: RARITY.MILSPEC,    weight: 32, sellMin: 3, sellMax: 8 },
      { name: 'Bad Apple',             img: '/monster/juice/badapple.webp',            rarity: RARITY.RESTRICTED, weight: 12, sellMin: 12, sellMax: 22 },
      { name: 'Aussie Style Lemonade', img: '/monster/juice/aussiestylelemonade.webp', rarity: RARITY.RESTRICTED, weight: 10, sellMin: 12, sellMax: 22 },
      { name: 'Khaotic',               img: '/monster/juice/khaotic.webp',             rarity: RARITY.CLASSIFIED, weight: 4,  sellMin: 30, sellMax: 55 },
      { name: 'Rio Punch',             img: '/monster/juice/riopunch.webp',            rarity: RARITY.CLASSIFIED, weight: 3,  sellMin: 30, sellMax: 55 },
      { name: 'Viking Berry',          img: '/monster/juice/vikingberry.webp',         rarity: RARITY.COVERT,     weight: 2,  sellMin: 75, sellMax: 150 },
      { name: 'Voodoo Grape',          img: '/monster/juice/voodogrape.webp',          rarity: RARITY.SPECIAL,    weight: 1,  sellMin: 300, sellMax: 750 },
    ]
  },

  /* ─────────────────────────────────────────────
   * EXTREME — $50 — EV $25.59 — ~51% return
   * 76% of pulls are Mil-Spec ($5-12 back on $50).
   * Restricted (~18%) returns $18-30 — still a loss.
   * Classified+ is where profit starts. Special
   * pays $500-1500 — a 10x-30x jackpot.
   * ───────────────────────────────────────────── */
  cafe: {
    name: 'Monster Cafe',
    shortName: 'Cafe',
    accent: '#c47f17',
    accentDark: '#3d2807',
    price: 50,
    risk: 'extreme',
    description: 'High roller. Most opens hurt. Jackpots are legendary.',
    items: [
      { name: 'Killer Brew Mean Bean',   img: '/monster/cafe/killerbrew-meanbean.webp',          rarity: RARITY.MILSPEC,    weight: 40, sellMin: 5,   sellMax: 12 },
      { name: 'Killer Brew Loca Moca',   img: '/monster/cafe/killerbrew-locamoca.webp',          rarity: RARITY.MILSPEC,    weight: 38, sellMin: 5,   sellMax: 12 },
      { name: 'Java Mean Bean',          img: '/monster/cafe/java-meanbean.webp',                rarity: RARITY.RESTRICTED, weight: 10, sellMin: 18,  sellMax: 30 },
      { name: 'Java Cafe Latte',         img: '/monster/cafe/java-cafelatte.webp',               rarity: RARITY.RESTRICTED, weight: 8,  sellMin: 18,  sellMax: 30 },
      { name: 'Java Irish Cream',        img: '/monster/cafe/java-irishcream.webp',              rarity: RARITY.CLASSIFIED, weight: 3,  sellMin: 40,  sellMax: 70 },
      { name: 'Java 300 Mocha',          img: '/monster/cafe/javamonster300-mocha.webp',         rarity: RARITY.COVERT,     weight: 2,  sellMin: 100, sellMax: 250 },
      { name: 'Java 300 French Vanilla', img: '/monster/cafe/javamonster300-frenchvanilla.webp', rarity: RARITY.SPECIAL,    weight: 1,  sellMin: 500, sellMax: 1500 },
    ]
  },
}
