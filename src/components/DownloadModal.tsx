import React, { useState } from 'react';

interface DownloadModalProps {
  isOpen: boolean;
  projectData: { projectId: string; folders: string[]; taskId: string } | null;
  onDownload: () => void;
  onClose: () => void;
}

interface FolderNode {
  name: string;
  children: FolderNode[];
}

function buildFolderTree(paths: string[]): FolderNode[] {
  const root: FolderNode[] = [];
  const map = new Map<string, FolderNode>();

  // Sort paths to ensure parents come before children
  const sortedPaths = paths.sort();

  sortedPaths.forEach(path => {
    const parts = path.split('/');
    let currentPath = '';
    let parent: FolderNode[] = root;

    parts.forEach((part, index) => {
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
    <div className="font-mono text-white/80">
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        const connector = isLast ? '└─' : '├─';
        const nextPrefix = prefix + (isLast ? '  ' : '│ ');
        return (
          <div key={node.name}>
            {prefix + connector + (node.children.length > 0 ? '📂 ' : '📄 ') + node.name}
            {renderFolderTree(node.children, nextPrefix)}
          </div>
        );
      })}
    </div>
  );
}

export default function DownloadModal({ isOpen, projectData, onDownload, onClose }: DownloadModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || !projectData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-lg w-full mx-4 border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📁</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-4">Project Ready!</h3>
          <p className="text-white text-lg mb-6">Your converted project is ready for download.</p>

          <div className="bg-white/10 rounded-xl p-4 mb-6">
            <h4 className="text-white font-semibold mb-3">Project Structure:</h4>
            <div className="space-y-1">
              {renderFolderTree(buildFolderTree(projectData.folders))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? 'Downloading...' : 'Download Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}