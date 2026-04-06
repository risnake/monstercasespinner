import { useState } from 'react'
import { motion } from 'motion/react'
import { GameStats } from '../hooks/useGameState'
import { RARITY, CASES } from '../data/cases'
import { formatMoney } from '../utils'

interface Props {
  stats: GameStats
  balance: number
  inventoryValue: number
  netProfit: number
  startingBalance: number
  onReset: () => void
}

export function StatsPage({ stats, balance, inventoryValue, netProfit, startingBalance, onReset }: Props) {
  const [confirmReset, setConfirmReset] = useState(false)

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    onReset()
    setConfirmReset(false)
  }

  // Calculate ROI
  const roi = stats.totalSpent > 0
    ? ((stats.totalEarned + inventoryValue - stats.totalSpent) / stats.totalSpent * 100).toFixed(1)
    : '0.0'

  // Most opened case
  const mostOpened = Object.entries(stats.casesOpenedByType)
    .sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="stats-page">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        YOUR STATISTICS
      </motion.h2>

      <div className="stats-grid">
        {/* Financial overview */}
        <motion.div
          className="stat-card wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h3>FINANCIAL OVERVIEW</h3>
          <div className="stat-rows">
            <div className="stat-row">
              <span>Starting Balance</span>
              <span>{formatMoney(startingBalance)}</span>
            </div>
            <div className="stat-row">
              <span>Current Balance</span>
              <span className="green">{formatMoney(balance)}</span>
            </div>
            <div className="stat-row">
              <span>Total Spent on Cases</span>
              <span className="red">{formatMoney(stats.totalSpent)}</span>
            </div>
            <div className="stat-row">
              <span>Total Earned from Sells</span>
              <span className="green">{formatMoney(stats.totalEarned)}</span>
            </div>
            <div className="stat-row">
              <span>Current Inventory Value</span>
              <span>{formatMoney(inventoryValue)}</span>
            </div>
            <div className="stat-row highlight">
              <span>Net Profit/Loss</span>
              <span className={netProfit >= 0 ? 'green' : 'red'}>
                {netProfit >= 0 ? '+' : ''}{formatMoney(netProfit)}
              </span>
            </div>
            <div className="stat-row">
              <span>ROI</span>
              <span className={Number(roi) >= 0 ? 'green' : 'red'}>{roi}%</span>
            </div>
          </div>
        </motion.div>

        {/* Opening stats */}
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>CASE OPENINGS</h3>
          <div className="stat-big-number">{stats.totalOpened}</div>
          <div className="stat-big-label">TOTAL OPENED</div>
          {mostOpened && (
            <div className="stat-detail">
              Most opened: <span style={{ color: CASES[mostOpened[0]]?.accent }}>
                {CASES[mostOpened[0]]?.shortName}
              </span> ({mostOpened[1]}x)
            </div>
          )}
          <div className="stat-case-breakdown">
            {Object.entries(stats.casesOpenedByType).map(([key, count]) => (
              <div key={key} className="stat-case-row">
                <span style={{ color: CASES[key]?.accent }}>{CASES[key]?.icon} {CASES[key]?.shortName}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Rarity distribution */}
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3>RARITY DISTRIBUTION</h3>
          <div className="rarity-bars">
            {Object.values(RARITY).map(r => {
              const count = stats.rarityHistory[r.name] || 0
              const pct = stats.totalOpened > 0 ? (count / stats.totalOpened * 100) : 0
              return (
                <div key={r.name} className="rarity-bar-row">
                  <span className="rb-label" style={{ color: r.color }}>{r.name}</span>
                  <div className="rb-track">
                    <motion.div
                      className="rb-fill"
                      style={{ background: r.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    />
                  </div>
                  <span className="rb-count">{count} ({pct.toFixed(1)}%)</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Best pull */}
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>BEST PULL</h3>
          {stats.bestPull ? (
            <div className="best-pull">
              <span className="bp-name" style={{ color: stats.bestPull.color }}>
                {stats.bestPull.name}
              </span>
              <span className="bp-value">{formatMoney(stats.bestPull.sellValue)}</span>
            </div>
          ) : (
            <div className="stat-empty">No pulls yet</div>
          )}
        </motion.div>
      </div>

      <div className="stats-footer">
        <motion.button
          className={`reset-btn ${confirmReset ? 'confirm' : ''}`}
          onClick={handleReset}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {confirmReset ? 'CLICK AGAIN TO CONFIRM RESET' : 'RESET ALL DATA'}
        </motion.button>
      </div>
    </div>
  )
}
