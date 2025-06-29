'use client'

import { ReactElement } from 'react'
import styles from './SceneInfo.module.css'

interface Position {
  x: number
  y: number
  z: number
}

interface SceneData {
  id: string
  name: string
  floor: number
  position: Position
  initialViewParameters?: {
    yaw: number
    pitch: number
    fov: number
  }
  linkHotspots?: Array<{
    yaw: number
    pitch: number
    target: string
    distance?: number
  }>
  panoPos?: {
    x: number
    y: number
  }
}

interface SceneInfoProps {
  scene: SceneData | null
  connections: number
}

export default function SceneInfo({ scene, connections }: SceneInfoProps): ReactElement | null {
  if (!scene) return null

  return (
    <div className={styles.container}>
      <h3>Current Location</h3>
      <p>
        <span className={styles.label}>Scene:</span>
        <span>{scene.name}</span>
      </p>
      <p>
        <span className={styles.label}>Floor:</span>
        <span>Level {scene.floor}</span>
      </p>
      <p>
        <span className={styles.label}>Position:</span>
        <span>({scene.position.x.toFixed(1)}, {scene.position.y.toFixed(1)})</span>
      </p>
      <p>
        <span className={styles.label}>Connections:</span>
        <span>{connections} paths</span>
      </p>
    </div>
  )
}