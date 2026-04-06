import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { MonsterCase, MonsterItem, CASES } from '../data/cases'
import { Spinner } from './Spinner'
import { WinModal } from './WinModal'
import { spawnParticles } from './Particles'
import { initAudio, playWinSound, playErrorSound } from '../audio'
import { formatMoney } from '../utils'

interface Props {
  caseKey: string
  balance: number
  canAfford: (price: number) => boolean
  onSpend: (price: number, caseKey: string) => void
  onAddItem: (item: MonsterItem) => void
  onClose: () => void
}

export function CaseOpenOverlay({ caseKey, balance, canAfford, onSpend, onAddItem, onClose }: Props) {
  const caseData = CASES[caseKey]
  const [spinning, setSpinning] = useState(false)
  const [winItem, setWinItem] = useState<MonsterItem | null>(null)
  const [showWin, setShowWin] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [glowColor, setGlowColor] = useState<string | null>(null)

  const affordable = canAfford(caseData.price)

  const handleOpen = useCallback(() => {
    if (spinning) return
    if (!canAfford(caseData.price)) {
      playErrorSound()
      return
    }
    initAudio()
    onSpend(caseData.price, caseKey)
    setSpinning(true)
  }, [spinning, caseData, caseKey, canAfford, onSpend])

  const handleSpinEnd = useCallback((item: MonsterItem) => {
    setSpinning(false)
    setWinItem(item)
    setShowWin(true)
    onAddItem(item)

    if (item.rarity.tier >= 3) {
      setShaking(true)
      setGlowColor(item.rarity.color)
      setTimeout(() => setShaking(false), 500)
      setTimeout(() => setGlowColor(null), 800)
    }
    if (item.rarity.tier >= 4) {
      spawnParticles(item.rarity.color, item.rarity.tier >= 5 ? 60 : 30)
    }
    playWinSound(item.rarity.tier)
  }, [onAddItem])

  const handleCloseWin = useCallback(() => {
    setShowWin(false)
    setWinItem(null)
  }, [])

  return (
    <motion.div
      className="open-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget && !spinning) onClose() }}
    >
      <motion.div
        className={`open-panel ${shaking ? 'shake' : ''}`}
        style={{ '--accent': caseData.accent } as React.CSSProperties}
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      >
        {/* Glow */}
        <div
          className={`panel-glow ${glowColor ? 'fire' : ''}`}
          style={glowColor ? { background: `radial-gradient(circle at center, ${glowColor}30, transparent 70%)` } : undefined}
        />

        {/* Header */}
        <div className="op-header">
          <div className="op-title">
            <span className="op-icon">{caseData.icon}</span>
            <span>{caseData.name}</span>
          </div>
          <div className="op-bal">{formatMoney(balance)}</div>
          <button className="op-close" onClick={() => !spinning && onClose()} disabled={spinning}>✕</button>
        </div>

        {/* Spinner */}
        <div className="op-spinner">
          <Spinner caseData={caseData} spinning={spinning} onSpinEnd={handleSpinEnd} />
        </div>

        {/* Open button */}
        <div className="op-actions">
          <motion.button
            className={`open-btn ${!affordable ? 'disabled' : ''}`}
            onClick={handleOpen}
            disabled={spinning || !affordable}
            whileHover={spinning || !affordable ? {} : { scale: 1.05 }}
            whileTap={spinning || !affordable ? {} : { scale: 0.96 }}
            style={{ '--accent': caseData.accent } as React.CSSProperties}
          >
            {!affordable ? 'NOT ENOUGH FUNDS' : spinning ? 'OPENING...' : `OPEN — ${formatMoney(caseData.price)}`}
          </motion.button>
        </div>
      </motion.div>

      {/* Win modal on top */}
      {showWin && <WinModal item={winItem} caseName={caseData.name} onClose={handleCloseWin} />}
    </motion.div>
  )
}
