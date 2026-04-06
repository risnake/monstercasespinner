import { motion } from 'motion/react'
import { formatMoney } from '../utils'

interface Props {
  balance: number
  netProfit: number
  inventoryValue: number
  page: string
  onNavigate: (page: string) => void
  onReset: () => void
}

export function Navbar({ balance, netProfit, page, onNavigate }: Props) {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <motion.div
          className="nav-brand"
          onClick={() => onNavigate('home')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="nav-claw">M</span>
          <span className="nav-title">MONSTER SPINNER</span>
        </motion.div>

        <div className="nav-links">
          <button
            className={`nav-link ${page === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            CASES
          </button>
          <button
            className={`nav-link ${page === 'inventory' ? 'active' : ''}`}
            onClick={() => onNavigate('inventory')}
          >
            INVENTORY
          </button>
          <button
            className={`nav-link ${page === 'stats' ? 'active' : ''}`}
            onClick={() => onNavigate('stats')}
          >
            STATS
          </button>
        </div>

        <div className="nav-wallet">
          <div className="wallet-balance">
            <span className="wallet-label">BALANCE</span>
            <motion.span
              className="wallet-amount"
              key={balance}
              initial={{ scale: 1.15, color: '#fff' }}
              animate={{ scale: 1, color: '#4eff00' }}
              transition={{ duration: 0.3 }}
            >
              {formatMoney(balance)}
            </motion.span>
          </div>
          <div className={`wallet-profit ${netProfit >= 0 ? 'positive' : 'negative'}`}>
            <span className="profit-label">P/L</span>
            <span className="profit-amount">
              {netProfit >= 0 ? '+' : ''}{formatMoney(netProfit)}
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
