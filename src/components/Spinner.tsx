import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { MonsterItem, MonsterCase } from '../data/cases'
import { pickWeightedItem } from '../utils'
import { playTick, playOpenSound } from '../audio'

const ITEM_GAP = 10
const TOTAL_ITEMS = 50
const WIN_INDEX = 38
const START_INDEX = 2

// Reference dimensions (the single-spinner "ideal" size)
const MAX_ITEM_W = 190
const ITEM_ASPECT = 1.305 // 248/190
const IMG_RATIO = 0.625   // 155/248

interface Props {
  caseData: MonsterCase
  spinning: boolean
  onSpinEnd: (item: MonsterItem) => void
  height: number
  muted?: boolean
}

function buildSpinStrip(
  caseItems: MonsterItem[],
  winner: MonsterItem,
  prevWin: MonsterItem | null,
): MonsterItem[] {
  const pool: MonsterItem[] = []
  const copies = Math.ceil(TOTAL_ITEMS / caseItems.length)
  for (let c = 0; c < copies; c++) {
    const shuffled = [...caseItems]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    pool.push(...shuffled)
  }

  const result: MonsterItem[] = []
  let poolIdx = 0
  for (let i = 0; i < TOTAL_ITEMS; i++) {
    if (i === WIN_INDEX) {
      result.push(winner)
    } else if (i === START_INDEX && prevWin) {
      result.push(prevWin)
    } else {
      let pick = pool[poolIdx++ % pool.length]
      if ((i === WIN_INDEX - 1 || i === WIN_INDEX + 1) && pick === winner) {
        pick = pool[poolIdx++ % pool.length]
      }
      result.push(pick)
    }
  }
  return result
}

function buildStaticStrip(
  caseItems: MonsterItem[],
  centerItem: MonsterItem,
): MonsterItem[] {
  const result: MonsterItem[] = []
  for (let i = 0; i < 8; i++) {
    if (i === START_INDEX) {
      result.push(centerItem)
    } else {
      result.push(caseItems[i % caseItems.length])
    }
  }
  return result
}

export function Spinner({ caseData, spinning, onSpinEnd, height, muted = false }: Props) {
  const dims = useMemo(() => {
    const containerH = Math.max(height, 80)
    // Item height fills container minus padding, but item width caps at MAX_ITEM_W
    const rawItemH = containerH - 28
    const rawItemW = Math.round(rawItemH / ITEM_ASPECT)
    const itemW = Math.min(MAX_ITEM_W, rawItemW)
    const itemH = Math.round(itemW * ITEM_ASPECT)
    const imgH = Math.round(itemH * IMG_RATIO)
    const step = itemW + ITEM_GAP
    return { containerH, itemH, itemW, imgH, step }
  }, [height])

  const stripRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tickRef = useRef(-1)
  const rafRef = useRef<number>(0)
  const [items, setItems] = useState<MonsterItem[]>([])
  const winItemRef = useRef<MonsterItem | null>(null)
  const lastWinRef = useRef<MonsterItem | null>(null)
  const needsPositionRef = useRef(true)
  const dimsRef = useRef(dims)
  dimsRef.current = dims

  useEffect(() => {
    const centerItem = lastWinRef.current || caseData.items[0]
    needsPositionRef.current = true
    setItems(buildStaticStrip(caseData.items, centerItem))
    winItemRef.current = null
  }, [caseData])

  useEffect(() => {
    if (needsPositionRef.current && stripRef.current && containerRef.current) {
      needsPositionRef.current = false
      const cw = containerRef.current.offsetWidth
      const offset = -(START_INDEX * dims.step) + cw / 2 - dims.itemW / 2
      stripRef.current.style.transition = 'none'
      stripRef.current.style.transform = `translateX(${offset}px)`
    }
  }, [items, dims])

  const doSpin = useCallback(() => {
    if (!stripRef.current || !containerRef.current) return
    const d = dimsRef.current

    if (!muted) playOpenSound()
    const winner = pickWeightedItem(caseData.items)
    winItemRef.current = winner

    const spinItems = buildSpinStrip(caseData.items, winner, lastWinRef.current)
    setItems(spinItems)

    const cw = containerRef.current.offsetWidth
    const strip = stripRef.current

    const startOffset = -(START_INDEX * d.step) + cw / 2 - d.itemW / 2
    strip.style.transition = 'none'
    strip.style.transform = `translateX(${startOffset}px)`
    void strip.offsetHeight

    const targetOffset = -(WIN_INDEX * d.step) + cw / 2 - d.itemW / 2
    const jitter = (Math.random() - 0.5) * (d.itemW * 0.3)
    const finalX = targetOffset + jitter

    tickRef.current = -1
    const startTime = performance.now()
    const duration = 7200

    const tickLoop = () => {
      const elapsed = performance.now() - startTime
      if (elapsed >= duration) return
      const transform = getComputedStyle(strip).transform
      if (transform && transform !== 'none') {
        const matrix = new DOMMatrix(transform)
        const idx = Math.floor(Math.abs(matrix.m41) / d.step)
        if (idx !== tickRef.current) {
          tickRef.current = idx
          const progress = elapsed / duration
          const pitch = 500 + progress * 600 + Math.random() * 200
          const vol = 0.07 * (1 - progress * 0.6)
          if (!muted) playTick(pitch, vol)
        }
      }
      rafRef.current = requestAnimationFrame(tickLoop)
    }

    requestAnimationFrame(() => {
      strip.style.transition = 'transform 7.5s cubic-bezier(0.1, 0.8, 0.2, 1)'
      strip.style.transform = `translateX(${finalX}px)`
      rafRef.current = requestAnimationFrame(tickLoop)
    })

    setTimeout(() => {
      cancelAnimationFrame(rafRef.current)
      if (winItemRef.current) {
        lastWinRef.current = winItemRef.current
        onSpinEnd(winItemRef.current)
      }
    }, 7800)
  }, [caseData, onSpinEnd])

  useEffect(() => {
    if (spinning) doSpin()
    return () => { cancelAnimationFrame(rafRef.current) }
  }, [spinning, doSpin])

  useEffect(() => {
    const onResize = () => {
      if (needsPositionRef.current && stripRef.current && containerRef.current) {
        const d = dimsRef.current
        const cw = containerRef.current.offsetWidth
        const offset = -(START_INDEX * d.step) + cw / 2 - d.itemW / 2
        stripRef.current.style.transition = 'none'
        stripRef.current.style.transform = `translateX(${offset}px)`
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="spinner-container" ref={containerRef} style={{ height: dims.containerH }}>
      <div className="spinner-marker" />
      <div className="spinner-strip" ref={stripRef}>
        {items.map((item, i) => (
          <div
            key={i}
            className="spinner-item"
            style={{
              '--item-color': item.rarity.color,
              width: dims.itemW,
              height: dims.itemH,
            } as React.CSSProperties}
          >
            <img src={item.img} alt={item.name} style={{ height: dims.imgH }} />
            <div className="item-name">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
