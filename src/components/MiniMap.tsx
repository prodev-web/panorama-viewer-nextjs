'use client'

import { useEffect, useRef, ReactElement } from 'react'
import styles from './MiniMap.module.css'
import { SceneData } from '@/types/scenes'

interface MiniMapProps {
  scenes: SceneData[]
  currentScene: SceneData | null
  viewer: any // Marzipano viewer instance
}

export default function MiniMap({ scenes, currentScene, viewer }: MiniMapProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!currentScene || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 180
    canvas.height = 180

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get scenes on current floor
    const floorScenes = scenes.filter(s => s.floor === currentScene.floor)

    if (floorScenes.length === 0) return

    // Calculate bounds
    const xs = floorScenes.map(s => s.position.x)
    const ys = floorScenes.map(s => s.position.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)

    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1
    const scale = Math.min(140 / rangeX, 140 / rangeY)

    // Draw connections
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)'
    ctx.lineWidth = 1

    floorScenes.forEach(scene => {
      const x1 = (scene.position.x - minX) * scale + 20
      const y1 = (scene.position.y - minY) * scale + 20

      scene.linkHotspots.forEach(hotspot => {
        const targetScene = floorScenes.find(s => s.id === hotspot.target)
        if (targetScene) {
          const x2 = (targetScene.position.x - minX) * scale + 20
          const y2 = (targetScene.position.y - minY) * scale + 20

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
      })
    })

    // Draw panorama positions
    floorScenes.forEach(scene => {
      const x = (scene.position.x - minX) * scale + 20
      const y = (scene.position.y - minY) * scale + 20

      ctx.fillStyle = scene.id === currentScene.id ? '#00ff88' : 'rgba(255, 255, 255, 0.5)'
      ctx.beginPath()
      ctx.arc(x, y, scene.id === currentScene.id ? 6 : 3, 0, Math.PI * 2)
      ctx.fill()

      // Draw direction indicator for current position
      if (scene.id === currentScene.id && viewer) {
        try {
          const view = viewer.view()
          const yaw = view.yaw()

          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(yaw)
          ctx.strokeStyle = '#00ff88'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(10, 0)
          ctx.stroke()
          ctx.restore()
        } catch (e) {
          // Handle case where view might not be ready
        }
      }
    })
  }, [scenes, currentScene, viewer])

  // Update on view change
  useEffect(() => {
    if (!viewer || !currentScene) return

    const handleViewChange = () => {
      // Trigger re-render by updating canvas
      const event = new Event('viewChange')
      canvasRef.current?.dispatchEvent(event)
    }

    try {
      const view = viewer.view()
      view.addEventListener('change', handleViewChange)

      return () => {
        view.removeEventListener('change', handleViewChange)
      }
    } catch (e) {
      // Handle case where view might not be ready
      return undefined
    }
  }, [viewer, currentScene])

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}