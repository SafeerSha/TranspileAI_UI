import { useState } from 'react';
import { ShieldAlert, KeyRound, User, Eye, EyeOff, ExternalLink, HelpCircle } from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string, password: string) => void;
}

export default function CredentialsModal({ isOpen, onClose, onSubmit }: CredentialsModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password);
    setUsername('');
    setPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-950/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/10 shadow-2xl shadow-indigo-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Authentication Required</h2>
            <p className="text-xs text-slate-400">Private GitHub repository detected</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Please enter your GitHub Username and Personal Access Token (PAT) to clone and process this private repository.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              GitHub Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., octocat"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                Personal Access Token (PAT)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    Show
                  </>
                )}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />

            {/* Simple PAT Helper Card */}
            <div className="mt-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-[11px] text-indigo-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  Need a Personal Access Token?
                </span>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=TranspileAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-400 hover:text-white flex items-center gap-0.5 underline transition-colors shrink-0"
                >
                  Generate Token
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-400 leading-normal">
                GitHub deprecated passwords for Git in 2021. Ensure your token has the <code className="text-indigo-200 font-mono bg-slate-900 px-1 py-0.5 rounded border border-indigo-500/20">repo</code> scope checked.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 hover:scale-[1.02] active:scale-[0.98] text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all"
            >
              Authenticate & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}