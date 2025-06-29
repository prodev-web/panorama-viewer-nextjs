"use client";

import { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import styles from "./Hotspot.module.css";

interface HotspotData {
  target: string;
  distance?: number;
  yaw: number;
  pitch: number;
}

interface HotspotProps {
  element: HTMLElement;
  data: HotspotData;
  visible: boolean;
  onNavigate: (sceneId: string) => void;
}

export default function Hotspot({ element, data, visible, onNavigate }: HotspotProps) {
  const rootRef = useRef<Root | null>(null);

  useEffect(() => {
    if (!element) return;

    // Create root if it doesn't exist
    if (!rootRef.current) {
      rootRef.current = createRoot(element);
    }

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onNavigate(data.target);
    };

    // Render hotspot content using createRoot
    rootRef.current.render(
      <div
        className={`${styles.hotspot} ${visible ? styles.visible : ""}`}
        onClick={handleClick}
      >
        <div className={styles.arrow}></div>
        <div className={styles.distance}>{data.distance}m</div>
      </div>
    );

    // Cleanup
    return () => {
      if (rootRef.current) {
        // Give React time to unmount before destroying the root
        setTimeout(() => {
          rootRef.current?.unmount();
          rootRef.current = null;
        }, 0);
      }
    };
  }, [element, data, visible, onNavigate]);

  return null;
}