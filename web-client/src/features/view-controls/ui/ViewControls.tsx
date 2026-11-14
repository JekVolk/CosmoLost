import React, { useState } from 'react';
import { RotateCw, Compass, MapPin, Maximize, Minimize } from 'lucide-react';

interface ViewControlsProps {
  isAutoRotating: boolean;
  onToggleAutoRotate: () => void;
  onResetView: () => void;
  showMarkers: boolean;
  onToggleMarkers: () => void;
  planetColor?: string;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  isAutoRotating,
  onToggleAutoRotate,
  onResetView,
  showMarkers,
  onToggleMarkers,
  planetColor = '#00F0FF',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="pen-viewport-pill">
      <button
        type="button"
        className={`pen-pill-btn ${isAutoRotating ? 'active' : ''}`}
        style={{ '--pill-accent': planetColor } as React.CSSProperties}
        onClick={onToggleAutoRotate}
        title={isAutoRotating ? 'Pause rotation' : 'Start auto-rotation'}
      >
        <RotateCw size={13} className={isAutoRotating ? 'animate-spin' : ''} />
        <span>Rotate</span>
      </button>

      <div className="pen-pill-divider" />

      <button
        type="button"
        className={`pen-pill-btn ${showMarkers ? 'active' : ''}`}
        style={{ '--pill-accent': planetColor } as React.CSSProperties}
        onClick={onToggleMarkers}
        title={showMarkers ? 'Hide markers' : 'Show markers'}
      >
        <MapPin size={13} />
        <span>Markers</span>
      </button>

      <div className="pen-pill-divider" />

      <button
        type="button"
        className="pen-pill-btn"
        style={{ '--pill-accent': planetColor } as React.CSSProperties}
        onClick={onResetView}
        title="Reset camera orientation"
      >
        <Compass size={13} />
        <span>Reset View</span>
      </button>

      <div className="pen-pill-divider" />

      <button
        type="button"
        className="pen-pill-btn"
        style={{ '--pill-accent': planetColor } as React.CSSProperties}
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
        <span>{isFullscreen ? 'Exit' : 'Full'}</span>
      </button>
    </div>
  );
};
