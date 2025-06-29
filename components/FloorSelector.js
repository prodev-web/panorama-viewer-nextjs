'use client'

import { useState, useEffect } from 'react'
import styles from './FloorSelector.module.css'

export default function FloorSelector({ scenes, currentScene, onFloorChange }) {
  const [floors, setFloors] = useState([])

  useEffect(() => {
    // Get unique floors
    const uniqueFloors = [...new Set(scenes.map(s => s.floor))].sort((a, b) => a - b)
    setFloors(uniqueFloors)
  }, [scenes])

  const handleFloorClick = (floor) => {
    const scene = scenes.find(s => s.floor === floor)
    if (scene && scene.id !== currentScene?.id) {
      onFloorChange(scene.id)
    }
  }

  const getFloorLabel = (floor) => {
    if (floor === 0) return 'Ground'
    if (floor > 0) return `Level ${floor}`
    return `Basement ${Math.abs(floor)}`
  }

  const getSceneCount = (floor) => {
    return scenes.filter(s => s.floor === floor).length
  }

  return (
    <div className={styles.container}>
      <h3>FLOOR SELECTION</h3>
      <div className={styles.buttons}>
        {floors.map(floor => (
          <button
            key={floor}
            className={`${styles.button} ${currentScene?.floor === floor ? styles.active : ''}`}
            onClick={() => handleFloorClick(floor)}
            title={`${getSceneCount(floor)} panoramas`}
          >
            {getFloorLabel(floor)}
          </button>
        ))}
      </div>
    </div>
  )
}