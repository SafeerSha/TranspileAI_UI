import React, { useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackConsole
} from '@codesandbox/sandpack-react';
import { RefreshCw, Monitor, Tablet, Smartphone, Code, Play, Terminal, AlertCircle, FileCode } from 'lucide-react';

interface PreviewSandboxProps {
  files: Record<string, string>;
  isLoading: boolean;
  error?: string | null;
}

export default function PreviewSandbox({ files, isLoading, error }: PreviewSandboxProps) {
  const [activeView, setActiveView] = useState<'split' | 'preview' | 'code'>('split');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showConsole, setShowConsole] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] bg-zinc-950/90 rounded-2xl border border-zinc-800 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
        </div>
        <div>
          <h4 className="text-base font-bold text-white mb-1">Preparing Sandbox Environment...</h4>
          <p className="text-xs text-zinc-400 max-w-sm">
            Fetching project files and assembling WebAssembly live compiler.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-rose-950/20 rounded-2xl border border-rose-500/30 p-6 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-400" />
        <div>
          <h4 className="text-sm font-bold text-white">Failed to Load Sandbox Files</h4>
          <p className="text-xs text-rose-300/80 mt-1 max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  // Format files for Sandpack
  const formattedFiles: Record<string, string> = {};
  
  if (files && Object.keys(files).length > 0) {
    Object.entries(files).forEach(([path, content]) => {
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      formattedFiles[cleanPath] = content;
    });
  } else {
    formattedFiles['/App.tsx'] = `import React from 'react';\n\nexport default function App() {\n  return (\n    <div style={{ padding: 30, fontFamily: 'sans-serif', background: '#09090b', color: '#f4f4f5', minHeight: '100vh' }}>\n      <h1 style={{ color: '#fbbf24' }}>TranspileAI Live Preview</h1>\n      <p>No source files were returned for live execution.</p>\n    </div>\n  );\n}`;
  }

  // Determine template based on file extensions
  let template: 'react-ts' | 'react' | 'vue' | 'svelte' | 'vanilla' = 'react-ts';
  const fileKeys = Object.keys(formattedFiles).map(k => k.toLowerCase());
  
  if (fileKeys.some(k => k.endsWith('.vue'))) {
    template = 'vue';
  } else if (fileKeys.some(k => k.endsWith('.svelte'))) {
    template = 'svelte';
  } else if (!fileKeys.some(k => k.endsWith('.tsx') || k.endsWith('.ts'))) {
    template = 'react';
  }

  const getViewportWidthClass = () => {
    switch (viewport) {
      case 'mobile': return 'max-w-[375px] mx-auto border-x border-zinc-800 shadow-2xl';
      case 'tablet': return 'max-w-[768px] mx-auto border-x border-zinc-800 shadow-xl';
      default: return 'w-full';
    }
  };

  return (
    <div className="space-y-3">
      {/* Sandbox Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 p-2.5 rounded-2xl border border-zinc-800 text-xs">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-black rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveView('split')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'split' ? 'bg-amber-500 text-black font-extrabold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('preview')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'preview' ? 'bg-amber-500 text-black font-extrabold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Live UI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('code')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'code' ? 'bg-amber-500 text-black font-extrabold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code Only</span>
          </button>
        </div>

        {/* Viewport Resizer Controls */}
        {activeView !== 'code' && (
          <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewport === 'desktop' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewport === 'tablet' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewport === 'mobile' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Console Toggle */}
        <button
          type="button"
          onClick={() => setShowConsole(!showConsole)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
            showConsole ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-black border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Console</span>
        </button>
      </div>

      {/* Sandpack Provider & Layout */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <SandpackProvider
          template={template}
          files={formattedFiles}
          theme="dark"
          options={{
            recompileMode: 'delayed',
            recompileDelay: 300,
            classes: {
              'sp-wrapper': 'w-full min-h-[450px]',
              'sp-layout': 'border-0 bg-transparent min-h-[450px]',
              'sp-tab-button': 'text-xs text-zinc-400 hover:text-amber-400',
            }
          }}
        >
          <SandpackLayout className="min-h-[480px]">
            {(activeView === 'split' || activeView === 'code') && (
              <>
                <SandpackFileExplorer className="max-w-[180px] bg-zinc-950 border-r border-zinc-800 font-mono text-xs" />
                <SandpackCodeEditor
                  showLineNumbers
                  showInlineErrors
                  wrapContent
                  closableTabs
                  className="flex-1 min-h-[480px] bg-zinc-950 text-xs font-mono"
                />
              </>
            )}

            {(activeView === 'split' || activeView === 'preview') && (
              <div className={`flex-1 transition-all duration-200 bg-black ${getViewportWidthClass()}`}>
                <SandpackPreview
                  showRefreshButton
                  showOpenInCodeSandbox={false}
                  showRestartButton
                  className="min-h-[480px] w-full"
                />
              </div>
            )}
          </SandpackLayout>

          {showConsole && (
            <div className="border-t border-zinc-800 bg-zinc-950 max-h-48 overflow-y-auto">
              <SandpackConsole />
            </div>
          )}
        </SandpackProvider>
      </div>
    </div>
  );
}
