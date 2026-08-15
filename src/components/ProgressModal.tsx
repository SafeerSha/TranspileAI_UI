import { useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  progress: { message: string; percentage: number } | null;
  onClose: () => void;
}

export default function ProgressModal({ isOpen, progress, onClose }: ProgressModalProps) {
  const percentage = progress?.percentage ?? 0;
  const message = progress?.message || 'Starting process...';
  const isComplete = percentage >= 100;

  // Auto-close when backend sends 100% complete
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(onClose, 1800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-950/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-500/30 shadow-2xl shadow-amber-500/10 text-center space-y-5">
        
        {/* Title */}
        <div className="flex items-center justify-center gap-2 text-white font-extrabold text-lg sm:text-xl tracking-tight">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <span>File Conversion in Progress</span>
        </div>

        {/* Animated Folders & File Flight */}
        <div className="progress-transfer justify-center py-4">
          {/* Source Folder */}
          <div className="progress-folder"></div>

          {/* Floating Files */}
          <div className="progress-file"></div>
          <div className="progress-file"></div>
          <div className="progress-file"></div>

          {/* Target Folder */}
          <div className="progress-folder"></div>
        </div>

        {/* Visual Real Progress Bar */}
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-3 overflow-hidden p-0.5 shadow-inner">
          <div
            className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 h-full rounded-full transition-all duration-300 shadow-md shadow-amber-500/50"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Real Backend Status Message & Percentage */}
        <div className="text-xs sm:text-sm font-semibold text-zinc-300 flex items-center justify-between px-1 gap-2">
          <span className="text-amber-400 font-medium truncate max-w-[250px] text-left">
            {message}
          </span>
          <span className="font-extrabold text-amber-400 font-mono text-sm shrink-0">
            {percentage}%
          </span>
        </div>

        {/* Success Completion Message */}
        {isComplete && (
          <div className="pt-2 flex items-center justify-center gap-2 text-amber-400 font-bold text-sm bg-amber-500/10 border border-amber-500/30 py-2.5 px-4 rounded-xl">
            <div className="w-5 h-5 bg-amber-400 text-black rounded-full flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>Codebase Transpiled Successfully!</span>
          </div>
        )}

      </div>
    </div>
  );
}
