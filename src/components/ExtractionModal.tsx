import React from 'react';

interface ExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExtractionModal({ isOpen, onClose }: ExtractionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-lg w-full mx-4 border border-white/20">
        <div className="text-center">
          <div className="relative w-full h-32 mx-auto mb-6 flex items-center justify-center">
            {/* Left Folder */}
            <div className="absolute left-0 text-4xl animate-pulse">📁</div>

            {/* Right Folder */}
            <div className="absolute right-0 text-4xl animate-pulse">📁</div>

            {/* Floating Files */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-0 top-4 text-2xl animate-float" style={{ animationDelay: '0s', animationDuration: '3s' }}>📄</div>
              <div className="absolute left-0 top-8 text-2xl animate-float" style={{ animationDelay: '1s', animationDuration: '3s' }}>📄</div>
              <div className="absolute left-0 top-12 text-2xl animate-float" style={{ animationDelay: '2s', animationDuration: '3s' }}>📄</div>
              <div className="absolute left-0 top-16 text-2xl animate-float" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>📄</div>
              <div className="absolute left-0 top-20 text-2xl animate-float" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>📄</div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-4">Extracting Repository</h3>
          <p className="text-white text-lg mb-6">Analyzing project structure...</p>

          <div className="w-full bg-white/20 rounded-full h-2 mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>

          <p className="text-white text-sm">This will take a few seconds</p>
        </div>
      </div>
    </div>
  );
}