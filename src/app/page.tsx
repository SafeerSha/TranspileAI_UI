"use client";

import { useState, useEffect } from 'react';
import ProjectService from '../services/projectService';
import ProgressModal from '../components/ProgressModal';
import DownloadModal from '../components/DownloadModal';
import StructureModal from '../components/StructureModal';
import ExtractionModal from '../components/ExtractionModal';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'conversion' | 'generate'>('conversion');
  const [generateType, setGenerateType] = useState<'frontend' | 'backend'>('frontend');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [fromFramework, setFromFramework] = useState('');
  const [searchFrontend, setSearchFrontend] = useState('');
  const [searchBackend, setSearchBackend] = useState('');
  const [searchFrom, setSearchFrom] = useState('');
  const [showFrontendDropdown, setShowFrontendDropdown] = useState(false);
  const [showBackendDropdown, setShowBackendDropdown] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<{message: string, percentage: number} | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showExtractionModal, setShowExtractionModal] = useState(false);
  const [projectData, setProjectData] = useState<{projectId: string, folders: string[], taskId: string} | null>(null);
  const [extractedStructure, setExtractedStructure] = useState<any>(null);
  const [projectService] = useState(() => new ProjectService());

  const [frontendFrameworks, setFrontendFrameworks] = useState<string[]>([
    'React', 'Angular', 'Vue.js', 'Svelte', 'SolidJS', 'Ember.js', 'Backbone.js', 'Preact', 'Alpine.js', 'Lit',
    'Next.js', 'Gatsby', 'Remix', 'Nuxt.js', 'SvelteKit', 'SolidStart', 'Qwik', 'Astro', 'React Native', 'Ionic',
    'NativeScript', 'Expo', 'Flutter', 'Capacitor', 'Framework7', 'Stencil', 'HyperHTML', 'Tailwind CSS', 'Bootstrap',
    'Material UI', 'Ant Design', 'Bulma', 'Foundation', 'Semantic UI', 'Chakra UI', 'DaisyUI', 'Flowbite', 'Redux',
    'Zustand', 'MobX', 'Pinia', 'Vuex', 'Recoil', 'Jotai', 'TanStack Query', 'React Router', 'Marko', 'Fresh',
    'Million.js', 'Melt UI', 'jQuery', 'Knockout.js', 'Dojo', 'MooTools', 'ExtJS'
  ]);
  const [backendFrameworks, setBackendFrameworks] = useState<string[]>([
    'Express', 'Koa', 'Fastify', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'Symfony', 'Rails',
    'Gin', 'Echo', 'Actix', 'Rocket', '.NET Core', 'Micronaut'
  ]);

  useEffect(() => {
    setSelectedFramework('');
    setFromFramework('');
    setSearchFrontend('');
    setSearchBackend('');
    setSearchFrom('');
  }, [mode, generateType]);


  useEffect(() => {
    const initProgress = async () => {
      try {
        await projectService.initializeProgressTracking((message, percentage) => {
          setProgress({ message, percentage });
        });
      } catch (err) {
        console.error('Failed to initialize progress tracking:', err);
      }
    };
    initProgress();
  }, [projectService]);

  useEffect(() => {
    if (progress && progress.percentage >= 100) {
      setShowModal(false);
    }
  }, [progress]);

  const handleExtract = async () => {
    if (!inputText.trim()) {
      setError('Please enter a GitHub URL first');
      return;
    }
    setError('');
    setShowExtractionModal(true);

    // Start extraction in background
    const extractPromise = projectService.extractProjectStructure(inputText.trim());

    // Show animation for 10 seconds
    setTimeout(async () => {
      try {
        const data = await extractPromise;
        setExtractedStructure(data.structure);
        setShowExtractionModal(false);
        setShowStructureModal(true);
      } catch (err) {
        setError('Failed to extract project structure. Please try again.');
        console.error('Extract error:', err);
        setShowExtractionModal(false);
      }
    }, 10000); // 10 seconds
  };

  const handleDownload = async () => {
    if (!projectData) return;
    const blob = await projectService.downloadProject(projectData.projectId);

    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${projectData.projectId}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Close the download modal after download
    setShowDownloadModal(false);
  };

  const handleGo = async () => {
    const githubUrlRegex = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\/.*)?$/i;
    if (mode === 'conversion' && !githubUrlRegex.test(inputText.trim())) {
      setError('Please enter a valid GitHub URL (e.g., https://github.com/username/repo)');
      return;
    }
    if (mode === 'conversion' && !fromFramework) {
      setError('Please select a From Framework');
      return;
    }
    if (!selectedFramework) {
      setError('Please select a framework');
      return;
    }
    setError('');
    setProgress({ message: 'Starting process...', percentage: 0 }); // Reset progress
    setShowModal(true); // Show progress modal
    try {
      const params = {
        githubUrl: mode === 'conversion' ? inputText : undefined,
        mode,
        type: mode === 'generate' ? generateType : undefined,
        targetFramework: selectedFramework.toLowerCase(),
        fromFramework: mode === 'conversion' ? fromFramework.toLowerCase() : undefined,
      };
      const data = await projectService.processProject(params);
      console.log('Process started:', data);

      // Poll for progress updates
      await projectService.pollProgress(data.taskId, (progressData) => {
        setProgress({ message: progressData.message, percentage: progressData.percentage });
      });

      // After polling completes, show download modal
      console.log('Process completed successfully');
      setShowDownloadModal(true);
      setProjectData(data);
    } catch (err) {
      setError('Failed to process request. Please try again.');
      console.error('API error:', err);
      setShowModal(false); // Hide modal on error
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
          StartUply
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl opacity-90">
          Launch your startup ideas with AI-powered code generation. Convert concepts into production-ready applications across multiple frameworks.
        </p>
        <div className="flex space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            ⚡
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            🚀
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            💻
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex items-center justify-center px-4 pb-20">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-2xl w-full border border-white/20">
          <h2 className="text-3xl font-semibold text-white text-center mb-8">Get Started</h2>

          {/* Input GitHub URL */}
          <div className="mb-6">
            <label className="block text-white text-lg mb-2">GitHub Repository URL</label>
            <div className="flex gap-3">
              <input
                type="url"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
              />
              <button
                onClick={handleExtract}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className='flex flex-col'>
                <label>Extract</label>
                <label className='text-xs'>(optional)</label>
                </div>
              </button>
            </div>
            {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
          </div>

          {/* From Framework Selection */}
          {mode === 'conversion' && (
            <div className="mb-6">
              <label className="block text-white text-lg mb-2">From Framework</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  onFocus={() => setShowFromDropdown(true)}
                  onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                  placeholder="Search and select source framework"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                />
                {showFromDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-xl mt-1 max-h-40 overflow-y-auto z-10 shadow-lg">
                    {frontendFrameworks.filter(fw => fw.toLowerCase().includes(searchFrom.toLowerCase())).map(fw => (
                      <div
                        key={fw}
                        onClick={() => {
                          setFromFramework(fw);
                          setSearchFrom(fw);
                          setShowFromDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 first:rounded-t-xl last:rounded-b-xl"
                      >
                        {fw}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-white text-lg mb-3">Choose Mode</label>
            <div className="flex gap-4">
              <button
                onClick={() => setMode('conversion')}
                className={`py-2 px-6 rounded-lg font-medium transition-all ${mode === 'conversion' ? 'bg-purple-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                Conversion
              </button>
              <button
                onClick={() => setMode('generate')}
                className={`py-2 px-6 rounded-lg font-medium transition-all ${mode === 'generate' ? 'bg-purple-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                Generate
              </button>
            </div>
          </div>

          {/* Framework Selection */}
          {mode === 'conversion' && (
            <div className="mb-6">
              <label className="block text-white text-lg mb-2">Select Frontend Framework</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchFrontend}
                  onChange={(e) => setSearchFrontend(e.target.value)}
                  onFocus={() => setShowFrontendDropdown(true)}
                  onBlur={() => setTimeout(() => setShowFrontendDropdown(false), 200)}
                  placeholder="Search and select framework"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                />
                {showFrontendDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-xl mt-1 max-h-40 overflow-y-auto z-10 shadow-lg">
                    {frontendFrameworks.filter(fw => fw.toLowerCase().includes(searchFrontend.toLowerCase())).map(fw => (
                      <div
                        key={fw}
                        onClick={() => {
                          setSelectedFramework(fw);
                          setSearchFrontend(fw);
                          setShowFrontendDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 first:rounded-t-xl last:rounded-b-xl"
                      >
                        {fw}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'generate' && (
            <>
              <div className="mb-6">
                <label className="block text-white text-lg mb-3">Type</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setGenerateType('frontend')}
                    className={`py-2 px-6 rounded-lg font-medium transition-all ${generateType === 'frontend' ? 'bg-purple-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    Frontend
                  </button>
                  <button
                    onClick={() => setGenerateType('backend')}
                    className={`py-2 px-6 rounded-lg font-medium transition-all ${generateType === 'backend' ? 'bg-purple-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    Backend
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-white text-lg mb-2">
                  Select {generateType === 'frontend' ? 'Frontend' : 'Backend'} Framework
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={generateType === 'frontend' ? searchFrontend : searchBackend}
                    onChange={(e) => generateType === 'frontend' ? setSearchFrontend(e.target.value) : setSearchBackend(e.target.value)}
                    onFocus={() => generateType === 'frontend' ? setShowFrontendDropdown(true) : setShowBackendDropdown(true)}
                    onBlur={() => setTimeout(() => {
                      generateType === 'frontend' ? setShowFrontendDropdown(false) : setShowBackendDropdown(false);
                    }, 200)}
                    placeholder={`Search and select ${generateType} framework`}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  />
                  {generateType === 'frontend' && showFrontendDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl mt-1 max-h-40 overflow-y-auto z-10">
                      {frontendFrameworks.filter(fw => fw.toLowerCase().includes(searchFrontend.toLowerCase())).map(fw => (
                        <div
                          key={fw}
                          onClick={() => {
                            setSelectedFramework(fw);
                            setSearchFrontend(fw);
                            setShowFrontendDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white first:rounded-t-xl last:rounded-b-xl"
                        >
                          {fw}
                        </div>
                      ))}
                    </div>
                  )}
                  {generateType === 'backend' && showBackendDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-xl mt-1 max-h-40 overflow-y-auto z-10 shadow-lg">
                      {backendFrameworks.filter(bw => bw.toLowerCase().includes(searchBackend.toLowerCase())).map(bw => (
                        <div
                          key={bw}
                          onClick={() => {
                            setSelectedFramework(bw);
                            setSearchBackend(bw);
                            setShowBackendDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 first:rounded-t-xl last:rounded-b-xl"
                        >
                          {bw}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Go Button */}
          <button
            onClick={handleGo}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Go ✨
          </button>
        </div>
      </div>

      <ProgressModal
        isOpen={showModal}
        progress={progress}
        onClose={() => setShowModal(false)}
      />

      <DownloadModal
        isOpen={showDownloadModal}
        projectData={projectData}
        onDownload={handleDownload}
        onClose={() => setShowDownloadModal(false)}
      />

      <StructureModal
        isOpen={showStructureModal}
        structure={extractedStructure}
        onClose={() => setShowStructureModal(false)}
      />

      <ExtractionModal
        isOpen={showExtractionModal}
        onClose={() => setShowExtractionModal(false)}
      />
    </div>
  );
}
