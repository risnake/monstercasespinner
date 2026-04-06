import { motion, AnimatePresence } from 'motion/react'
import { RARITY } from '../data/cases'
import { InventoryEntry } from '../hooks/useGameState'
import { formatMoney } from '../utils'
import { useState } from 'react'
import { initAudio, playSellSound } from '../audio'

interface Props {
  inventory: Record<string, InventoryEntry>
  inventoryValue: number
  onSellItem: (img: string, count?: number) => void
  onSellAll: () => void
}

export function InventoryPage({ inventory, inventoryValue, onSellItem, onSellAll }: Props) {
  const [filter, setFilter] = useState<number | null>(null)
  const [confirmSellAll, setConfirmSellAll] = useState(false)

  const entries = Object.entries(inventory)
    .map(([key, entry]) => ({ key, ...entry }))
    .filter(e => filter === null || e.item.rarity.tier === filter)
    .sort((a, b) => b.item.rarity.tier - a.item.rarity.tier || b.sellValue - a.sellValue)

  const totalItems = Object.values(inventory).reduce((s, e) => s + e.count, 0)

  const handleSellOne = (key: string) => {
    initAudio()
    playSellSound()
    onSellItem(key, 1)
  }

  const handleSellAll = () => {
    if (!confirmSellAll) {
      setConfirmSellAll(true)
      setTimeout(() => setConfirmSellAll(false), 3000)
      return
    }
    initAudio()
    playSellSound()
    onSellAll()
    setConfirmSellAll(false)
  }

  return (
    <div className="inventory-page">
      <div className="inv-header">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          YOUR INVENTORY
        </motion.h2>

        <div className="inv-summary">
          <div className="inv-summary-item">
            <span className="inv-sum-label">ITEMS</span>
            <span className="inv-sum-val">{totalItems}</span>
          </div>
          <div className="inv-summary-item">
            <span className="inv-sum-label">VALUE</span>
            <span className="inv-sum-val green">{formatMoney(inventoryValue)}</span>
          </div>
          <motion.button
            className={`sell-all-btn ${confirmSellAll ? 'confirm' : ''}`}
            onClick={handleSellAll}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={totalItems === 0}
          >
            {confirmSellAll ? `CONFIRM SELL ALL — ${formatMoney(inventoryValue)}` : 'SELL ALL'}
          </motion.button>
        </div>

        {/* Rarity filters */}
        <div className="inv-filters">
          <button
            className={`inv-filter ${filter === null ? 'active' : ''}`}
            onClick={() => setFilter(null)}
          >
            ALL
          </button>
          {Object.values(RARITY).reverse().map(r => {
            const count = Object.values(inventory).filter(e => e.item.rarity.tier === r.tier).reduce((s, e) => s + e.count, 0)
            if (count === 0) return null
            return (
              <button
                key={r.tier}
                className={`inv-filter ${filter === r.tier ? 'active' : ''}`}
                style={{ '--filter-color': r.color } as React.CSSProperties}
                onClick={() => setFilter(filter === r.tier ? null : r.tier)}
              >
                {r.name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      <div className="inv-grid">
        <AnimatePresence mode="popLayout">
          {entries.length === 0 ? (
            <motion.div
              className="inv-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {totalItems === 0 ? 'Open cases to start collecting!' : 'No items match this filter.'}
            </motion.div>
          ) : (
            entries.map(({ key, item, count, sellValue }) => (
              <motion.div
                key={key}
                className="inv-card"
                style={{ '--item-color': item.rarity.color } as React.CSSProperties}
                layout
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                {count > 1 && <div className="inv-badge">x{count}</div>}
                <img src={item.img} alt={item.name} />
                <div className="inv-card-name">{item.name}</div>
                <div className="inv-card-rarity">{item.rarity.name}</div>
                <div className="inv-card-value">{formatMoney(sellValue)}</div>
                <motion.button
                  className="inv-sell-btn"
                  onClick={() => handleSellOne(key)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  SELL
                </motion.button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
