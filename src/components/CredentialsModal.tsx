import { useState, useEffect } from 'react';
import { ShieldAlert, KeyRound, User, Eye, EyeOff, ExternalLink, HelpCircle, Sparkles, Key, Check } from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  initialTab?: 'git' | 'aiKey';
  savedAiApiKey?: string;
  onClose: () => void;
  onSubmit: (username: string, password: string) => void;
  onSaveAiApiKey?: (aiApiKey: string) => void;
}

export default function CredentialsModal({
  isOpen,
  initialTab = 'git',
  savedAiApiKey = '',
  onClose,
  onSubmit,
  onSaveAiApiKey
}: CredentialsModalProps) {
  const [activeTab, setActiveTab] = useState<'git' | 'aiKey'>(initialTab);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [aiApiKeyInput, setAiApiKeyInput] = useState(savedAiApiKey);
  const [showAiApiKey, setShowAiApiKey] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    setAiApiKeyInput(savedAiApiKey);
  }, [savedAiApiKey]);

  const handleGitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    onSubmit(username.trim(), password.trim());
    onClose();
  };

  const handleAiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = aiApiKeyInput.trim();
    if (!key) return;
    if (onSaveAiApiKey) {
      onSaveAiApiKey(key);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-zinc-950/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full border border-amber-500/25 shadow-2xl shadow-amber-500/10">
        
        {/* Tab Header */}
        <div className="flex bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('git')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'git'
                ? 'bg-amber-500 text-black shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Git Auth</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('aiKey')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'aiKey'
                ? 'bg-amber-500 text-black shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>API Key (BYOK)</span>
          </button>
        </div>

        {activeTab === 'git' ? (
          /* Git Credentials Form */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">GitHub Authentication</h2>
                <p className="text-xs text-zinc-400">Required for private GitHub repositories</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
              Please enter your GitHub Username and Personal Access Token (PAT) to clone private repositories.
            </p>

            <form onSubmit={handleGitSubmit} className="space-y-4">
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
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
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
                    Ensure your token has the <code className="text-amber-200 font-mono bg-zinc-900 px-1 py-0.5 rounded border border-amber-500/20">repo</code> scope checked.
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
                  disabled={!username.trim() || !password.trim()}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Git Credentials
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* API Key Form (BYOK) */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">API Key (BYOK)</h2>
                <p className="text-xs text-amber-400 font-medium">Bypass Free Tier Rate Limits</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
              The default Gemini free tier has rate limits. Enter your own personal Google Gemini API key to run transformation tasks without waiting.
            </p>

            <form onSubmit={handleAiKeySubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Custom API Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAiApiKey(!showAiApiKey)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {showAiApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showAiApiKey ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showAiApiKey ? 'text' : 'password'}
                  required
                  value={aiApiKeyInput}
                  onChange={(e) => setAiApiKeyInput(e.target.value)}
                  placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                />

                <div className="mt-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-[11px] text-amber-300 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-semibold text-white flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Get a Free Gemini Key
                    </span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-yellow-400 hover:text-yellow-300 flex items-center gap-0.5 underline transition-colors shrink-0"
                    >
                      Google AI Studio
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-zinc-400 leading-normal">
                    Free Gemini API keys take 10 seconds to generate in Google AI Studio and provide higher quotas.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2.5 sm:gap-3 pt-2">
                {savedAiApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setAiApiKeyInput('');
                      if (onSaveAiApiKey) onSaveAiApiKey('');
                    }}
                    className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-rose-400 font-semibold text-xs border border-zinc-800 transition-colors cursor-pointer"
                  >
                    Clear Custom Key
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!aiApiKeyInput.trim()}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-amber-500 disabled:hover:to-yellow-500"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save API Key</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}