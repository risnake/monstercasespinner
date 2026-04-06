export interface Rarity {
  name: string
  color: string
  weight: number
  tier: number
  glow: string
  sellMin: number
  sellMax: number
}

export interface MonsterItem {
  name: string
  img: string
  rarity: Rarity
}

export interface MonsterCase {
  name: string
  shortName: string
  icon: string
  accent: string
  accentDark: string
  price: number
  description: string
  items: MonsterItem[]
}

export const RARITY: Record<string, Rarity> = {
  MILSPEC:    { name: 'Mil-Spec',           color: '#4b69ff', weight: 55, tier: 1, glow: 'rgba(75,105,255,0.4)',  sellMin: 0.25, sellMax: 0.75 },
  RESTRICTED: { name: 'Restricted',         color: '#8847ff', weight: 25, tier: 2, glow: 'rgba(136,71,255,0.4)', sellMin: 0.80, sellMax: 2.50 },
  CLASSIFIED: { name: 'Classified',         color: '#d32ce6', weight: 12, tier: 3, glow: 'rgba(211,44,230,0.4)', sellMin: 3.00, sellMax: 8.00 },
  COVERT:     { name: 'Covert',             color: '#eb4b4b', weight: 5,  tier: 4, glow: 'rgba(235,75,75,0.5)',  sellMin: 10.00, sellMax: 25.00 },
  SPECIAL:    { name: '★ Exceedingly Rare', color: '#ffd700', weight: 3,  tier: 5, glow: 'rgba(255,215,0,0.5)',  sellMin: 30.00, sellMax: 75.00 },
}

/** Deterministic sell value for an item based on its name */
export function getItemSellValue(item: MonsterItem): number {
  let hash = 0
  for (let i = 0; i < item.name.length; i++) {
    hash = ((hash << 5) - hash + item.name.charCodeAt(i)) | 0
  }
  const t = (Math.abs(hash) % 1000) / 1000
  const { sellMin, sellMax } = item.rarity
  return Math.round((sellMin + t * (sellMax - sellMin)) * 100) / 100
}

