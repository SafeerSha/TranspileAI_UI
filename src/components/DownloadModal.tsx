import React, { useState } from 'react';
import { Download, Github, Check, Copy, ExternalLink, Shield, Code2, FolderTree, AlertCircle, RefreshCw, Eye, EyeOff, RotateCcw, Play } from 'lucide-react';
import PreviewSandbox from './PreviewSandbox';

interface DownloadModalProps {
  isOpen: boolean;
  projectData: { projectId: string; folders: string[]; taskId: string } | null;
  onDownload: () => void;
  onPushToGithub: (params: { repoName: string; isPrivate: boolean; description: string; githubToken: string }) => Promise<{ repoUrl: string; cloneUrl: string }>;
  onFetchProjectFiles?: (projectId: string) => Promise<Record<string, string>>;
  onClose: () => void;
  onResetProcess?: () => void;
}

interface FolderNode {
  name: string;
  children: FolderNode[];
}

function buildFolderTree(paths: string[]): FolderNode[] {
  const root: FolderNode[] = [];
  const map = new Map<string, FolderNode>();

  const sortedPaths = [...paths].sort();

  sortedPaths.forEach(path => {
    const parts = path.split('/');
    let currentPath = '';
    let parent: FolderNode[] = root;

    parts.forEach(part => {
      currentPath += (currentPath ? '/' : '') + part;
      let node = map.get(currentPath);
      if (!node) {
        node = { name: part, children: [] };
        map.set(currentPath, node);
        parent.push(node);
      }
      parent = node.children;
    });
  });

  return root;
}

function renderFolderTree(nodes: FolderNode[], prefix: string = ''): React.ReactElement {
  return (
    <pre className="font-mono text-slate-200 text-xs whitespace-pre-wrap leading-relaxed">
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        const connector = isLast ? '└─ ' : '├─ ';
        const nextPrefix = prefix + (isLast ? '   ' : '│  ');
        const itemKey = `${prefix}-${node.name}-${index}`;
        return (
          <div key={itemKey} className="py-0.5">
            <span className="text-slate-500">{prefix + connector}</span>
            <span className="text-amber-400 mr-1">📂</span>
            <span className="text-slate-100 font-medium">{node.name}</span>
            {renderFolderTree(node.children, nextPrefix)}
          </div>
        );
      })}
    </pre>
  );
}


