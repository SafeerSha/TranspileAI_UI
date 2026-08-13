import React, { useEffect, useState } from 'react';
import { GitBranch, FolderTree, Cpu, CheckCircle2, RefreshCw } from 'lucide-react';

interface ExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExtractionModal({ isOpen }: ExtractionModalProps) {
  const [step, setStep] = useState(1);
  const [fileCount, setFileCount] = useState(12);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFileCount(12);
      return;
    }

    const step1Timer = setTimeout(() => setStep(2), 2500);
    const step2Timer = setTimeout(() => setStep(3), 6000);

    const counterInterval = setInterval(() => {
      setFileCount(prev => prev + Math.floor(Math.random() * 5) + 2);
    }, 600);

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearInterval(counterInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-zinc-950/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl max-w-md w-full border border-amber-500/25 p-5 sm:p-8 shadow-2xl shadow-amber-500/10 text-center relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Icon Badge */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-500 flex items-center justify-center text-black mx-auto mb-4 sm:mb-5 shadow-lg shadow-amber-500/30 relative">
          <GitBranch className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse text-black" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full border-2 border-black flex items-center justify-center text-[9px] font-extrabold text-black">
            ✓
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-white mb-1">Extracting Repository</h3>
        <p className="text-xs text-zinc-400 mb-5 sm:mb-6">Parsing AST directory structure & file index</p>

        {/* Live Transfer Graphics */}
        <div className="bg-zinc-900/90 rounded-2xl p-3.5 sm:p-5 border border-zinc-800 mb-5 sm:mb-6 relative">
          <div className="flex items-center justify-between px-2 sm:px-4 py-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-amber-400">
              <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-[11px] sm:text-xs font-mono font-bold text-zinc-200">GitHub Repo</span>
            </div>

          
            <div className="flex items-center gap-2 text-amber-300">
              <FolderTree className="w-5 h-5" />
              <span className="text-xs font-mono font-bold text-zinc-200">AST Index</span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-black rounded-full h-2 mt-4 overflow-hidden border border-zinc-800">
            <div
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(fileCount * 1.5, 95)}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2 text-[11px] font-mono text-zinc-400">
            <span>Scanning nodes...</span>
            <span className="text-amber-400 font-bold">{fileCount} files indexed</span>
          </div>
        </div>

        {/* Stages Tracker */}
        <div className="space-y-2.5 text-left bg-black/60 p-4 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-2.5 text-xs">
            {step > 1 ? (
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            )}
            <span className={step > 1 ? 'text-zinc-300' : 'text-white font-semibold'}>
              1. Cloning GitHub repository
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            {step > 2 ? (
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            ) : step === 2 ? (
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
            )}
            <span className={step === 2 ? 'text-white font-semibold' : step > 2 ? 'text-zinc-300' : 'text-zinc-500'}>
              2. Parsing AST directory layout
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            {step === 3 ? (
              <Cpu className="w-4 h-4 text-yellow-400 animate-pulse shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
            )}
            <span className={step === 3 ? 'text-white font-semibold' : 'text-zinc-500'}>
              3. Building interactive code reader
            </span>
          </div>
        </div>
      </div>
    </div>



  );
}