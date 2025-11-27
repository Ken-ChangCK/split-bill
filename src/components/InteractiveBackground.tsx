import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  life: number
  maxLife: number
  vx: number
  vy: number
  color: string
  rotation: number
  rotationSpeed: number
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const lastMousePos = useRef({ x: 0, y: 0 })
  const frameCount = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 設置 canvas 尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 星星配置（更鮮豔的顏色，在淺色背景上更明顯）
    const starColors = [
      '#FFD700', // 金色
      '#FF6B35', // 亮橙紅
      '#F7B801', // 亮黃
      '#FF1493', // 深粉紅
      '#9B59B6', // 紫色
      '#3498DB', // 亮藍色
      '#E74C3C', // 紅色
      '#1ABC9C', // 青綠色
    ]

    // 滑鼠移動事件
    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = { x: e.clientX, y: e.clientY }

      // 計算移動距離
      const dx = currentPos.x - lastMousePos.current.x
      const dy = currentPos.y - lastMousePos.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // 只有移動距離大於某個閾值時才產生星星
      if (distance > 5) {
        // 根據移動速度產生不同數量的星星
        const numStars = Math.min(Math.floor(distance / 10), 3)

        for (let i = 0; i < numStars; i++) {
          const offsetX = (Math.random() - 0.5) * 20
          const offsetY = (Math.random() - 0.5) * 20
          const maxLife = Math.random() * 60 + 40 // 40-100 幀

          starsRef.current.push({
            x: currentPos.x + offsetX,
            y: currentPos.y + offsetY,
            size: Math.random() * 4 + 3, // 3-7px 更大更明顯
            life: maxLife,
            maxLife: maxLife,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5 - 0.3, // 輕微向上飄
            color: starColors[Math.floor(Math.random() * starColors.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
          })
        }
      }

      lastMousePos.current = currentPos
    }
    window.addEventListener('mousemove', handleMouseMove)

    // 繪製星星函數
    const drawStar = (star: Star) => {
      ctx.save()
      ctx.translate(star.x, star.y)
      ctx.rotate(star.rotation)

      // 計算透明度（閃爍效果）
      const lifeFactor = star.life / star.maxLife
      const twinkleFactor = Math.sin(frameCount.current * 0.1 + star.x) * 0.3 + 0.7
      const opacity = lifeFactor * twinkleFactor

      // 繪製外層光暈
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, star.size * 2)
      gradient.addColorStop(0, `${star.color}${Math.floor(opacity * 0.8 * 255).toString(16).padStart(2, '0')}`)
      gradient.addColorStop(1, `${star.color}00`)
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, star.size * 2, 0, Math.PI * 2)
      ctx.fill()

      // 繪製星星本體（五角星）
      ctx.fillStyle = `${star.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const x = Math.cos(angle) * star.size
        const y = Math.sin(angle) * star.size
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.fill()

      ctx.restore()
    }

    // 繪製函數
    const draw = () => {
      if (!ctx || !canvas) return

      frameCount.current++

      // 完全清空畫布（透明背景）
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 更新和繪製星星
      starsRef.current.forEach((star) => {
        // 更新位置
        star.x += star.vx
        star.y += star.vy
        star.rotation += star.rotationSpeed

        // 更新生命值
        star.life--

        // 繪製星星
        if (star.life > 0) {
          drawStar(star)
        }
      })

      // 移除已消失的星星
      starsRef.current = starsRef.current.filter((star) => star.life > 0)

      // 限制星星數量（優化性能）
      if (starsRef.current.length > 200) {
        starsRef.current = starsRef.current.slice(-200)
      }

      requestAnimationFrame(draw)
    }

    draw()

    // 清理
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  )
}
