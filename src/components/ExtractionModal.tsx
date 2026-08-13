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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-950/90 backdrop-blur-xl rounded-3xl max-w-md w-full border border-white/10 p-6 sm:p-8 shadow-2xl shadow-indigo-500/10 text-center relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-purple-600/30 relative">
          <GitBranch className="w-8 h-8 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-950 flex items-center justify-center text-[9px] font-bold text-slate-950">
            ✓
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-white mb-1">Extracting Repository</h3>
        <p className="text-xs text-slate-400 mb-6">Parsing AST directory structure & file index</p>

        {/* Live Transfer Graphics */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-white/10 mb-6 relative">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <GitBranch className="w-5 h-5" />
              <span className="text-xs font-mono font-bold text-slate-200">GitHub Repo</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping delay-100" />
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping delay-200" />
            </div>

            <div className="flex items-center gap-2 text-purple-400">
              <FolderTree className="w-5 h-5" />
              <span className="text-xs font-mono font-bold text-slate-200">AST Index</span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 mt-4 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(fileCount * 1.5, 95)}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2 text-[11px] font-mono text-slate-400">
            <span>Scanning nodes...</span>
            <span className="text-indigo-300 font-bold">{fileCount} files indexed</span>
          </div>
        </div>

        {/* Stages Tracker */}
        <div className="space-y-2.5 text-left bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2.5 text-xs">
            {step > 1 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
            )}
            <span className={step > 1 ? 'text-slate-300' : 'text-white font-semibold'}>
              1. Cloning GitHub repository
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            {step > 2 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : step === 2 ? (
              <RefreshCw className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
            )}
            <span className={step === 2 ? 'text-white font-semibold' : step > 2 ? 'text-slate-300' : 'text-slate-500'}>
              2. Parsing AST directory layout
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            {step === 3 ? (
              <Cpu className="w-4 h-4 text-pink-400 animate-pulse shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
            )}
            <span className={step === 3 ? 'text-white font-semibold' : 'text-slate-500'}>
              3. Building interactive code reader
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}