// Scene loading configuration
export const SCENE_CONFIG = {
  // Maximum number of scenes to keep in memory
  maxLoadedScenes: 5,

  // Number of adjacent scenes to preload
  preloadCount: 3,

  // Delay before preloading adjacent scenes (ms)
  preloadDelay: 500,

  // Image resolution levels
  resolutionLevels: [
    { width: 512 }, // Lowest quality for quick loading
    { width: 1024 }, // Medium quality
    { width: 2048 }, // High quality
    { width: 4096 }, // Maximum quality (reduced from 8192)
  ],

  // Maximum resolution for view limiter
  maxViewResolution: 2048,

  // Field of view limit
  maxFov: 100,
};

// Memory management utilities
export function getMemoryUsage() {
  if (performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576),
      total: Math.round(performance.memory.totalJSHeapSize / 1048576),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
    };
  }
  return null;
}

export function shouldCleanupMemory() {
  const memory = getMemoryUsage();
  if (memory) {
    const usagePercent = (memory.used / memory.limit) * 100;
    return usagePercent > 75; // Cleanup if using more than 75% of memory
  }
  return false;
}
