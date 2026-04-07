import { MonsterItem } from './data/cases'

export function pickWeightedItem(items: MonsterItem[]): MonsterItem {
  const totalWeight = items.reduce((sum, it) => sum + it.weight, 0)
  let roll = Math.random() * totalWeight
  for (const item of items) {
    roll -= item.weight
    if (roll <= 0) return item
  }
  return items[items.length - 1]
}

export function formatMoney(amount: number): string {
  if (Number.isInteger(amount)) return '$' + amount
  return '$' + amount.toFixed(2)
}
