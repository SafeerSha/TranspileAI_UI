import React, { useState } from 'react';
import { Download, Github, Check, Copy, ExternalLink, Shield, Code2, FolderTree, AlertCircle, RefreshCw, Eye, EyeOff, RotateCcw, Play, Folder, FolderOpen, ChevronRight, ChevronDown, FileCode, FileText, FileJson, Code, Terminal, File, Search } from 'lucide-react';
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

export interface ExplorerNode {
  name: string;
  type: 'directory' | 'file';
  path: string;
  children: ExplorerNode[] | null;
}

function buildExplorerTree(paths: string[]): ExplorerNode {
  const root: ExplorerNode = { name: 'root', type: 'directory', path: '', children: [] };
  const map = new Map<string, ExplorerNode>();
  map.set('', root);

  const sortedPaths = [...paths].sort();

  sortedPaths.forEach(path => {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const parts = cleanPath.split('/');
    let currentPath = '';
    let parent = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      currentPath += (currentPath ? '/' : '') + part;
      
      let node = map.get(currentPath);
      if (!node) {
        node = {
          name: part,
          type: isFile ? 'file' : 'directory',
          path: currentPath,
          children: isFile ? null : []
        };
        map.set(currentPath, node);
        if (parent.children) {
          parent.children.push(node);
        }
      }
      if (!isFile) {
        parent = node;
      }
    });
  });

  return root;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <FileCode className="w-4 h-4 text-amber-400 shrink-0" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-400 shrink-0" />;
    case 'css':
    case 'scss':
      return <Code className="w-4 h-4 text-amber-500 shrink-0" />;
    case 'md':
      return <FileText className="w-4 h-4 text-zinc-400 shrink-0" />;
    case 'py':
    case 'java':
    case 'cs':
    case 'go':
    case 'rs':
      return <Terminal className="w-4 h-4 text-amber-400 shrink-0" />;
    default:
      return <File className="w-4 h-4 text-zinc-400 shrink-0" />;
  }
}

function collectAllFolderPaths(node: ExplorerNode): string[] {
  let paths: string[] = [];
  if (node.type === 'directory') {
    paths.push(node.path);
    if (node.children) {
      node.children.forEach(child => {
        paths = paths.concat(collectAllFolderPaths(child));
      });
    }
  }
  return paths;
}


