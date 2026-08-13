"use client";

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Terminal,
  Github,
  ArrowRight,
  Code2,
  Zap,
  CheckCircle2,
  Layers,
  FolderTree,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  Cpu,
  FileCode
} from 'lucide-react';

import ProjectService from '../services/projectService';
import ProgressModal from '../components/ProgressModal';
import DownloadModal from '../components/DownloadModal';
import StructureModal from '../components/StructureModal';
import ExtractionModal from '../components/ExtractionModal';
import CredentialsModal from '../components/CredentialsModal';

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
  const [progress, setProgress] = useState<{ message: string; percentage: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showExtractionModal, setShowExtractionModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [projectData, setProjectData] = useState<{ projectId: string; folders: string[]; taskId: string } | null>(null);
  const [extractedStructure, setExtractedStructure] = useState<any>(null);
  const [projectService] = useState(() => new ProjectService());
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [pendingOperation, setPendingOperation] = useState<((u?: string, p?: string) => void) | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [frontendFrameworks] = useState<string[]>([
    'React', 'Angular', 'Vue.js', 'Svelte', 'SolidJS', 'Ember.js', 'Backbone.js', 'Preact', 'Alpine.js', 'Lit',
    'Next.js', 'Gatsby', 'Remix', 'Nuxt.js', 'SvelteKit', 'SolidStart', 'Qwik', 'Astro', 'React Native', 'Ionic',
    'NativeScript', 'Expo', 'Flutter', 'Capacitor', 'Framework7', 'Stencil', 'HyperHTML', 'Tailwind CSS', 'Bootstrap',
    'Material UI', 'Ant Design', 'Bulma', 'Foundation', 'Semantic UI', 'Chakra UI', 'DaisyUI', 'Flowbite', 'Redux',
    'Zustand', 'MobX', 'Pinia', 'Vuex', 'Recoil', 'Jotai', 'TanStack Query', 'React Router', 'Marko', 'Fresh',
    'Million.js', 'Melt UI', 'jQuery', 'Knockout.js', 'Dojo', 'MooTools', 'ExtJS'
  ]);

  const [backendFrameworks] = useState<string[]>([
    'Express', 'Koa', 'Fastify', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'Symfony', 'Rails',
    'Gin', 'Echo', 'Actix', 'Rocket', '.NET Core', 'Micronaut'
  ]);

  const popularSourceFrameworks = ['React', 'Vue.js', 'Angular', 'Express', 'Django'];
  const popularTargetFrameworks = ['Next.js', 'Nuxt.js', 'SvelteKit', 'FastAPI', 'Spring Boot'];

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

  const handleExtract = async (customUsername?: string, customPassword?: string) => {
    if (!inputText.trim()) {
      toast.error('Please enter a GitHub URL first');
      return;
    }
    setShowExtractionModal(true);

    const user = typeof customUsername === 'string' ? customUsername : credentials.username;
    const pass = typeof customPassword === 'string' ? customPassword : credentials.password;

    try {
      const data = await projectService.extractProjectStructure(inputText.trim(), user, pass);
      setExtractedStructure(data.structure);
      setShowExtractionModal(false);
      setShowStructureModal(true);
    } catch (err: any) {
      setShowExtractionModal(false);
      if (err.status === 401 || (err.message && (err.message.toLowerCase().includes('authentication') || err.message.toLowerCase().includes('401')))) {
        setPendingOperation(() => (u?: string, p?: string) => handleExtract(u, p));
        setShowCredentialsModal(true);
      } else {
        toast.error(err.message || 'Failed to extract project structure. Please try again.');
        console.error('Extract error:', err);
      }
    }
  };

  const handleDownload = async () => {
    if (!projectData) return;
    const blob = await projectService.downloadProject(projectData.projectId);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${projectData.projectId}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setShowDownloadModal(false);
  };

  const handlePushToGithub = async (params: { repoName: string; isPrivate: boolean; description: string; githubToken: string }) => {
    if (!projectData) throw new Error('No project data available.');
    return await projectService.pushToGithub({
      id: projectData.projectId,
      repoName: params.repoName,
      isPrivate: params.isPrivate,
      description: params.description,
      githubToken: params.githubToken
    });
  };

  const handleGo = async (customUsername?: string, customPassword?: string) => {
    const githubUrlRegex = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\/.*)?$/i;
    if (mode === 'conversion' && !githubUrlRegex.test(inputText.trim())) {
      toast.error('Please enter a valid GitHub URL (e.g., https://github.com/username/repo)');
      return;
    }
    if (mode === 'generate' && generateType === 'backend' && !githubUrlRegex.test(inputText.trim())) {
      toast.error('Please enter a valid GitHub URL for your frontend codebase');
      return;
    }
    if (mode === 'conversion' && !fromFramework) {
      toast.error('Please select a Source Framework');
      return;
    }
    if (!selectedFramework) {
      toast.error('Please select a Target Framework');
      return;
    }

    const user = typeof customUsername === 'string' ? customUsername : credentials.username;
    const pass = typeof customPassword === 'string' ? customPassword : credentials.password;

    setProgress({ message: 'Starting process...', percentage: 0 });
    setShowModal(true);
    try {
      const params = {
        githubUrl: (mode === 'conversion' || (mode === 'generate' && generateType === 'backend')) ? inputText : undefined,
        mode,
        type: mode === 'generate' ? generateType : undefined,
        targetFramework: selectedFramework.toLowerCase(),
        fromFramework: mode === 'conversion' ? fromFramework.toLowerCase() : undefined,
        username: user || undefined,
        password: pass || undefined,
      };
      const data = await projectService.processProject(params);

      await projectService.pollProgress(data.taskId, (progressData) => {
        setProgress({ message: progressData.message, percentage: progressData.percentage });
      });

      setShowDownloadModal(true);
      setProjectData(data);
    } catch (err: any) {
      console.error('API error:', err);
      setShowModal(false);

      if (err.status === 401 || (err.message && (err.message.toLowerCase().includes('authentication') || err.message.toLowerCase().includes('401')))) {
        setPendingOperation(() => (u?: string, p?: string) => handleGo(u, p));
        setShowCredentialsModal(true);
      } else {
        toast.error(err.message || 'Failed to process request. Please try again.');
      }
    }
  };

  const setDemoRepo = (url: string, sourceFw: string, targetFw: string) => {
    setInputText(url);
    setMode('conversion');
    setFromFramework(sourceFw);
    setSearchFrom(sourceFw);
    setSelectedFramework(targetFw);
    setSearchFrontend(targetFw);
    toast.success(`Loaded sample: ${sourceFw} ➔ ${targetFw}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans subtle-grid">
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/90 border-b border-slate-800/80 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">TranspileAI</span>
              <span className="code-pill text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                v1.0 Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SignalR Engine Connected
            </div>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#faqs" className="hover:text-white transition-colors">
              Guide & FAQs
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-8 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Full-Stack Codebase Transpiler & Scaffold Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-5 leading-tight">
          Convert Any Codebase to <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Any Tech Stack
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Port existing GitHub repositories between frameworks or auto-generate complete frontend & backend structures with automated code transformation.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-300 mb-8">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>50+ Frontend Stacks</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>15+ Backend Stacks</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Private Repos Supported</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Instant Zip Export</span>
          </div>
        </div>
      </section>

      {/* Main Guided Form Section */}
      <section className="px-4 pb-20 max-w-3xl mx-auto">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800/80 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-6 h-6 text-indigo-400" />
                Configure Transformation
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Follow the 4 simple guided steps below to convert or generate code.
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-xs text-indigo-400 code-pill uppercase font-semibold">4-Step Guided Setup</span>
            </div>
          </div>

          {/* STEP 1: GitHub URL & Extraction */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm sm:text-base font-semibold text-slate-200 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                GitHub Repository URL
                {mode === 'conversion' && <span className="text-rose-400 text-xs">*Required for conversion</span>}
              </label>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>Public or Private</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Github className="w-5 h-5" />
                </div>
                <input
                  type="url"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm sm:text-base transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => handleExtract()}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white font-medium rounded-xl border border-slate-700 hover:border-indigo-500/40 transition-all flex items-center justify-center gap-2 text-sm shrink-0"
              >
                <FolderTree className="w-4 h-4 text-indigo-400" />
                <span>Extract Structure</span>
              </button>
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Try quick samples:</span>
              <button
                type="button"
                onClick={() => setDemoRepo('https://github.com/facebook/react', 'React', 'Next.js')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-indigo-300 hover:bg-indigo-900/30 hover:text-indigo-200 border border-slate-700/60 transition-all"
              >
                ⚡ React ➔ Next.js
              </button>
              <button
                type="button"
                onClick={() => setDemoRepo('https://github.com/expressjs/express', 'Express', 'FastAPI')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-purple-300 hover:bg-purple-900/30 hover:text-purple-200 border border-slate-700/60 transition-all"
              >
                ⚡ Express ➔ FastAPI
              </button>
            </div>
          </div>

          {/* STEP 2: Choose Mode */}
          <div className="mb-8">
            <label className="block text-sm sm:text-base font-semibold text-slate-200 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs inline-flex items-center justify-center font-bold mr-2">2</span>
              Select Transformation Mode
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setMode('conversion')}
                className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all ${
                  mode === 'conversion'
                    ? 'bg-indigo-600/20 border-indigo-500/80 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${mode === 'conversion' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {mode === 'conversion' ? 'Selected' : 'Select'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Codebase Conversion</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Convert an existing GitHub repository from its current tech stack to a target framework.
                </p>
              </div>

              <div
                onClick={() => setMode('generate')}
                className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all ${
                  mode === 'generate'
                    ? 'bg-indigo-600/20 border-indigo-500/80 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${mode === 'generate' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {mode === 'generate' ? 'Selected' : 'Select'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Auto Generation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate a clean, modular frontend or backend starting structure tailored to a target framework.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 3: Framework Selection */}
          <div className="mb-8">
            <label className="block text-sm sm:text-base font-semibold text-slate-200 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs inline-flex items-center justify-center font-bold mr-2">3</span>
              Select Tech Frameworks
            </label>

            {mode === 'conversion' ? (
              <div className="space-y-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                {/* Source Tech */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      Source Tech (Current Framework)
                    </label>
                    {fromFramework && (
                      <span className="text-xs text-indigo-300 font-medium">Selected: {fromFramework}</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchFrom}
                      onChange={(e) => setSearchFrom(e.target.value)}
                      onFocus={() => setShowFromDropdown(true)}
                      onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                      placeholder="Search or select source tech (e.g. React, Express)"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                    />
                    {showFromDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl mt-1 max-h-48 overflow-y-auto z-30 shadow-2xl">
                        {frontendFrameworks
                          .filter((fw) => fw.toLowerCase().includes(searchFrom.toLowerCase()))
                          .map((fw) => (
                            <div
                              key={fw}
                              onClick={() => {
                                setFromFramework(fw);
                                setSearchFrom(fw);
                                setShowFromDropdown(false);
                              }}
                              className="px-4 py-2.5 hover:bg-indigo-600/30 cursor-pointer text-slate-200 text-sm border-b border-slate-800/50 last:border-0"
                            >
                              {fw}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {/* Quick Pills for Source */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {popularSourceFrameworks.map((fw) => (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => {
                          setFromFramework(fw);
                          setSearchFrom(fw);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          fromFramework === fw
                            ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {fw}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Arrow Bridge */}
                <div className="flex items-center justify-center my-2 text-indigo-400">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span className="px-3 text-xs text-indigo-300 font-mono flex items-center gap-1 bg-slate-900 py-1 rounded-full border border-slate-800">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    Transpile To
                  </span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                {/* Target Tech */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Target Tech (Destination Framework)
                    </label>
                    {selectedFramework && (
                      <span className="text-xs text-purple-300 font-medium">Selected: {selectedFramework}</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchFrontend}
                      onChange={(e) => setSearchFrontend(e.target.value)}
                      onFocus={() => setShowFrontendDropdown(true)}
                      onBlur={() => setTimeout(() => setShowFrontendDropdown(false), 200)}
                      placeholder="Search or select target tech (e.g. Next.js, FastAPI)"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                    />
                    {showFrontendDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl mt-1 max-h-48 overflow-y-auto z-30 shadow-2xl">
                        {frontendFrameworks
                          .filter((fw) => fw.toLowerCase().includes(searchFrontend.toLowerCase()))
                          .map((fw) => (
                            <div
                              key={fw}
                              onClick={() => {
                                setSelectedFramework(fw);
                                setSearchFrontend(fw);
                                setShowFrontendDropdown(false);
                              }}
                              className="px-4 py-2.5 hover:bg-purple-600/30 cursor-pointer text-slate-200 text-sm border-b border-slate-800/50 last:border-0"
                            >
                              {fw}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {/* Quick Pills for Target */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {popularTargetFrameworks.map((fw) => (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => {
                          setSelectedFramework(fw);
                          setSearchFrontend(fw);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          selectedFramework === fw
                            ? 'bg-purple-600 text-white border-purple-500 font-semibold'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {fw}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Generate Mode Sub-types */
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Generation Target Type
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setGenerateType('frontend')}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all border ${
                        generateType === 'frontend'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      💻 Frontend Project
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerateType('backend')}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all border ${
                        generateType === 'backend'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      ⚙️ Backend Service
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Select {generateType === 'frontend' ? 'Frontend' : 'Backend'} Technology
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={generateType === 'frontend' ? searchFrontend : searchBackend}
                      onChange={(e) =>
                        generateType === 'frontend'
                          ? setSearchFrontend(e.target.value)
                          : setSearchBackend(e.target.value)
                      }
                      onFocus={() =>
                        generateType === 'frontend'
                          ? setShowFrontendDropdown(true)
                          : setShowBackendDropdown(true)
                      }
                      onBlur={() =>
                        setTimeout(() => {
                          generateType === 'frontend'
                            ? setShowFrontendDropdown(false)
                            : setShowBackendDropdown(false);
                        }, 200)
                      }
                      placeholder={`Search ${generateType} framework...`}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                    />
                    {generateType === 'frontend' && showFrontendDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl mt-1 max-h-48 overflow-y-auto z-30 shadow-2xl">
                        {frontendFrameworks
                          .filter((fw) => fw.toLowerCase().includes(searchFrontend.toLowerCase()))
                          .map((fw) => (
                            <div
                              key={fw}
                              onClick={() => {
                                setSelectedFramework(fw);
                                setSearchFrontend(fw);
                                setShowFrontendDropdown(false);
                              }}
                              className="px-4 py-2.5 hover:bg-indigo-600/30 cursor-pointer text-slate-200 text-sm border-b border-slate-800/50 last:border-0"
                            >
                              {fw}
                            </div>
                          ))}
                      </div>
                    )}
                    {generateType === 'backend' && showBackendDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl mt-1 max-h-48 overflow-y-auto z-30 shadow-2xl">
                        {backendFrameworks
                          .filter((bw) => bw.toLowerCase().includes(searchBackend.toLowerCase()))
                          .map((bw) => (
                            <div
                              key={bw}
                              onClick={() => {
                                setSelectedFramework(bw);
                                setSearchBackend(bw);
                                setShowBackendDropdown(false);
                              }}
                              className="px-4 py-2.5 hover:bg-indigo-600/30 cursor-pointer text-slate-200 text-sm border-b border-slate-800/50 last:border-0"
                            >
                              {bw}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: Submit Button */}
          <div>
            <button
              type="button"
              onClick={() => handleGo()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Execute Code Transformation</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real-time SignalR progress tracking will monitor the transformation.</span>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 border-t border-slate-800/80 bg-slate-950/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">How TranspileAI Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Automated code transpilation and scaffolding in 3 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 font-bold text-lg border border-indigo-500/20">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Connect Repo & Extract</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Provide your GitHub repository link. Easily extract and inspect the directory structure before transpilation starts.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 relative">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 font-bold text-lg border border-purple-500/20">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Transpilation Engine</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                The backend engine restructures syntax, maps dependencies, and streams real-time progress via SignalR WebSockets.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 font-bold text-lg border border-emerald-500/20">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Download ZIP Archive</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Preview the transformed folder hierarchy and download your complete production-ready project as a ZIP package.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Tech Grid */}
      <section className="py-16 px-4 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Supported Ecosystems</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-8">
            Transpile across modern frontend frameworks, backend microservices, and mobile platforms.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {['React', 'Next.js', 'Vue.js', 'Nuxt.js', 'SvelteKit', 'Angular', 'Remix', 'Astro', 'Express', 'FastAPI', 'Django', 'Spring Boot', 'Laravel', 'Gin', 'Actix', '.NET Core', 'React Native', 'Flutter', 'Tailwind CSS'].map((tech) => (
              <span
                key={tech}
                className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium hover:border-indigo-500/50 hover:text-white transition-all cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Guide & FAQ Accordion Section */}
      <section id="faqs" className="py-16 px-4 border-t border-slate-800/80 bg-slate-950/80">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-400" />
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">Quick guidance on common features and repository handling.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Do private GitHub repositories work?",
                a: "Yes! If authentication is required, TranspileAI will automatically prompt you for your GitHub credentials or Personal Access Token (PAT) securely."
              },
              {
                q: "What is the Extract Structure feature?",
                a: "Clicking 'Extract Structure' fetches and parses the folder/file hierarchy of the target repository so you can inspect its contents in an interactive tree view before converting."
              },
              {
                q: "How does real-time progress tracking work?",
                a: "The application establishes a SignalR WebSocket connection to stream live updates and percentage progress from the backend transformation hub."
              },
              {
                q: "What format will I receive the output in?",
                a: "Once complete, you can preview the generated folder tree and download the whole transformed project as a ready-to-run ZIP archive."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-white font-medium text-sm sm:text-base hover:bg-slate-900/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-indigo-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">TranspileAI Engine</span>
            <span>— Codebase & Tech Stack Converter</span>
          </div>
          <div>
            <span>Powered by Next.js & SignalR WebSockets</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProgressModal
        isOpen={showModal}
        progress={progress}
        onClose={() => setShowModal(false)}
      />

      <DownloadModal
        isOpen={showDownloadModal}
        projectData={projectData}
        onDownload={handleDownload}
        onPushToGithub={handlePushToGithub}
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

      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        onSubmit={(username, password) => {
          setCredentials({ username, password });
          setShowCredentialsModal(false);
          if (pendingOperation) {
            pendingOperation(username, password);
            setPendingOperation(null);
          }
        }}
      />

      <Toaster position="bottom-right" />
    </div>
  );
}
