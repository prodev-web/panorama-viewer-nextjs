'use client'

import styles from './TransitionOverlay.module.css'

export default function TransitionOverlay({ active }) {
  return <div className={`${styles.overlay} ${active ? styles.active : ''}`} />
}