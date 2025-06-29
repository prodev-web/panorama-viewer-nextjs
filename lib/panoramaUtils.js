// Check WebGL support
export function checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        return false
      }
      // Check if WebGL is actually working
      if (gl.getParameter(gl.VERSION)) {
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }
  
  // Create ripple effect
  export function createRipple(x, y) {
    const ripple = document.createElement('div')
    ripple.classList.add('touch-ripple')
    ripple.style.left = x + 'px'
    ripple.style.top = y + 'px'
    document.body.appendChild(ripple)
  
    setTimeout(() => {
      ripple.remove()
    }, 600)
  }
  
  // Calculate distance between two positions
  export function calculateDistance(pos1, pos2) {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + 
      Math.pow(pos1.y - pos2.y, 2)
    )
  }
  
  // Format floor label
  export function formatFloorLabel(floor) {
    if (floor === 0) return 'Ground'
    if (floor > 0) return `Level ${floor}`
    return `Basement ${Math.abs(floor)}`
  }