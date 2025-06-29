'use client'

import dynamic from 'next/dynamic'

// Dynamically import PanoramaViewer to avoid SSR issues with Marzipano
const PanoramaViewer = dynamic(
  () => import('@/components/PanoramaViewer'),
  { 
    ssr: false,
    loading: () => <div id="loading">
      <div className="loader"></div>
      <div>Loading panoramas...</div>
    </div>
  }
)

export default function Home() {
  return <PanoramaViewer />
}