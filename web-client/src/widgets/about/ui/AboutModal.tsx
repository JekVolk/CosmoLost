import React from 'react';
import { X, Sparkles, ExternalLink, Globe, Database, Cpu, Award } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="pen-modal-backdrop" onClick={onClose}>
      <div className="pen-modal-card about" onClick={(e) => e.stopPropagation()}>
        <div className="pen-modal-header">
          <div className="pen-about-title-group">
            <div className="pen-about-badge">
              <Sparkles size={12} className="text-cyan-400" />
              <span>NASA SPACE APPS 2026</span>
            </div>
            <h3 className="pen-about-title">About CosmoLost</h3>
          </div>
          <button type="button" onClick={onClose} className="pen-modal-close">
            <X size={18} />
          </button>
        </div>

        <div className="pen-about-body">
          <p className="pen-about-lead">
            <strong>CosmoLost</strong> is an interactive digital preservation portal and 3D telemetry explorer documenting abandoned, defunct, and historic space hardware resting across the lunar surface and martian terrain.
          </p>

          <div className="pen-about-grid">
            <div className="pen-about-feature">
              <Globe size={18} className="text-cyan-400" />
              <div>
                <h4>Interactive Celestial Exploration</h4>
                <p>True-to-scale 3D planetary models with high-resolution USGS/LROC textures, atmosphere shaders, and collision-free coordinate mapping.</p>
              </div>
            </div>

            <div className="pen-about-feature">
              <Database size={18} className="text-cyan-400" />
              <div>
                <h4>Verified Archival Telemetry</h4>
                <p>Curated from NASA Planetary Data System (PDS), JPL Mission Archives, NSSDCA Master Catalog, and orbital imagery.</p>
              </div>
            </div>

            <div className="pen-about-feature">
              <Cpu size={18} className="text-cyan-400" />
              <div>
                <h4>AI Gateway & OpenAPI Portal</h4>
                <p>Integrated FastMCP backend with real-time video community feeds, structured artifact specs, and automated telemetry search.</p>
              </div>
            </div>

            <div className="pen-about-feature">
              <Award size={18} className="text-cyan-400" />
              <div>
                <h4>Preserving Space Heritage</h4>
                <p>Protecting historical sites like Apollo 11 Tranquility Base, Lunokhod rovers, Spirit, and Opportunity from being forgotten.</p>
              </div>
            </div>
          </div>

          <div className="pen-about-footer">
            <a
              href="https://www.spaceappschallenge.org/"
              target="_blank"
              rel="noreferrer"
              className="pen-about-link"
            >
              <span>NASA Space Apps Challenge</span>
              <ExternalLink size={13} />
            </a>
            <span className="pen-about-version">v2.4.0 • Built with Three.js & React</span>
          </div>
        </div>
      </div>
    </div>
  );
};