export default function DownloadModal({ isOpen, projectData, onDownload, onPushToGithub, onFetchProjectFiles, onClose, onResetProcess }: DownloadModalProps) {
  const [tab, setTab] = useState<'download' | 'github' | 'sandbox'>('download');
  const [isDownloading, setIsDownloading] = useState(false);

  // Sandpack Sandbox State
  const [sandboxFiles, setSandboxFiles] = useState<Record<string, string> | null>(null);
  const [isLoadingSandbox, setIsLoadingSandbox] = useState(false);
  const [sandboxError, setSandboxError] = useState<string | null>(null);

  // Explorer State
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<ExplorerNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  React.useEffect(() => {
    if (projectData?.folders) {
      const initial: Record<string, boolean> = {};
      const root = buildExplorerTree(projectData.folders);
      initial[''] = true;
      if (root.children) {
        root.children.forEach(child => {
          if (child.type === 'directory') {
            initial[child.path] = true;
          }
        });
      }
      setExpandedPaths(initial);
    }
  }, [projectData]);

  // Load sandboxFiles immediately if on download tab to allow file viewing
  React.useEffect(() => {
    if (isOpen && tab === 'download' && projectData?.projectId && !sandboxFiles && !isLoadingSandbox && onFetchProjectFiles) {
      setIsLoadingSandbox(true);
      onFetchProjectFiles(projectData.projectId)
        .then(files => setSandboxFiles(files))
        .catch(err => console.error(err))
        .finally(() => setIsLoadingSandbox(false));
    }
  }, [isOpen, tab, projectData, sandboxFiles, isLoadingSandbox, onFetchProjectFiles]);

  const toggleExpand = (path: string) => setExpandedPaths(prev => ({ ...prev, [path]: !prev[path] }));
  
  const matchesSearch = (node: ExplorerNode, query: string): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    if (node.name.toLowerCase().includes(lowerQuery) || node.path.toLowerCase().includes(lowerQuery)) return true;
    if (node.children) return node.children.some(child => matchesSearch(child, query));
    return false;
  };

  const renderTreeItem = (node: ExplorerNode, level: number = 0, index: number = 0) => {
    if (searchQuery && !matchesSearch(node, searchQuery)) return null;

    const isDirectory = node.type === 'directory';
    const isExpanded = !!expandedPaths[node.path];
    const isSelected = selectedFile?.path === node.path;
    const nodeKey = (node.path && node.path.trim().length > 0) ? node.path : `node-L${level}-I${index}-${node.name}`;

    // Skip rendering root node itself, just render its children
    if (node.name === 'root' && node.path === '') {
      return (
        <div key="root-container">
          {node.children?.map((child, idx) => renderTreeItem(child, 0, idx))}
        </div>
      );
    }

    return (
      <div key={nodeKey} className="select-none">
        <div
          onClick={() => {
            if (isDirectory) {
              toggleExpand(node.path);
            } else {
              setSelectedFile(node);
            }
          }}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer text-xs font-mono transition-colors ${
            isSelected
              ? 'bg-amber-500/20 text-white border border-amber-500/40 font-semibold'
              : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
          }`}
        >
          {isDirectory ? (
            <>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
              {isExpanded ? <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" /> : <Folder className="w-4 h-4 text-amber-400 shrink-0" />}
            </>
          ) : (
            <>
              <span className="w-3.5" />
              {getFileIcon(node.name)}
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {isDirectory && isExpanded && node.children && (
          <div>
            {node.children.map((child, idx) => renderTreeItem(child, level + 1, idx))}
          </div>
        )}
      </div>
    );
  };

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
        tab === 'github' ? 'max-w-xl' : 'max-w-5xl'
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

              {/* Interactive Folder Tree & Code Preview */}
              <div className="flex flex-col md:flex-row h-[400px] bg-zinc-950/90 rounded-2xl border border-zinc-800 overflow-hidden">
                {/* Left: Tree Explorer */}
                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col">
                  <div className="p-2 border-b border-zinc-800 bg-black/40">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Filter files..."
                        className="w-full pl-7 pr-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar touch-scroll">
                    {renderTreeItem(buildExplorerTree(projectData.folders))}
                  </div>
                </div>

                {/* Right: Code Preview */}
                <div className="w-full md:w-2/3 bg-black flex flex-col">
                  {selectedFile ? (
                    <>
                      <div className="p-2 px-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-mono text-zinc-200">
                          {getFileIcon(selectedFile.name)}
                          <span className="font-semibold text-white truncate">{selectedFile.path}</span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto overflow-x-auto p-3 bg-black font-mono text-xs leading-relaxed text-zinc-200 custom-scrollbar touch-scroll">
                        {sandboxFiles ? (
                          sandboxFiles[`/${selectedFile.path}`] !== undefined ? (
                            <table className="w-full border-collapse">
                              <tbody>
                                {sandboxFiles[`/${selectedFile.path}`].split('\n').map((line, i) => (
                                  <tr key={i} className="hover:bg-zinc-900/60">
                                    <td className="w-10 text-right pr-3 text-zinc-600 select-none font-mono text-[11px] border-r border-zinc-800/60">
                                      {i + 1}
                                    </td>
                                    <td className="pl-3 whitespace-pre font-mono text-zinc-200">
                                      {line || ' '}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="text-zinc-500 p-4">File content not available.</div>
                          )
                        ) : (
                          <div className="flex items-center gap-2 text-zinc-500 p-4">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Loading file contents...
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
                        <Code className="w-6 h-6 text-amber-400" />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">Select a File</h4>
                      <p className="text-[11px] text-zinc-400 max-w-[200px]">
                        Click any file in the explorer tree to view its content.
                      </p>
                    </div>
                  )}
                </div>
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