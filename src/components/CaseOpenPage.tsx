import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { MonsterItem, CASES } from '../data/cases'
import { Spinner } from './Spinner'
import { WinModal } from './WinModal'
import { spawnParticles } from './Particles'
import { initAudio, playWinSound, playErrorSound } from '../audio'
import { formatMoney, pickWeightedItem } from '../utils'

interface Props {
  caseKey: string
  balance: number
  canAfford: (price: number) => boolean
  onSpend: (price: number, caseKey: string, count?: number) => void
  onAddItem: (item: MonsterItem) => void
  onClose: () => void
}

const QTY_PRESETS = [1, 2, 3, 5]
const MAX_VISIBLE_SPINNERS = 5
const MAX_SPINNER_H = 280
const CHROME_HEIGHT = 160

function useSpinnerHeight(visibleCount: number) {
  const [height, setHeight] = useState(() => {
    const available = window.innerHeight * 0.9 - CHROME_HEIGHT
    const gap = Math.max(0, visibleCount - 1) * 8
    return Math.min(MAX_SPINNER_H, Math.max(100, Math.floor((available - gap) / visibleCount)))
  })

  useEffect(() => {
    const calc = () => {
      const available = window.innerHeight * 0.9 - CHROME_HEIGHT
      const gap = Math.max(0, visibleCount - 1) * 8
      setHeight(Math.min(MAX_SPINNER_H, Math.max(100, Math.floor((available - gap) / visibleCount))))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [visibleCount])

  return height
}

// Preload all images for a case into browser cache
function preloadCaseImages(items: MonsterItem[]) {
  for (const item of items) {
    const img = new Image()
    img.src = item.img
  }
}

export function CaseOpenOverlay({ caseKey, balance, canAfford, onSpend, onAddItem, onClose }: Props) {
  const caseData = CASES[caseKey]
  const [quantity, setQuantity] = useState(1)
  const [customInput, setCustomInput] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [wonItems, setWonItems] = useState<MonsterItem[]>([])
  const [showWin, setShowWin] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [glowColor, setGlowColor] = useState<string | null>(null)
  const quantityRef = useRef(quantity)
  quantityRef.current = quantity

  // Preload images on mount
  useEffect(() => {
    preloadCaseImages(caseData.items)
  }, [caseData])

  const visibleCount = Math.min(quantity, MAX_VISIBLE_SPINNERS)
  const instantCount = Math.max(0, quantity - MAX_VISIBLE_SPINNERS)
  const spinnerHeight = useSpinnerHeight(visibleCount)

  const totalCost = caseData.price * quantity
  const affordable = balance >= totalCost
  const maxAffordable = Math.floor(balance / caseData.price)

  const selectPreset = useCallback((q: number) => {
    if (spinning || q > maxAffordable) return
    setQuantity(q)
    setCustomInput('')
  }, [spinning, maxAffordable])

  const handleCustom = useCallback((val: string) => {
    if (val !== '' && !/^\d+$/.test(val)) return
    setCustomInput(val)
    if (val === '') return
    const n = parseInt(val)
    if (n > 0 && n <= maxAffordable) {
      setQuantity(n)
    }
  }, [maxAffordable])

  useEffect(() => {
    if (quantity > maxAffordable && maxAffordable > 0) {
      setQuantity(maxAffordable)
      setCustomInput('')
    }
  }, [maxAffordable, quantity])

  const handleOpen = useCallback(() => {
    if (spinning) return
    const qty = quantityRef.current
    if (balance < caseData.price * qty) {
      playErrorSound()
      return
    }
    initAudio()
    onSpend(caseData.price * qty, caseKey, qty)

    // Instantly resolve any beyond the visible spinner cap
    const instant = Math.max(0, qty - MAX_VISIBLE_SPINNERS)
    const instantItems: MonsterItem[] = []
    for (let i = 0; i < instant; i++) {
      const item = pickWeightedItem(caseData.items)
      onAddItem(item)
      instantItems.push(item)
    }

    setWonItems(instantItems)
    setSpinning(true)
  }, [spinning, caseData, caseKey, balance, onSpend, onAddItem])

  const handleSpinEnd = useCallback((item: MonsterItem) => {
    onAddItem(item)
    setWonItems(prev => [...prev, item])
  }, [onAddItem])

  // Detect all spinners finished
  useEffect(() => {
    if (wonItems.length > 0 && wonItems.length === quantityRef.current && spinning) {
      setSpinning(false)
      setShowWin(true)
      const best = wonItems.reduce((a, b) => b.rarity.tier > a.rarity.tier ? b : a)
      if (best.rarity.tier >= 3) {
        setShaking(true)
        setGlowColor(best.rarity.color)
        setTimeout(() => setShaking(false), 500)
        setTimeout(() => setGlowColor(null), 800)
      }
      if (best.rarity.tier >= 4) {
        spawnParticles(best.rarity.color, best.rarity.tier >= 5 ? 60 : 30)
      }
      playWinSound(best.rarity.tier)
    }
  }, [wonItems, spinning])

  const handleCloseWin = useCallback(() => {
    setShowWin(false)
    setWonItems([])
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      if (e.code === 'Space') {
        e.preventDefault()
        if (showWin) handleCloseWin()
        else handleOpen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleOpen, showWin, handleCloseWin])

  const isCustom = quantity > 0 && !QTY_PRESETS.includes(quantity)

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
        <div
          className={`panel-glow ${glowColor ? 'fire' : ''}`}
          style={glowColor ? { background: `radial-gradient(circle at center, ${glowColor}30, transparent 70%)` } : undefined}
        />

        <div className="op-header">
          <div className="op-title">
            <span className="op-icon">&#9670;</span>
            <span>{caseData.name}</span>
          </div>
          <div className="op-bal">{formatMoney(balance)}</div>
          <button className="op-close" onClick={() => !spinning && onClose()} disabled={spinning}>&#10005;</button>
        </div>

        <div className="qty-bar">
          {QTY_PRESETS.map(q => (
            <button
              key={q}
              className={`qty-btn ${quantity === q && !isCustom ? 'active' : ''}`}
              onClick={() => selectPreset(q)}
              disabled={spinning || q > maxAffordable}
            >
              {q}x
            </button>
          ))}
          <input
            type="text"
            inputMode="numeric"
            className={`qty-input ${isCustom ? 'active' : ''}`}
            placeholder="Qty"
            value={customInput}
            onChange={e => handleCustom(e.target.value)}
            disabled={spinning}
          />
          {customInput !== '' && parseInt(customInput) > maxAffordable && (
            <span className="qty-error">Max {maxAffordable}</span>
          )}
        </div>

        <div className="op-spinner">
          {instantCount > 0 && !spinning && !showWin && (
            <div className="instant-note">
              {visibleCount} animated + {instantCount} instant
            </div>
          )}
          {Array.from({ length: visibleCount }, (_, i) => (
            <Spinner
              key={`${caseKey}-${i}`}
              caseData={caseData}
              spinning={spinning}
              onSpinEnd={handleSpinEnd}
              height={spinnerHeight}
              muted={i > 0}
            />
          ))}
        </div>

        <div className="op-actions">
          <motion.button
            className={`open-btn ${!affordable ? 'disabled' : ''}`}
            onClick={handleOpen}
            disabled={spinning || !affordable}
            whileHover={spinning || !affordable ? {} : { scale: 1.05 }}
            whileTap={spinning || !affordable ? {} : { scale: 0.96 }}
            style={{ '--accent': caseData.accent } as React.CSSProperties}
          >
            {!affordable
              ? 'NOT ENOUGH FUNDS'
              : spinning
                ? 'SPINNING...'
                : `SPIN ${quantity > 1 ? `${quantity}x` : ''} \u2014 ${formatMoney(totalCost)}`}
          </motion.button>
          {!spinning && <div className="op-hint">or press SPACE</div>}
        </div>
      </motion.div>

      {showWin && (
        <WinModal
          items={wonItems}
          caseName={caseData.name}
          onClose={handleCloseWin}
        />
      )}
    </motion.div>
  )
}
