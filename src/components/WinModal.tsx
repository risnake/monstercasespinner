import { motion, AnimatePresence } from 'motion/react'
import { MonsterItem, getItemSellValue } from '../data/cases'
import { formatMoney } from '../utils'

interface Props {
  items: MonsterItem[]
  caseName: string
  onClose: () => void
}

export function WinModal({ items, caseName, onClose }: Props) {
  if (items.length === 0) return null

  const totalValue = items.reduce((sum, it) => sum + getItemSellValue(it), 0)
  const best = items.reduce((a, b) => b.rarity.tier > a.rarity.tier ? b : a)
  const single = items.length === 1

  return (
    <AnimatePresence>
      <motion.div
        className="win-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          className={`win-card ${single ? '' : 'win-card-multi'}`}
          style={{ '--win-color': best.rarity.color } as React.CSSProperties}
          initial={{ scale: 0.6, opacity: 0, rotateX: 20 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        >
          {single ? (
            <>
              <div className="win-rarity">{items[0].rarity.name}</div>
              <motion.img
                src={items[0].img}
                alt={items[0].name}
                className="win-img"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 12 }}
              />
              <motion.div className="win-name" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
                {items[0].name}
              </motion.div>
              <motion.div className="win-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                {caseName}
              </motion.div>
              <motion.div className="win-value" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                SELL VALUE: <span>{formatMoney(totalValue)}</span>
              </motion.div>
            </>
          ) : (
            <>
              <div className="win-multi-header">
                <div className="win-multi-title">{items.length}x {caseName}</div>
                <div className="win-value win-total">
                  TOTAL: <span>{formatMoney(totalValue)}</span>
                </div>
              </div>
              <div className="win-grid-scroll">
                <div className="win-grid">
                  {items.map((item, i) => {
                    const sv = getItemSellValue(item)
                    return (
                      <div
                        key={i}
                        className="win-grid-item"
                        style={{ '--item-color': item.rarity.color } as React.CSSProperties}
                      >
                        <img src={item.img} alt={item.name} />
                        <div className="wgi-name">{item.name}</div>
                        <div className="wgi-value">{formatMoney(sv)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
          <motion.button
            className="win-close"
            onClick={onClose}
            whileHover={{ scale: 1.05, borderColor: '#666' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            CONTINUE
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
