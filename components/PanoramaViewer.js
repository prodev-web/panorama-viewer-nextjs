"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Script from "next/script";
import FloorSelector from "./FloorSelector";
import SceneInfo from "./SceneInfo";
import MiniMap from "./MiniMap";
import LoadingScreen from "./LoadingScreen";
import TransitionOverlay from "./TransitionOverlay";
import Hotspot from "./Hotspot";
import { checkWebGLSupport, createRipple } from "@/lib/panoramaUtils";

export default function PanoramaViewer() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [hotspotsVisible, setHotspotsVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);

  const viewerRef = useRef(null);
  const scenesRef = useRef({});
  const panoRef = useRef(null);
  const hotspotTimeoutRef = useRef(null);
  const marzipanoRef = useRef(null);

  // Initialize viewer
  const initializeViewer = useCallback(async () => {
    try {
      // Check WebGL support
      if (!checkWebGLSupport()) {
        throw new Error("WebGL is not supported or disabled in your browser");
      }

      // Load configuration
      const response = await fetch("/config.json");
      if (!response.ok) {
        throw new Error(`Failed to load config.json: ${response.statusText}`);
      }

      const text = await response.text();
      if (!text || text.trim() === "") {
        throw new Error(
          "config.json is empty. Please run: python3 scripts/generate_marzipano_config.py"
        );
      }

      const configData = JSON.parse(text);
      setConfig(configData);

      // Initialize Marzipano viewer
      const Marzipano = window.Marzipano;
      if (!Marzipano) {
        throw new Error("Marzipano library not loaded");
      }

      const viewerOpts = {
        controls: {
          mouseViewMode: "drag",
        },
        stage: {
          progressive: true,
        },
      };

      const viewer = new Marzipano.Viewer(panoRef.current, viewerOpts);
      viewerRef.current = viewer;

      // Create scenes
      await createScenes(configData, viewer, Marzipano);

      // Display first scene
      if (configData.scenes.length > 0) {
        switchScene(configData.scenes[0].id, true);
      }

      setIsLoading(false);

      // Show tap hint after a delay
      setTimeout(() => setShowTapHint(true), 1000);
      setTimeout(() => setShowTapHint(false), 4000);
    } catch (err) {
      console.error("Initialization error:", err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  // Create scenes
  const createScenes = async (configData, viewer, Marzipano) => {
    const scenes = {};

    for (const sceneData of configData.scenes) {
      try {
        // Create source
        const source = Marzipano.ImageUrlSource.fromString(
          `/images/${sceneData.id}-pano.jpg`
        );

        // Create geometry
        const geometry = new Marzipano.EquirectGeometry([
          { width: 1024 },
          { width: 2048 },
          { width: 4096 },
        ]);

        // Create view
        const limiter = Marzipano.RectilinearView.limit.traditional(
          2048,
          (100 * Math.PI) / 180
        );
        const view = new Marzipano.RectilinearView(
          sceneData.initialViewParameters,
          limiter
        );

        // Create scene
        const scene = viewer.createScene({
          source: source,
          geometry: geometry,
          view: view,
          pinFirstLevel: true,
        });

        // Store scene
        scenes[sceneData.id] = {
          scene: scene,
          data: sceneData,
          hotspotElements: [],
        };
      } catch (err) {
        console.error("Config loading error:", err);
        if (err.message.includes("config.json")) {
          setError(
            "Configuration file not found. Please run: python3 scripts/generate_marzipano_config.py"
          );
        } else {
          setError(err.message);
        }
        setIsLoading(false);
        return;
      }
    }

    scenesRef.current = scenes;
  };

  // Switch scene
  const switchScene = useCallback((sceneId, isInitial = false) => {
    const sceneInfo = scenesRef.current[sceneId];
    if (!sceneInfo || !viewerRef.current) return;

    // Switch scene
    sceneInfo.scene.switchTo();
    setCurrentScene(sceneId);

    // Create hotspots for this scene
    createHotspotsForScene(sceneInfo);

    // Hide hotspots initially if not initial load
    if (!isInitial) {
      setHotspotsVisible(false);
    }
  }, []);

  // Create hotspots for a scene
  const createHotspotsForScene = (sceneInfo) => {
    // Clear existing hotspots
    sceneInfo.hotspotElements.forEach((element) => {
      element.remove();
    });
    sceneInfo.hotspotElements = [];

    // Create new hotspots
    sceneInfo.data.linkHotspots.forEach((hotspotData) => {
      const element = document.createElement("div");
      const hotspotContainer = sceneInfo.scene.hotspotContainer();

      hotspotContainer.createHotspot(element, {
        yaw: hotspotData.yaw,
        pitch: hotspotData.pitch,
      });

      sceneInfo.hotspotElements.push(element);
    });
  };

  // Navigate to scene
  const navigateToScene = useCallback(
    (sceneId) => {
      setTransitioning(true);
      setTimeout(() => {
        switchScene(sceneId);
        setTimeout(() => setTransitioning(false), 100);
      }, 300);
    },
    [switchScene]
  );

  // Toggle hotspots
  const toggleHotspots = useCallback(() => {
    if (hotspotsVisible) {
      setHotspotsVisible(false);
      clearTimeout(hotspotTimeoutRef.current);
    } else {
      setHotspotsVisible(true);
      // Auto-hide after 5 seconds
      clearTimeout(hotspotTimeoutRef.current);
      hotspotTimeoutRef.current = setTimeout(() => {
        setHotspotsVisible(false);
      }, 5000);
    }
  }, [hotspotsVisible]);

  // Handle panorama click
  const handlePanoClick = useCallback(
    (e) => {
      // Don't toggle if clicking a hotspot
      if (e.target.closest(".hotspot")) return;

      // Show touch ripple effect
      createRipple(e.clientX, e.clientY);

      // Toggle hotspots
      toggleHotspots();
    },
    [toggleHotspots]
  );

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === " ") {
        e.preventDefault();
        toggleHotspots();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [toggleHotspots]);

  // Initialize when Marzipano loads
  const handleMarzipanoLoad = () => {
    marzipanoRef.current = true;
    initializeViewer();
  };

  if (error) {
    return <LoadingScreen error={error} />;
  }

  return (
    <>
      <Script
        src="/js/marzipano.js"
        strategy="afterInteractive"
        onLoad={handleMarzipanoLoad}
      />

      {isLoading && <LoadingScreen />}

      <div
        ref={panoRef}
        id="pano"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          cursor: "grab",
        }}
        onClick={handlePanoClick}
        onMouseDown={(e) => (e.currentTarget.style.cursor = "grabbing")}
        onMouseUp={(e) => (e.currentTarget.style.cursor = "grab")}
      />

      <TransitionOverlay active={transitioning} />

      {showTapHint && (
        <div className="tap-hint show">Tap anywhere to show navigation</div>
      )}

      {config && currentScene && (
        <>
          <FloorSelector
            scenes={config.scenes}
            currentScene={scenesRef.current[currentScene]?.data}
            onFloorChange={navigateToScene}
          />

          <SceneInfo
            scene={scenesRef.current[currentScene]?.data}
            connections={
              scenesRef.current[currentScene]?.data.linkHotspots.length || 0
            }
          />

          <MiniMap
            scenes={config.scenes}
            currentScene={scenesRef.current[currentScene]?.data}
            viewer={viewerRef.current}
          />

          {/* Render hotspots */}
          {scenesRef.current[currentScene]?.hotspotElements.map(
            (element, index) => {
              const hotspotData =
                scenesRef.current[currentScene].data.linkHotspots[index];
              return (
                <Hotspot
                  key={`${currentScene}-${index}-${hotspotData.target}`} // More specific key
                  element={element}
                  data={hotspotData}
                  visible={hotspotsVisible}
                  onNavigate={navigateToScene}
                />
              );
            }
          )}
        </>
      )}

      <div id="controls-hint">
        <div>🖱️ Drag to look around • Click to show paths</div>
        <div>📍 Click on arrows to navigate</div>
      </div>

      <style jsx>{`
        .tap-hint {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 12px 24px;
          border-radius: 24px;
          font-size: 14px;
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
          z-index: 1000;
        }

        .tap-hint.show {
          opacity: 1;
          animation: fadeInOut 3s ease-in-out;
        }

        #controls-hint {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 12px;
          z-index: 1000;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          #controls-hint {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
