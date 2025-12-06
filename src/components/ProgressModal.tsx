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
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-2xl">⚡</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-4">Processing Your Request</h3>

          {progress ? (
            <>
              <p className="text-white text-lg mb-6">{progress.message}</p>

              <div className="w-full bg-white/20 rounded-full h-6 mb-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-6 rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${progress.percentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>

              <p className="text-white text-sm font-medium">{progress.percentage}% Complete</p>

              {progress.percentage >= 100 && (
                <div className="mt-6">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <p className="text-green-300 text-sm">Process completed successfully!</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}