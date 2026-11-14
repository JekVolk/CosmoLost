import React, { useState } from 'react';
import { RotateCw, Compass, MapPin, Maximize, Minimize } from 'lucide-react';

interface ViewControlsProps {
  isAutoRotating: boolean;
  onToggleAutoRotate: () => void;
  onResetView: () => void;
  showMarkers: boolean;
  onToggleMarkers: () => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  isAutoRotating,
  onToggleAutoRotate,
  onResetView,
  showMarkers,
  onToggleMarkers,
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
    <div className="hud-controls-panel">
      {}
      <button
        type="button"
        className={`hud-btn ${isAutoRotating ? 'active' : ''}`}
        onClick={onToggleAutoRotate}
        title={isAutoRotating ? 'Pause auto-rotation' : 'Start auto-rotation'}
      >
        <RotateCw size={18} className={isAutoRotating ? 'animate-spin' : ''} />
      </button>

      {}
      <button
        type="button"
        className={`hud-btn ${showMarkers ? 'active' : ''}`}
        onClick={onToggleMarkers}
        title={showMarkers ? 'Hide surface markers' : 'Show surface markers'}
      >
        <MapPin size={18} />
      </button>

      {}
      <button
        type="button"
        className="hud-btn"
        onClick={onResetView}
        title="Reset camera view"
      >
        <Compass size={18} />
      </button>

      {}
      <button
        type="button"
        className="hud-btn"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Toggle fullscreen'}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>
    </div>
  );
};
