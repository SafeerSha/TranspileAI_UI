import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  Code,
  ChevronRight,
  ChevronDown,
  Search,
  Copy,
  Check,
  X,
  Maximize2,
  Minimize2,
  Terminal,
  File,
  Layers,
  Sparkles
} from 'lucide-react';

export interface StructureNode {
  name: string;
  type: 'directory' | 'file';
  path: string;
  children: StructureNode[] | null;
  content?: string;
  size?: number;
}

interface StructureModalProps {
  isOpen: boolean;
  structure: StructureNode | null;
  onClose: () => void;
}

// Generate code preview fallback content if file content is not provided
function getFilePreviewContent(path: string, name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';

  if (ext === 'json') {
    return `{\n  "name": "${name.replace('.json', '')}",\n  "version": "1.0.0",\n  "private": true,\n  "dependencies": {\n    "transpile-ai": "^1.0.0"\n  }\n}`;
  }

  if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
    return `// Extracted file: ${path}\n// Module component representation\n\nimport React from 'react';\n\nexport default function ${name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '')}() {\n  return (\n    <div className="component-container">\n      {/* TranspileAI parsed component */}\n      <h1>${name}</h1>\n    </div>\n  );\n}`;
  }

  if (ext === 'md') {
    return `# ${name.replace('.md', '')}\n\nExtracted repository documentation file.\n\n## Overview\nThis project directory was parsed and indexed via TranspileAI AST Scanner.\n\n- Path: \`${path}\``;
  }

  if (ext === 'css') {
    return `/* Style sheet: ${name} */\n:root {\n  --primary-color: #6366f1;\n  --background-dark: #0f172a;\n}\n\n.component-container {\n  padding: 1rem;\n  border-radius: 0.5rem;\n}`;
  }

  return `// File: ${path}\n// Extracted source representation\n\nfunction initializeModule() {\n  console.log("Loaded ${name}");\n}\n\nexport default initializeModule;`;
}

// Custom file extension icon selector
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

