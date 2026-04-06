import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useGameState } from './hooks/useGameState'
import { Navbar } from './components/Navbar'
import { HomePage } from './components/HomePage'
import { CaseOpenOverlay } from './components/CaseOpenPage'
import { InventoryPage } from './components/InventoryPage'
import { StatsPage } from './components/StatsPage'
import { Particles } from './components/Particles'
import './App.css'

type Page = 'home' | 'inventory' | 'stats'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [openingCase, setOpeningCase] = useState<string | null>(null)

  const game = useGameState()

  const handleNavigate = useCallback((p: string) => {
    setPage(p as Page)
  }, [])

  const handleOpenCase = useCallback((key: string) => {
    setOpeningCase(key)
  }, [])

  const handleCloseOverlay = useCallback(() => {
    setOpeningCase(null)
  }, [])

  return (
    <div className="app">
      <Particles />

      <Navbar
        balance={game.balance}
        netProfit={game.netProfit}
        inventoryValue={game.inventoryValue}
        page={page}
        onNavigate={handleNavigate}
        onReset={game.resetGame}
      />

      <main className="main-content">
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <HomePage
                balance={game.balance}
                canAfford={game.canAfford}
                onOpenCase={handleOpenCase}
              />
            </motion.div>
          )}

          {page === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <InventoryPage
                inventory={game.inventory}
                inventoryValue={game.inventoryValue}
                onSellItem={game.sellItem}
                onSellAll={game.sellAll}
              />
            </motion.div>
          )}

          {page === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <StatsPage
                stats={game.stats}
                balance={game.balance}
                inventoryValue={game.inventoryValue}
                netProfit={game.netProfit}
                startingBalance={game.startingBalance}
                onReset={game.resetGame}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating case-open overlay */}
      <AnimatePresence>
        {openingCase && (
          <CaseOpenOverlay
            key={openingCase}
            caseKey={openingCase}
            balance={game.balance}
            canAfford={game.canAfford}
            onSpend={game.spendMoney}
            onAddItem={game.addItem}
            onClose={handleCloseOverlay}
          />
        )}
      </AnimatePresence>

      <div className="claw-deco top-right">///</div>
      <div className="claw-deco bottom-left">///</div>
    </div>
  )
}

export default App
