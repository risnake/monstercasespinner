export function Particles() {
  return <div className="particle-container" />
}

export function spawnParticles(color: string, count: number) {
  const container = document.querySelector('.particle-container')
  if (!container) return

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div')
    p.className = 'particle'
    p.style.background = color
    p.style.boxShadow = `0 0 6px ${color}`
    p.style.left = `${40 + Math.random() * 20}%`
    p.style.top = `${30 + Math.random() * 20}%`

    const angle = Math.random() * Math.PI * 2
    const velocity = 100 + Math.random() * 300
    const dx = Math.cos(angle) * velocity
    const dy = Math.sin(angle) * velocity
    const duration = 1 + Math.random() * 1.5

    p.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: '1' },
        { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: '0' },
      ],
      { duration: duration * 1000, easing: 'cubic-bezier(0, 0.5, 0.5, 1)', fill: 'forwards' as FillMode }
    )

    container.appendChild(p)
    setTimeout(() => p.remove(), duration * 1000 + 100)
  }
}