export default function DownloadModal({ isOpen, projectData, onDownload, onPushToGithub, onFetchProjectFiles, onClose, onResetProcess }: DownloadModalProps) {
  const [tab, setTab] = useState<'download' | 'github' | 'sandbox'>('download');
  const [isDownloading, setIsDownloading] = useState(false);

  // Sandpack Sandbox State
  const [sandboxFiles, setSandboxFiles] = useState<Record<string, string> | null>(null);
  const [isLoadingSandbox, setIsLoadingSandbox] = useState(false);
  const [sandboxError, setSandboxError] = useState<string | null>(null);

  // GitHub Push Form State
  const [repoName, setRepoName] = useState('my-converted-app');
  const [isPrivate, setIsPrivate] = useState(true);
  const [description, setDescription] = useState('Generated with TranspileAI');
  const [githubToken, setGithubToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('github_pat') || sessionStorage.getItem('git_password') || '';
    }
    return '';
  });
  const [showToken, setShowToken] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ repoUrl: string; cloneUrl: string } | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const updateGithubToken = (token: string) => {
    setGithubToken(token);
    if (typeof window !== 'undefined') {
      if (token.trim()) {
        sessionStorage.setItem('github_pat', token.trim());
      } else {
        sessionStorage.removeItem('github_pat');
      }
    }
  };

  const handleClearToken = () => {
    updateGithubToken('');
  };

  const handleSelectTab = async (targetTab: 'download' | 'github' | 'sandbox') => {
    setTab(targetTab);
    if (targetTab === 'sandbox' && !sandboxFiles && projectData?.projectId && onFetchProjectFiles) {
      setIsLoadingSandbox(true);
      setSandboxError(null);
      try {
        const files = await onFetchProjectFiles(projectData.projectId);
        setSandboxFiles(files);
      } catch (err: any) {
        setSandboxError(err.message || 'Failed to fetch files for live sandbox.');
      } finally {
        setIsLoadingSandbox(false);
      }
    }
  };

  if (!isOpen || !projectData) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePushToGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokenToUse = githubToken.trim();
    if (!tokenToUse) {
      setPushError('GitHub Personal Access Token (PAT) is required.');
      return;
    }
    if (!repoName.trim()) {
      setPushError('Repository Name is required.');
      return;
    }

    setIsPushing(true);
    setPushError(null);
    setPushResult(null);

    // Save token to sessionStorage on submit
    updateGithubToken(tokenToUse);

    try {
      const result = await onPushToGithub({
        repoName: repoName.trim(),
        isPrivate,
        description: description.trim(),
        githubToken: tokenToUse
      });
      setPushResult(result);
    } catch (err: any) {
      setPushError(err.message || 'Failed to push repository to GitHub.');
    } finally {
      setIsPushing(false);
    }
  };

  const copyCloneCommand = () => {
    const cloneTarget = pushResult?.cloneUrl || (pushResult?.repoUrl ? `${pushResult.repoUrl}.git` : `https://github.com/user/${repoName}.git`);
    navigator.clipboard.writeText(`git clone ${cloneTarget}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
      <div className={`bg-zinc-950/95 backdrop-blur-xl rounded-3xl w-full border border-amber-500/25 shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[92vh] transition-all duration-300 ${
        tab === 'sandbox' ? 'max-w-5xl' : 'max-w-xl'
      }`}>
        {/* Header with Title & Mode Switcher */}
        <div className="p-5 sm:p-6 pb-4 sm:pb-5 border-b border-zinc-800 bg-black/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-500 flex items-center justify-center text-black font-extrabold shadow-lg shadow-amber-500/30">
                <Code2 className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Project Ready for Export</h3>
                <p className="text-xs text-zinc-400">Download ZIP, push to GitHub, or run live in browser sandbox</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tab Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-zinc-900/90 rounded-2xl border border-zinc-800">
            <button
              onClick={() => handleSelectTab('download')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                tab === 'download'
                  ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <span>📁 ZIP File</span>
            </button>
            <button
              onClick={() => handleSelectTab('github')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                tab === 'github'
                  ? 'bg-yellow-500 text-black font-extrabold shadow-lg shadow-yellow-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Push</span>
            </button>
            <button
              onClick={() => handleSelectTab('sandbox')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                tab === 'sandbox'
                  ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>⚡ Live UI Sandbox</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {tab === 'download' ? (
            /* ZIP Download Tab View */
            <div className="space-y-5">
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 text-xs text-amber-300 flex items-start gap-3">
                <FolderTree className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">ZIP Package Built Successfully</span>
                  <p className="mt-0.5 text-zinc-300">
                    Your transformed file structure is compressed and ready to download.
                  </p>
                </div>
              </div>

              {/* Folder Tree Display */}
              <div className="bg-zinc-950/90 rounded-2xl p-3.5 sm:p-4 border border-zinc-800 max-h-60 overflow-y-auto overflow-x-auto custom-scrollbar touch-scroll">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-800 text-xs font-semibold text-zinc-400">
                  <span>Generated Files & Folders</span>
                  <span>{projectData.folders.length} root items</span>
                </div>
                {renderFolderTree(buildFolderTree(projectData.folders))}
              </div>

              {/* Download Tab Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
                {onResetProcess && (
                  <button
                    onClick={onResetProcess}
                    className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 font-semibold text-xs border border-zinc-800 hover:border-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>New Process</span>
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.98] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-black" />
                      Download ZIP Archive
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : tab === 'github' ? (
            /* GitHub Push Tab View */
            <div>
              {pushResult ? (
                /* Success View */
                <div className="space-y-6 text-center py-2">
                  <div className="w-16 h-16 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-white mb-1">
                      GitHub Repository Created Successfully!
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Your codebase has been pushed directly to your GitHub account.
                    </p>
                  </div>

                  {/* Open Repository Button */}
                  <div>
                    <a
                      href={pushResult.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.98] text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all"
                    >
                      <span>Open Repository on GitHub</span>
                      <ExternalLink className="w-4 h-4 text-black" />
                    </a>
                  </div>

                  {/* Interactive Clone Code Box */}
                  <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 text-left space-y-2">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Clone Command
                    </span>
                    <div className="flex items-center justify-between gap-2 bg-black px-3.5 py-2.5 rounded-xl border border-zinc-800 font-mono text-xs text-amber-400">
                      <span className="truncate">
                        git clone {pushResult.cloneUrl || (pushResult.repoUrl ? `${pushResult.repoUrl}.git` : `https://github.com/user/${repoName}.git`)}
                      </span>
                      <button
                        onClick={copyCloneCommand}
                        type="button"
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white transition-colors shrink-0 flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-400 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Close & New Process buttons */}
                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-700 transition-colors cursor-pointer"
                    >
                      Close Window
                    </button>
                    {onResetProcess && (
                      <button
                        onClick={onResetProcess}
                        className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-black" />
                        <span>Start New Process</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Form Controls View */
                <form onSubmit={handlePushToGithub} className="space-y-4">
                  {pushError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{pushError}</span>
                    </div>
                  )}

                  {/* Repository Name Input */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Repository Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder="my-converted-app"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  {/* Repository Visibility Switcher */}
                  <div className="flex items-center justify-between bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="text-xs font-semibold text-zinc-200 block">Repository Visibility</span>
                        <span className="text-[11px] text-zinc-400">Choose public or private visibility</span>
                      </div>
                    </div>
                    <div className="flex gap-1 p-1 bg-black rounded-xl border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setIsPrivate(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          !isPrivate ? 'bg-amber-500 text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPrivate(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isPrivate ? 'bg-amber-500 text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Private
                      </button>
                    </div>
                  </div>

                  {/* GitHub Personal Access Token (PAT) Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        GitHub Personal Access Token (PAT) <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        {githubToken && (
                          <button
                            type="button"
                            onClick={handleClearToken}
                            className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                          >
                            Clear Token
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowToken(!showToken)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {showToken ? (
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
                    </div>
                    <input
                      type={showToken ? 'text' : 'password'}
                      required
                      value={githubToken}
                      onChange={(e) => updateGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Saved during active session. Requires 'repo' scope.
                    </p>
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Description <span className="text-zinc-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Repository description"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPushing}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isPushing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-black" />
                          Pushing to GitHub...
                        </>
                      ) : (
                        <>
                          <Github className="w-4 h-4 text-black" />
                          Create & Push to GitHub
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Sandpack Live UI Sandbox Tab View */
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3.5 text-xs text-amber-300 flex items-start gap-3">
                <Play className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Live Executable In-Browser Preview</span>
                  <p className="mt-0.5 text-zinc-300 leading-relaxed">
                    Transpiled code is compiled live in WebAssembly using Sandpack. Test UI responsiveness, view source files, and execute live interactions.
                  </p>
                </div>
              </div>

              <PreviewSandbox
                files={sandboxFiles || {}}
                isLoading={isLoadingSandbox}
                error={sandboxError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}