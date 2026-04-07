import { useState, useCallback, useEffect, useRef } from 'react'
import { MonsterItem, getItemSellValue } from '../data/cases'

const STORAGE_KEY = 'monster-spinner-state'
const STARTING_BALANCE = 150

export interface InventoryEntry {
  item: MonsterItem
  count: number
  sellValue: number
}

export interface GameStats {
  totalOpened: number
  totalSpent: number
  totalEarned: number
  casesOpenedByType: Record<string, number>
  bestPull: { name: string; color: string; tier: number; sellValue: number } | null
  rarityHistory: Record<string, number>
}

interface GameState {
  balance: number
  inventory: Record<string, InventoryEntry>
  stats: GameStats
}

function getDefaultState(): GameState {
  return {
    balance: STARTING_BALANCE,
    inventory: {},
    stats: {
      totalOpened: 0,
      totalSpent: 0,
      totalEarned: 0,
      casesOpenedByType: {},
      bestPull: null,
      rarityHistory: {},
    }
  }
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultState()
    const parsed = JSON.parse(raw)
    return { ...getDefaultState(), ...parsed }
  } catch {
    return getDefaultState()
  }
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState)
  const stateRef = useRef(state)
  stateRef.current = state

  // Persist on change
  useEffect(() => {
    saveState(state)
  }, [state])

  const canAfford = useCallback((price: number) => {
    return stateRef.current.balance >= price
  }, [])

  const spendMoney = useCallback((price: number, caseKey: string, count = 1) => {
    setState(prev => ({
      ...prev,
      balance: Math.round((prev.balance - price) * 100) / 100,
      stats: {
        ...prev.stats,
        totalSpent: Math.round((prev.stats.totalSpent + price) * 100) / 100,
        casesOpenedByType: {
          ...prev.stats.casesOpenedByType,
          [caseKey]: (prev.stats.casesOpenedByType[caseKey] || 0) + count,
        },
      }
    }))
  }, [])

  const addItem = useCallback((item: MonsterItem) => {
    const sellValue = getItemSellValue(item)
    setState(prev => {
      const key = item.img
      const existing = prev.inventory[key]
      const newBest = (!prev.stats.bestPull || item.rarity.tier > prev.stats.bestPull.tier ||
        (item.rarity.tier === prev.stats.bestPull.tier && sellValue > prev.stats.bestPull.sellValue))
        ? { name: item.name, color: item.rarity.color, tier: item.rarity.tier, sellValue }
        : prev.stats.bestPull

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [key]: existing
            ? { ...existing, count: existing.count + 1 }
            : { item, count: 1, sellValue }
        },
        stats: {
          ...prev.stats,
          totalOpened: prev.stats.totalOpened + 1,
          bestPull: newBest,
          rarityHistory: {
            ...prev.stats.rarityHistory,
            [item.rarity.name]: (prev.stats.rarityHistory[item.rarity.name] || 0) + 1,
          }
        }
      }
    })
  }, [])

  const sellItem = useCallback((itemImg: string, count = 1) => {
    setState(prev => {
      const entry = prev.inventory[itemImg]
      if (!entry || entry.count < count) return prev

      const earning = entry.sellValue * count
      const newCount = entry.count - count
      const newInventory = { ...prev.inventory }
      if (newCount <= 0) {
        delete newInventory[itemImg]
      } else {
        newInventory[itemImg] = { ...entry, count: newCount }
      }

      return {
        ...prev,
        balance: Math.round((prev.balance + earning) * 100) / 100,
        inventory: newInventory,
        stats: {
          ...prev.stats,
          totalEarned: Math.round((prev.stats.totalEarned + earning) * 100) / 100,
        }
      }
    })
  }, [])

  const sellAll = useCallback(() => {
    setState(prev => {
      let totalEarning = 0
      for (const entry of Object.values(prev.inventory)) {
        totalEarning += entry.sellValue * entry.count
      }
      totalEarning = Math.round(totalEarning * 100) / 100

      return {
        ...prev,
        balance: Math.round((prev.balance + totalEarning) * 100) / 100,
        inventory: {},
        stats: {
          ...prev.stats,
          totalEarned: Math.round((prev.stats.totalEarned + totalEarning) * 100) / 100,
        }
      }
    })
  }, [])

  const resetGame = useCallback(() => {
    const fresh = getDefaultState()
    setState(fresh)
    saveState(fresh)
  }, [])

  const inventoryValue = Object.values(state.inventory).reduce(
    (sum, e) => sum + e.sellValue * e.count, 0
  )

  const netProfit = Math.round(
    (state.balance + inventoryValue - STARTING_BALANCE) * 100
  ) / 100

  return {
    balance: state.balance,
    inventory: state.inventory,
    stats: state.stats,
    inventoryValue: Math.round(inventoryValue * 100) / 100,
    netProfit,
    canAfford,
    spendMoney,
    addItem,
    sellItem,
    sellAll,
    resetGame,
    startingBalance: STARTING_BALANCE,
  }
}
