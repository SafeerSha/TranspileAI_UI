import React from 'react';

interface StructureNode {
  name: string;
  type: 'directory' | 'file';
  path: string;
  children: StructureNode[] | null;
}

interface StructureModalProps {
  isOpen: boolean;
  structure: StructureNode | null;
  onClose: () => void;
}

function renderStructureTree(node: StructureNode, prefix: string = ''): React.ReactElement {
  const isLast = !node.children || node.children.length === 0;
  const connector = isLast ? '└─' : '├─';
  const nextPrefix = prefix + (isLast ? '  ' : '│ ');

  return (
    <div>
      <div>
        {prefix + connector + (node.type === 'directory' ? '📂 ' : '📄 ') + node.name}
      </div>
      {node.children && node.children.map((child, index) => (
        <div key={child.path}>
          {renderStructureTree(child, index === node.children!.length - 1 ? prefix + '  ' : nextPrefix)}
        </div>
      ))}
    </div>
  );
}

export default function StructureModal({ isOpen, structure, onClose }: StructureModalProps) {
  if (!isOpen || !structure) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-2xl w-full mx-4 border border-white/20 max-h-[80vh] overflow-y-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📁</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-4">Project Structure</h3>
          <p className="text-white text-lg mb-6">Extracted from the GitHub repository</p>

          <div className="bg-white/10 rounded-xl p-4 mb-6">
            <h4 className="text-white font-semibold mb-3">Repository Structure:</h4>
            <div className="text-left">
              <pre className="font-mono text-white whitespace-pre-wrap text-sm">
                {renderStructureTree(structure)}
              </pre>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}