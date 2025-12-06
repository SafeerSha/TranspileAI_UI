import React from 'react';

interface ExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExtractionModal({ isOpen, onClose }: ExtractionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="extraction-wrapper">
        <div className="extraction-title">Repo Extraction in Progress</div>

        <div className="extraction-transfer">
          {/* Git branch icon */}
          <div className="extraction-git-icon">
            <svg viewBox="0 0 24 24">
              <circle cx="7" cy="5" r="2" />
              <circle cx="7" cy="11" r="2" />
              <circle cx="17" cy="9" r="2" />
              <path d="M7 7v2m0 2v2m2-4h6a2 2 0 002-2" />
            </svg>
          </div>

          {/* Animated files */}
          <div className="extraction-file"></div>
          <div className="extraction-file"></div>
          <div className="extraction-file"></div>

          {/* Destination folder */}
          <div className="extraction-folder">
          </div>
        </div>

        <div className="extraction-status">Extracting...</div>
      </div>
    </div>
  );
}