"use client"

import { useEffect, useRef } from "react"

interface TradingHistoryItem {
  date: string
  price: number
  volume: number
}

interface PriceChartProps {
  data: TradingHistoryItem[]
}

export default function PriceChart({ data }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Extract price data
    const prices = data.map((item) => item.price)
    const minPrice = Math.min(...prices) * 0.95
    const maxPrice = Math.max(...prices) * 1.05
    const priceRange = maxPrice - minPrice

    // Calculate dimensions
    const padding = { top: 20, right: 20, bottom: 30, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Draw price line
    ctx.beginPath()
    ctx.strokeStyle = "#ec4899" // Pink color
    ctx.lineWidth = 2

    // Draw area under the line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, chartHeight + padding.top)
    gradient.addColorStop(0, "rgba(236, 72, 153, 0.4)")
    gradient.addColorStop(1, "rgba(236, 72, 153, 0)")
    ctx.fillStyle = gradient

    data.forEach((item, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth
      const y = padding.top + chartHeight - ((item.price - minPrice) / priceRange) * chartHeight

      if (i === 0) {
        ctx.moveTo(x, y)
        ctx.lineTo(x, padding.top + chartHeight) // Bottom point for fill
        ctx.moveTo(x, y) // Move back to the data point
      } else {
        ctx.lineTo(x, y)
      }
    })

    // Complete the area fill
    const lastX = padding.left + chartWidth
    const lastY = padding.top + chartHeight - ((data[data.length - 1].price - minPrice) / priceRange) * chartHeight
    ctx.lineTo(lastX, lastY)
    ctx.lineTo(lastX, padding.top + chartHeight)
    ctx.closePath()
    ctx.fill()

    // Redraw the line on top
    ctx.beginPath()
    data.forEach((item, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth
      const y = padding.top + chartHeight - ((item.price - minPrice) / priceRange) * chartHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw Y-axis (price)
    ctx.beginPath()
    ctx.strokeStyle = "#4b5563" // Gray color
    ctx.lineWidth = 1
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, padding.top + chartHeight)
    ctx.stroke()

    // Draw Y-axis labels
    ctx.fillStyle = "#9ca3af" // Text color
    ctx.font = "10px Arial"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    const yLabelCount = 5
    for (let i = 0; i <= yLabelCount; i++) {
      const y = padding.top + chartHeight - (i / yLabelCount) * chartHeight
      const price = minPrice + (i / yLabelCount) * priceRange
      ctx.fillText(price.toFixed(2), padding.left - 5, y)

      // Draw horizontal grid line
      ctx.beginPath()
      ctx.strokeStyle = "rgba(75, 85, 99, 0.2)" // Light gray
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()
    }

    // Draw X-axis (dates)
    ctx.beginPath()
    ctx.strokeStyle = "#4b5563"
    ctx.lineWidth = 1
    ctx.moveTo(padding.left, padding.top + chartHeight)
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
    ctx.stroke()

    // Draw X-axis labels (dates)
    ctx.fillStyle = "#9ca3af"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    // Show fewer date labels to avoid overcrowding
    const xLabelCount = Math.min(7, data.length)
    for (let i = 0; i < xLabelCount; i++) {
      const index = Math.floor((i / (xLabelCount - 1)) * (data.length - 1))
      const x = padding.left + (index / (data.length - 1)) * chartWidth
      const date = new Date(data[index].date)
      const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`
      ctx.fillText(dateLabel, x, padding.top + chartHeight + 5)
    }
  }, [data])

  return (
    <div className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
