import { MonsterItem } from './data/cases'

export function pickWeightedItem(items: MonsterItem[]): MonsterItem {
  const totalWeight = items.reduce((sum, it) => sum + it.rarity.weight, 0)
  let roll = Math.random() * totalWeight
  for (const item of items) {
    roll -= item.rarity.weight
    if (roll <= 0) return item
  }
  return items[items.length - 1]
}

export function formatMoney(amount: number): string {
  return '$' + amount.toFixed(2)
}
