import { useEffect } from 'react';

interface ProgressModalProps {
  isOpen: boolean;
  progress: { message: string; percentage: number } | null;
  onClose: () => void;
}

export default function ProgressModal({ isOpen, progress, onClose }: ProgressModalProps) {
  useEffect(() => {
    if (progress && progress.percentage >= 100) {
      const timer = setTimeout(onClose, 2000); // Auto-close after 2 seconds when complete
      return () => clearTimeout(timer);
    }
  }, [progress, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="progress-wrapper">
        <div className="progress-title">File Conversion in Progress</div>

        <div className="progress-transfer">
          {/* Left folder */}
          <div className="progress-folder">
          </div>

          {/* Animated files */}
          <div className="progress-file"></div>
          <div className="progress-file"></div>
          <div className="progress-file"></div>

          {/* Right folder */}
          <div className="progress-folder">
          </div>
        </div>

        <div className="progress-status">
          {progress ? progress.message : 'Initializing...'} - {progress ? progress.percentage : 0}% Complete
        </div>

        {progress && progress.percentage >= 100 && (
          <div className="progress-completion">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">✓</span>
            </div>
            <p className="text-green-300 text-sm">Process completed successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}