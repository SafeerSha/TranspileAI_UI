import React from 'react';
import { ShieldCheck, Lock, Database, HardDrive, Sparkles, Check, X, ShieldAlert } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SafetyModal({ isOpen, onClose }: SafetyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-zinc-950/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl max-w-lg w-full border border-amber-500/25 p-5 sm:p-8 shadow-2xl shadow-amber-500/10 max-h-[90vh] overflow-y-auto custom-scrollbar touch-scroll relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Safety, Privacy & Security</h2>
            <p className="text-xs text-amber-400 font-semibold">100% Stateless & Privacy-Guaranteed Architecture</p>
          </div>
        </div>

        {/* Security Commitments Grid */}
        <div className="space-y-4 mb-6">
          
          {/* Card 1: Zero Database */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Database className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Zero Database (Stateless Engine)</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              TranspileAI operates completely statelessly without any backend database (Non-DB architecture). No user profiles, repository histories, or converted code snippets are ever written to disk or stored in databases.
            </p>
          </div>

          {/* Card 2: Zero Code Harvest */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Zero Code Theft or Harvesting Guarantee</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your intellectual property belongs exclusively to you. TranspileAI does not train AI models on your private source code, nor does it harvest, sell, or retain repository files.
            </p>
          </div>

          {/* Card 3: Local Credentials */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Client-Side Credential Storage (BYOK & PAT)</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              GitHub Personal Access Tokens (PAT) and Gemini API Keys (BYOK) reside strictly in your browser&apos;s local memory or <code className="text-amber-300 font-mono bg-black px-1 py-0.5 rounded border border-zinc-800">localStorage</code>. They are never sent to external servers or persisted remotely.
            </p>
          </div>

          {/* Card 4: Ephemeral Processing */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Ephemeral Memory Execution</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Repository parsing and zip archive compilation occur in ephemeral memory tasks. Once your download or GitHub export completes, temporary work directories are automatically purged.
            </p>
          </div>

        </div>

        {/* Verification Summary Badge */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-200 flex items-start gap-2.5 mb-6">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-white block mb-0.5">Enterprise Security & Compliance Ready</span>
            Designed for developers, startups, and enterprises requiring maximum privacy for proprietary codebases.
          </div>
        </div>

        {/* Bottom CTA Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.98] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
        >
          <Check className="w-4 h-4 text-black" />
          <span>I Understand & Agree</span>
        </button>

      </div>
    </div>
  );
}
