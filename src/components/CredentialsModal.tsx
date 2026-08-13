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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-zinc-950/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full border border-amber-500/25 shadow-2xl shadow-amber-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Authentication Required</h2>
            <p className="text-xs text-zinc-400">Private GitHub repository detected</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 mb-5 leading-relaxed">
          Please enter your GitHub Username and Personal Access Token (PAT) to clone and process this private repository.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              GitHub Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., octocat"
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Personal Access Token (PAT)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
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
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
              required
            />

            {/* Simple PAT Helper Card */}
            <div className="mt-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-[11px] text-amber-300 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-white flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Need a Personal Access Token?
                </span>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=TranspileAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-yellow-400 hover:text-yellow-300 flex items-center gap-0.5 underline transition-colors shrink-0"
                >
                  Generate Token
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-zinc-400 leading-normal">
                GitHub deprecated passwords for Git in 2021. Ensure your token has the <code className="text-amber-200 font-mono bg-zinc-900 px-1 py-0.5 rounded border border-amber-500/20">repo</code> scope checked.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              Authenticate & Continue
            </button>
          </div>
        </form>
      </div>




    </div>
  );
}