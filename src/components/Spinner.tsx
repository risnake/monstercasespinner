import { useRef, useEffect, useCallback, useState } from 'react'
import { MonsterItem, MonsterCase } from '../data/cases'
import { pickWeightedItem } from '../utils'
import { playTick, playOpenSound } from '../audio'

const ITEM_W = 136
const TOTAL_ITEMS = 60
const WIN_INDEX = 42

interface Props {
  caseData: MonsterCase
  spinning: boolean
  onSpinEnd: (item: MonsterItem) => void
}

const START_INDEX = 3

export function Spinner({ caseData, spinning, onSpinEnd }: Props) {
  const stripRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tickRef = useRef(-1)
  const rafRef = useRef<number>(0)
  const [items, setItems] = useState<MonsterItem[]>([])
  const winItemRef = useRef<MonsterItem | null>(null)
  const lastWinRef = useRef<MonsterItem | null>(null)

  useEffect(() => {
    const staticItems: MonsterItem[] = []
    const startItem = lastWinRef.current || caseData.items[0]
    for (let i = 0; i < 12; i++) {
      if (i === START_INDEX) {
        staticItems.push(startItem)
      } else {
        staticItems.push(caseData.items[i % caseData.items.length])
      }
    }
    setItems(staticItems)
    winItemRef.current = null
  }, [caseData])

  useEffect(() => {
    if (!spinning && stripRef.current && containerRef.current) {
      const cw = containerRef.current.offsetWidth
      const offset = -(START_INDEX * ITEM_W) + cw / 2 - ITEM_W / 2
      stripRef.current.style.transition = 'none'
      stripRef.current.style.transform = `translateX(${offset}px)`
    }
  }, [items, spinning])

  const doSpin = useCallback(() => {
    if (!stripRef.current || !containerRef.current) return

    playOpenSound()
    const winner = pickWeightedItem(caseData.items)
    winItemRef.current = winner

    const prevWin = lastWinRef.current
    const newItems: MonsterItem[] = []
    for (let i = 0; i < TOTAL_ITEMS; i++) {
      if (i === START_INDEX && prevWin) {
        newItems.push(prevWin)
      } else if (i === WIN_INDEX) {
        newItems.push(winner)
      } else {
        newItems.push(pickWeightedItem(caseData.items))
      }
    }
    setItems(newItems)

    const cw = containerRef.current.offsetWidth
    const strip = stripRef.current

    // Start positioned on the previous winner (or first item)
    const startOffset = -(START_INDEX * ITEM_W) + cw / 2 - ITEM_W / 2
    strip.style.transition = 'none'
    strip.style.transform = `translateX(${startOffset}px)`
    void strip.offsetHeight

    const targetOffset = -(WIN_INDEX * ITEM_W) + cw / 2 - ITEM_W / 2
    const jitter = (Math.random() - 0.5) * 50
    const finalX = targetOffset + jitter

    tickRef.current = -1
    const startTime = performance.now()
    const duration = 5500

    const tickLoop = () => {
      const elapsed = performance.now() - startTime
      if (elapsed >= duration) return
      const transform = getComputedStyle(strip).transform
      if (transform && transform !== 'none') {
        const matrix = new DOMMatrix(transform)
        const idx = Math.floor(Math.abs(matrix.m41) / ITEM_W)
        if (idx !== tickRef.current) {
          tickRef.current = idx
          playTick(600 + Math.random() * 400, 0.05)
        }
      }
      rafRef.current = requestAnimationFrame(tickLoop)
    }

    requestAnimationFrame(() => {
      strip.style.transition = 'transform 5.5s cubic-bezier(0.15, 0.6, 0.15, 1)'
      strip.style.transform = `translateX(${finalX}px)`
      rafRef.current = requestAnimationFrame(tickLoop)
    })

    setTimeout(() => {
      cancelAnimationFrame(rafRef.current)
      if (winItemRef.current) {
        lastWinRef.current = winItemRef.current
        onSpinEnd(winItemRef.current)
      }
    }, 5700)
  }, [caseData, onSpinEnd])

  useEffect(() => {
    if (spinning) doSpin()
    return () => { cancelAnimationFrame(rafRef.current) }
  }, [spinning, doSpin])

  useEffect(() => {
    const onResize = () => {
      if (!spinning && stripRef.current && containerRef.current) {
        const cw = containerRef.current.offsetWidth
        const offset = -(START_INDEX * ITEM_W) + cw / 2 - ITEM_W / 2
        stripRef.current.style.transition = 'none'
        stripRef.current.style.transform = `translateX(${offset}px)`
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [spinning])

  return (
    <div className="spinner-container" ref={containerRef}>
      <div className="spinner-marker" />
      <div className="spinner-strip" ref={stripRef}>
        {items.map((item, i) => (
          <div key={i} className="spinner-item" style={{ '--item-color': item.rarity.color } as React.CSSProperties}>
            <img src={item.img} alt={item.name} />
            <div className="item-name">{item.name}</div>
            <div className="item-rarity">{item.rarity.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
