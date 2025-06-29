import './globals.css'

export const metadata = {
  title: 'Advanced Panorama Viewer',
  description: 'Interactive 3D panorama tour with floor navigation',
  viewport: 'width=device-width, initial-scale=1.0',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:," />
      </head>
      <body>{children}</body>
    </html>
  )
}