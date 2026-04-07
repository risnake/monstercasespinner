import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CASES, MonsterCase, MonsterItem, RARITY, getItemSellValue } from '../data/cases'
import { formatMoney } from '../utils'

interface Props {
  balance: number
  canAfford: (price: number) => boolean
  onOpenCase: (caseKey: string) => void
}

/* ── Preview Modal ─────────────────────────────────────────── */

function PreviewModal({ caseData, onClose }: { caseData: MonsterCase; onClose: () => void }) {
  const sorted = [...caseData.items].sort((a, b) => b.rarity.tier - a.rarity.tier)
  return (
    <motion.div
      className="preview-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="preview-panel"
        style={{ '--accent': caseData.accent } as React.CSSProperties}
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div className="preview-header">
          <span className="preview-icon" style={{ color: caseData.accent }}>&#9670;</span>
          <span className="preview-title">{caseData.name}</span>
          <button className="preview-close" onClick={onClose}>✕</button>
        </div>
        <div className="preview-desc">{caseData.description}</div>
        <div className="preview-grid">
          {sorted.map(item => {
            const sv = getItemSellValue(item)
            return (
              <div
                key={item.img}
                className="preview-item"
                style={{ '--item-color': item.rarity.color } as React.CSSProperties}
              >
                <img src={item.img} alt={item.name} />
                <div className="pi-name">{item.name}</div>
                <div className="pi-meta">
                  <span className="pi-rarity">{item.rarity.name}</span>
                  <span className="pi-value">{formatMoney(sv)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Case Card ─────────────────────────────────────────────── */

function CaseCard({ caseKey, caseData, index, balance, onOpen }: {
  caseKey: string
  caseData: MonsterCase
  index: number
  balance: number
  onOpen: (key: string) => void
}) {
  const [showPreview, setShowPreview] = useState(false)
  const affordable = balance >= caseData.price

  // pick best item per rarity tier for display
  const heroItem = caseData.items.find(i => i.rarity === RARITY.SPECIAL)
    || caseData.items.find(i => i.rarity === RARITY.COVERT)
    || caseData.items[caseData.items.length - 1]

  return (
    <>
      <motion.div
        className={`case-card ${!affordable ? 'locked' : ''}`}
        style={{ '--accent': caseData.accent } as React.CSSProperties}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, type: 'spring', damping: 18 }}
      >
        <div className="cc-badge" style={{ color: caseData.accent }}>&#9670;</div>
        <div className={`cc-risk cc-risk-${caseData.risk}`}>{caseData.risk.toUpperCase()}</div>

        <div className="cc-hero">
          <img src={heroItem.img} alt={heroItem.name} className="cc-hero-img" />
        </div>

        <h3 className="cc-name">{caseData.shortName}</h3>
        <p className="cc-desc">{caseData.description}</p>

        <div className="cc-rarity-dots">
          {Object.values(RARITY).map(r => {
            const count = caseData.items.filter(i => i.rarity.tier === r.tier).length
            if (!count) return null
            return <span key={r.name} className="cc-dot" style={{ background: r.color }} title={`${r.name} (${count})`} />
          })}
        </div>

        <div className="cc-price">{formatMoney(caseData.price)}</div>

        <div className="cc-buttons">
          <button className="cc-preview-btn" onClick={() => setShowPreview(true)}>
            CONTENTS
          </button>
          <motion.button
            className="cc-open-btn"
            onClick={() => affordable && onOpen(caseKey)}
            disabled={!affordable}
            whileHover={affordable ? { scale: 1.06 } : {}}
            whileTap={affordable ? { scale: 0.95 } : {}}
          >
            {affordable ? 'OPEN' : 'NO FUNDS'}
          </motion.button>
        </div>

        {!affordable && <div className="cc-locked-overlay" />}
      </motion.div>

      <AnimatePresence>
        {showPreview && <PreviewModal caseData={caseData} onClose={() => setShowPreview(false)} />}
      </AnimatePresence>
    </>
  )
}

/* ── HomePage ──────────────────────────────────────────────── */

export function HomePage({ balance, canAfford, onOpenCase }: Props) {
  return (
    <div className="home-page">
      <div className="home-hero">
        <motion.h1
          className="home-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          MONSTER CASE SPINNER
        </motion.h1>
        <motion.p
          className="home-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          UNLEASH THE BEAST
        </motion.p>
      </div>

      <div className="case-grid">
        {Object.entries(CASES).map(([key, c], i) => (
          <CaseCard
            key={key}
            caseKey={key}
            caseData={c}
            index={i}
            balance={balance}
            onOpen={onOpenCase}
          />
        ))}
      </div>
    </div>
  )
}