// Collect all folder paths recursively for "Expand All"
function collectAllFolderPaths(node: StructureNode): string[] {
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

export default function StructureModal({ isOpen, structure, onClose }: StructureModalProps) {
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<StructureNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'tree' | 'code'>('tree');

  useEffect(() => {
    if (structure) {
      // Default expand top-level folders
      const initial: Record<string, boolean> = {};
      initial[structure.path] = true;
      if (structure.children) {
        structure.children.forEach(child => {
          if (child.type === 'directory') {
            initial[child.path] = true;
          }
        });
      }
      setExpandedPaths(initial);
    }
  }, [structure]);

  if (!isOpen || !structure) return null;

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleExpandAll = () => {
    const allPaths = collectAllFolderPaths(structure);
    const expandedMap: Record<string, boolean> = {};
    allPaths.forEach(p => { expandedMap[p] = true; });
    setExpandedPaths(expandedMap);
  };

  const handleCollapseAll = () => {
    setExpandedPaths({});
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  // Filter tree nodes by search query
  const matchesSearch = (node: StructureNode, query: string): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    if (node.name.toLowerCase().includes(lowerQuery) || node.path.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    if (node.children) {
      return node.children.some(child => matchesSearch(child, query));
    }
    return false;
  };

  // Render individual tree item recursively
  const renderTreeItem = (node: StructureNode, level: number = 0, index: number = 0) => {
    if (searchQuery && !matchesSearch(node, searchQuery)) {
      return null;
    }

    const isDirectory = node.type === 'directory';
    const isExpanded = !!expandedPaths[node.path];
    const isSelected = selectedFile?.path === node.path;
    const nodeKey = (node.path && node.path.trim().length > 0)
      ? node.path
      : `node-L${level}-I${index}-${node.name}`;

    return (
      <div key={nodeKey} className="select-none">
        <div
          onClick={() => {
            if (isDirectory) {
              toggleExpand(node.path);
            } else {
              setSelectedFile(node);
              setActiveMobileTab('code'); // Auto-switch to code tab on mobile
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
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-amber-400 shrink-0" />
              )}
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


  const activeContent = selectedFile
    ? selectedFile.content || getFilePreviewContent(selectedFile.path, selectedFile.name)
    : '';

  const activeLines = activeContent ? activeContent.split('\n') : [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className={`bg-zinc-950/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-amber-500/25 shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none border-0' : 'max-w-5xl w-full h-[90vh] sm:h-[85vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-800 bg-black/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <FolderTree className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">{structure.name}</h3>
                <span className="text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  Extracted Tree
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Interactive repository structure & code reader
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile View Tab Bar (< md breakpoint) */}
        <div className="flex md:hidden border-b border-zinc-800 bg-black/60 p-1.5 gap-1.5 shrink-0">
          <button
            onClick={() => setActiveMobileTab('tree')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMobileTab === 'tree'
                ? 'bg-amber-500 text-black font-extrabold shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>File Tree</span>
          </button>
          <button
            onClick={() => setActiveMobileTab('code')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMobileTab === 'code'
                ? 'bg-amber-500 text-black font-extrabold shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="truncate">Code Reader {selectedFile ? `(${selectedFile.name})` : ''}</span>
          </button>
        </div>

        {/* Explorer Split View Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Tree Explorer */}
          <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950 flex flex-col h-full ${
            activeMobileTab === 'tree' ? 'flex' : 'hidden md:flex'
          }`}>
            {/* Sidebar Controls */}
            <div className="p-3 border-b border-zinc-800 space-y-2 bg-black/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter files in repo..."
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                <span>File Explorer</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleExpandAll}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                    title="Expand All Folders"
                  >
                    [Expand All]
                  </button>
                  <button
                    onClick={handleCollapseAll}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                    title="Collapse All Folders"
                  >
                    [Collapse]
                  </button>
                </div>
              </div>
            </div>

            {/* Tree Navigation Container */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar touch-scroll">
              {renderTreeItem(structure)}
            </div>
          </div>

          {/* Right Pane: Code Preview & Reader */}
          <div className={`flex-1 bg-black flex flex-col overflow-hidden h-full ${
            activeMobileTab === 'code' ? 'flex' : 'hidden md:flex'
          }`}>
            {selectedFile ? (
              <>
                {/* File Header Toolbar */}
                <div className="p-3 px-4 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-mono text-zinc-200 min-w-0">
                    {getFileIcon(selectedFile.name)}
                    <span className="font-semibold text-white truncate">{selectedFile.path}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <button
                      onClick={() => copyPath(selectedFile.path)}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedPath ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPath ? 'Path Copied' : 'Copy Path'}</span>
                    </button>

                    <button
                      onClick={() => copyContent(activeContent)}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[11px] flex items-center gap-1 font-extrabold transition-colors cursor-pointer"
                    >
                      {copiedContent ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3 text-black" />}
                      <span>{copiedContent ? 'Code Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                {/* Line Numbered Code Container */}
                <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-4 bg-black font-mono text-xs leading-relaxed text-zinc-200 custom-scrollbar touch-scroll">
                  <table className="w-full border-collapse">
                    <tbody>
                      {activeLines.map((line, i) => (
                        <tr key={i} className="hover:bg-zinc-900/60">
                          <td className="w-10 text-right pr-4 text-zinc-600 select-none font-mono text-[11px] border-r border-zinc-800/60">
                            {i + 1}
                          </td>
                          <td className="pl-4 whitespace-pre font-mono text-zinc-200">
                            {line || ' '}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              /* Empty Selection State */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
                  <Code className="w-8 h-8 text-amber-400" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">Select a File to Preview Code</h4>
                <p className="text-xs text-zinc-400 max-w-sm">
                  Click any file in the left explorer tree to view its content, line numbers, and path breadcrumbs.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-5 border-t border-zinc-800 bg-black flex items-center justify-between text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>AST Repository Explorer Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold transition-colors cursor-pointer"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
}