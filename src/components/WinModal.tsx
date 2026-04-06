import { motion, AnimatePresence } from 'motion/react'
import { MonsterItem, getItemSellValue } from '../data/cases'
import { formatMoney } from '../utils'

interface Props {
  item: MonsterItem | null
  caseName: string
  onClose: () => void
}

export function WinModal({ item, caseName, onClose }: Props) {
  if (!item) return null
  const sellValue = getItemSellValue(item)

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
          className="win-card"
          style={{ '--win-color': item.rarity.color } as React.CSSProperties}
          initial={{ scale: 0.6, opacity: 0, rotateX: 20 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        >
          <div className="win-rarity">{item.rarity.name}</div>
          <motion.img
            src={item.img}
            alt={item.name}
            className="win-img"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 12 }}
          />
          <motion.div
            className="win-name"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {item.name}
          </motion.div>
          <motion.div
            className="win-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {caseName}
          </motion.div>
          <motion.div
            className="win-value"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            SELL VALUE: <span>{formatMoney(sellValue)}</span>
          </motion.div>
          <motion.button
            className="win-close"
            onClick={onClose}
            whileHover={{ scale: 1.05, borderColor: '#666' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            CONTINUE
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