export const CASES: Record<string, MonsterCase> = {
  original: {
    name: 'Monster Original',
    shortName: 'Original',
    icon: '⚡',
    accent: '#4eff00',
    accentDark: '#1a5200',
    price: 2.49,
    description: 'The OG lineup. Classic green energy and beyond.',
    items: [
      { name: 'Original Green',              img: '/monster/original/originalgreen.webp',            rarity: RARITY.MILSPEC },
      { name: 'Lo-Carb',                     img: '/monster/original/locarb.webp',                   rarity: RARITY.MILSPEC },
      { name: 'Zero Sugar',                  img: '/monster/original/zerosugar.webp',                rarity: RARITY.MILSPEC },
      { name: 'Electric Blue',               img: '/monster/original/electricblue.webp',             rarity: RARITY.RESTRICTED },
      { name: 'Zero Sugar Strawberry Shot',  img: '/monster/original/zerosugarstrawberryshot.webp',  rarity: RARITY.RESTRICTED },
      { name: 'Strawberry Shot',             img: '/monster/original/strawberryshot.webp',           rarity: RARITY.RESTRICTED },
      { name: 'Nitro Super Dry',             img: '/monster/original/nitrosuperdry.webp',            rarity: RARITY.CLASSIFIED },
      { name: 'Orange Dreamsicle',           img: '/monster/original/orangledreamsicle.webp',        rarity: RARITY.CLASSIFIED },
      { name: 'Lando Norris',                img: '/monster/original/landonorris.webp',              rarity: RARITY.COVERT },
      { name: 'Super Premium Import',        img: '/monster/original/superpremiumimport.webp',       rarity: RARITY.COVERT },
      { name: 'Reserve Peaches & Cream',     img: '/monster/original/reservepeachesandcream.webp',   rarity: RARITY.SPECIAL },
      { name: 'Reserve Orange Dreamsicle',   img: '/monster/original/reserveorangedreamsicle.webp',  rarity: RARITY.SPECIAL },
    ]
  },
  ultra: {
    name: 'Monster Ultra',
    shortName: 'Ultra',
    icon: '❄️',
    accent: '#00d4ff',
    accentDark: '#003d4d',
    price: 2.49,
    description: 'Zero sugar, full flavor. The clean energy collection.',
    items: [
      { name: 'Ultra White',                img: '/monster/ultra/white.webp',              rarity: RARITY.MILSPEC },
      { name: 'Ultra Blue',                 img: '/monster/ultra/blue.webp',               rarity: RARITY.MILSPEC },
      { name: 'Ultra Red',                  img: '/monster/ultra/red.webp',                rarity: RARITY.MILSPEC },
      { name: 'Ultra Black',                img: '/monster/ultra/black.webp',              rarity: RARITY.MILSPEC },
      { name: 'Ultra Sunrise',              img: '/monster/ultra/sunrise.webp',            rarity: RARITY.RESTRICTED },
      { name: 'Ultra Violet',               img: '/monster/ultra/violet.webp',             rarity: RARITY.RESTRICTED },
      { name: 'Ultra Rosa',                 img: '/monster/ultra/rosa.webp',               rarity: RARITY.RESTRICTED },
      { name: 'Ultra Watermelon',           img: '/monster/ultra/watermelon.webp',         rarity: RARITY.RESTRICTED },
      { name: 'Ultra Paradise',             img: '/monster/ultra/paradise.webp',           rarity: RARITY.CLASSIFIED },
      { name: 'Ultra Peachy Keen',          img: '/monster/ultra/peachykeen.webp',         rarity: RARITY.CLASSIFIED },
      { name: 'Ultra Fiesta Mango',         img: '/monster/ultra/fiestamango.webp',        rarity: RARITY.CLASSIFIED },
      { name: 'Ultra Strawberry Dreams',    img: '/monster/ultra/strawberrydreams.webp',   rarity: RARITY.CLASSIFIED },
      { name: 'Ultra Blue Haiwan',          img: '/monster/ultra/bluehaiwan.webp',         rarity: RARITY.COVERT },
      { name: 'Ultra Vice Guava',           img: '/monster/ultra/viceguava.webp',          rarity: RARITY.COVERT },
      { name: 'Ultra Punk Punch',           img: '/monster/ultra/punkpunch.webp',          rarity: RARITY.COVERT },
      { name: 'Ultra Wild Passion',         img: '/monster/ultra/wildpassion.webp',        rarity: RARITY.COVERT },
      { name: 'Ultra Fantasy Ruby Red',     img: '/monster/ultra/fantasyrubyred.webp',     rarity: RARITY.SPECIAL },
      { name: 'Ultra Red White & Blue Razz',img: '/monster/ultra/redwhitebluerazz.webp',  rarity: RARITY.SPECIAL },
    ]
  },
  juice: {
    name: 'Monster Juice',
    shortName: 'Juice',
    icon: '🍊',
    accent: '#ff6b35',
    accentDark: '#4d1f10',
    price: 2.99,
    description: 'Real juice meets Monster energy. Tropical chaos.',
    items: [
      { name: 'Pipeline Punch',             img: '/monster/juice/pipelinepunch.webp',       rarity: RARITY.MILSPEC },
      { name: 'Mango Loco',                 img: '/monster/juice/mangoloco.webp',           rarity: RARITY.MILSPEC },
      { name: 'Pacific Punch',              img: '/monster/juice/pacificpunch.webp',        rarity: RARITY.MILSPEC },
      { name: 'Bad Apple',                  img: '/monster/juice/badapple.webp',            rarity: RARITY.RESTRICTED },
      { name: 'Aussie Style Lemonade',      img: '/monster/juice/aussiestylelemonade.webp', rarity: RARITY.RESTRICTED },
      { name: 'Khaotic',                    img: '/monster/juice/khaotic.webp',             rarity: RARITY.CLASSIFIED },
      { name: 'Rio Punch',                  img: '/monster/juice/riopunch.webp',            rarity: RARITY.CLASSIFIED },
      { name: 'Viking Berry',               img: '/monster/juice/vikingberry.webp',         rarity: RARITY.COVERT },
      { name: 'Voodoo Grape',               img: '/monster/juice/voodogrape.webp',          rarity: RARITY.SPECIAL },
    ]
  },
  cafe: {
    name: 'Monster Café',
    shortName: 'Café',
    icon: '☕',
    accent: '#c47f17',
    accentDark: '#3d2807',
    price: 3.49,
    description: 'Premium coffee blends with a Monster kick.',
    items: [
      { name: 'Killer Brew Mean Bean',       img: '/monster/cafe/killerbrew-meanbean.webp',          rarity: RARITY.MILSPEC },
      { name: 'Killer Brew Loca Moca',       img: '/monster/cafe/killerbrew-locamoca.webp',          rarity: RARITY.MILSPEC },
      { name: 'Java Mean Bean',              img: '/monster/cafe/java-meanbean.webp',                rarity: RARITY.RESTRICTED },
      { name: 'Java Café Latte',             img: '/monster/cafe/java-cafelatte.webp',               rarity: RARITY.RESTRICTED },
      { name: 'Java Irish Cream',            img: '/monster/cafe/java-irishcream.webp',              rarity: RARITY.CLASSIFIED },
      { name: 'Java 300 Mocha',              img: '/monster/cafe/javamonster300-mocha.webp',         rarity: RARITY.COVERT },
      { name: 'Java 300 French Vanilla',     img: '/monster/cafe/javamonster300-frenchvanilla.webp', rarity: RARITY.SPECIAL },
    ]
  },
  rehab: {
    name: 'Monster Rehab',
    shortName: 'Rehab',
    icon: '🍵',
    accent: '#e8d44d',
    accentDark: '#4d4518',
    price: 2.49,
    description: 'Tea-based recovery with electrolytes.',
    items: [
      { name: 'Tea + Lemonade',              img: '/monster/rehab/tea+lemonade.webp',         rarity: RARITY.MILSPEC },
      { name: 'Green Tea',                   img: '/monster/rehab/greentea.webp',             rarity: RARITY.MILSPEC },
      { name: 'Peach Tea',                   img: '/monster/rehab/peachtea.webp',             rarity: RARITY.RESTRICTED },
      { name: 'Strawberry Lemonade',         img: '/monster/rehab/strawberrylemonade.webp',   rarity: RARITY.CLASSIFIED },
      { name: 'Wild Berry Tea',              img: '/monster/rehab/wildberrytea.webp',         rarity: RARITY.SPECIAL },
    ]
  }
}
