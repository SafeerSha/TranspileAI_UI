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
  FileCode,
  RotateCcw,
  X,
  KeyRound,
  Menu,
  Sparkles,
  Loader2
} from 'lucide-react';

import ProjectService, { detectTechFromTree, DetectedTech } from '../services/projectService';
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
  const [detectedTech, setDetectedTech] = useState<DetectedTech | null>(null);
  const [isDetectingTech, setIsDetectingTech] = useState(false);
  const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState('');
  const [projectService] = useState(() => new ProjectService());
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [pendingOperation, setPendingOperation] = useState<((u?: string, p?: string) => void) | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const autoDetectRepoTech = async (url: string, customUsername?: string, customPassword?: string) => {
    const githubUrlRegex = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\/.*)?$/i;
    const trimmedUrl = url.trim();
    if (!githubUrlRegex.test(trimmedUrl) || trimmedUrl === lastAnalyzedUrl) return;

    setIsDetectingTech(true);
    setLastAnalyzedUrl(trimmedUrl);

    const user = typeof customUsername === 'string' ? customUsername : credentials.username;
    const pass = typeof customPassword === 'string' ? customPassword : credentials.password;

    try {
      const data = await projectService.extractProjectStructure(trimmedUrl, user, pass);
      setExtractedStructure(data.structure);

      const tech = data.detectedTech && data.detectedTech.name !== 'Unknown'
        ? data.detectedTech
        : detectTechFromTree(data.structure);

      if (tech && tech.name !== 'Unknown') {
        setDetectedTech(tech);
        setFromFramework(tech.name);
        setSearchFrom(tech.name);
        toast.success(`✨ Detected project technology: ${tech.name}! Pre-filled as Source Tech.`);
      }
    } catch (err: any) {
      if (err.status === 401 || (err.message && (err.message.toLowerCase().includes('authentication') || err.message.toLowerCase().includes('401')))) {
        setPendingOperation(() => (u?: string, p?: string) => autoDetectRepoTech(trimmedUrl, u, p));
        setShowCredentialsModal(true);
      }
    } finally {
      setIsDetectingTech(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const githubUrlRegex = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\/.*)?$/i;
      if (githubUrlRegex.test(inputText.trim())) {
        autoDetectRepoTech(inputText.trim());
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputText, credentials]);


  const [frontendFrameworks] = useState<string[]>([
    'React', 'Angular', 'Vue.js', 'Svelte', 'SolidJS', 'Ember.js', 'Backbone.js', 'Preact', 'Alpine.js', 'Lit',
    'Next.js', 'Gatsby', 'Remix', 'Nuxt.js', 'SvelteKit', 'SolidStart', 'Qwik', 'Astro', 'React Native', 'Ionic',
    'NativeScript', 'Expo', 'Flutter', 'Capacitor', 'Framework7', 'Stencil', 'HyperHTML', 'Tailwind CSS', 'Bootstrap',
    'Material UI', 'Ant Design', 'Bulma', 'Foundation', 'Semantic UI', 'Chakra UI', 'DaisyUI', 'Flowbite', 'Redux',
    'Zustand', 'MobX', 'Pinia', 'Vuex', 'Recoil', 'Jotai', 'TanStack Query', 'React Router', 'Marko', 'Fresh',
    'Million.js', 'Melt UI', 'jQuery', 'Knockout.js', 'Dojo', 'MooTools', 'ExtJS'
  ]);

  const [backendFrameworks] = useState<string[]>([
    'Express', 'NestJS', 'Koa', 'Fastify', 'Hono', 'ElysiaJS', 'AdonisJS', 'Sails.js', 'FeathersJS',
    'Spring Boot', 'Spring MVC', 'Quarkus', 'Micronaut', 'Jakarta EE',
    '.NET / ASP.NET Core', '.NET Web API', '.NET Core', 'Blazor Server',
    'Django', 'FastAPI', 'Flask', 'Tornado', 'Pyramid', 'Litestar',
    'Laravel', 'Symfony', 'CodeIgniter', 'CakePHP', 'Yii',
    'Ruby on Rails', 'Sinatra', 'Hanami',
    'Gin', 'Echo', 'Fiber', 'Chi', 'Beego',
    'Actix Web', 'Axum', 'Rocket', 'Warp',
    'Ktor', 'Phoenix'
  ]);

  const allFrameworks = Array.from(new Set([...frontendFrameworks, ...backendFrameworks])).sort((a, b) => a.localeCompare(b));

  const popularSourceFrameworks = ['React', 'Vue.js', 'Express', 'Spring Boot', '.NET / ASP.NET Core', 'Django', 'Laravel'];
  const popularTargetFrameworks = ['Next.js', 'Nuxt.js', 'Spring Boot', '.NET / ASP.NET Core', 'FastAPI', 'NestJS'];

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

      const tech = data.detectedTech && data.detectedTech.name !== 'Unknown'
        ? data.detectedTech
        : detectTechFromTree(data.structure);

      if (tech && tech.name !== 'Unknown') {
        setDetectedTech(tech);
        setFromFramework(tech.name);
        setSearchFrom(tech.name);
        toast.success(`✨ Auto-detected technology stack: ${tech.name}! Pre-filled as Source Tech.`);
      }

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
    setLastAnalyzedUrl(url);
    setDetectedTech({
      name: sourceFw,
      category: 'general',
      confidence: 'high',
      summary: `Sample preset: ${sourceFw}`
    });
    toast.success(`Loaded sample: ${sourceFw} ➔ ${targetFw}`);
  };

  const handleResetProcess = () => {
    setInputText('');
    setMode('conversion');
    setGenerateType('frontend');
    setSelectedFramework('');
    setFromFramework('');
    setSearchFrontend('');
    setSearchBackend('');
    setSearchFrom('');
    setShowFrontendDropdown(false);
    setShowBackendDropdown(false);
    setShowFromDropdown(false);
    setProgress(null);
    setShowModal(false);
    setShowDownloadModal(false);
    setShowStructureModal(false);
    setShowExtractionModal(false);
    setShowCredentialsModal(false);
    setProjectData(null);
    setExtractedStructure(null);
    setDetectedTech(null);
    setLastAnalyzedUrl('');
    setIsDetectingTech(false);
    setCredentials({ username: '', password: '' });
    setPendingOperation(null);
    toast.success('Process reset successfully. Ready for a new task!');
  };

  const handleClearCredentials = () => {
    setCredentials({ username: '', password: '' });
    toast.success('Git authentication credentials cleared.');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans subtle-grid">
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/90 border-b border-zinc-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-black flex items-center justify-center font-mono font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/25 shrink-0">
              <Terminal className="w-4 h-4 text-black" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">TranspileAI</span>
              <span className="code-pill text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                v1.0 Engine
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-zinc-300">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Engine Online
            </div>
            {credentials.password && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Git Auth Saved {credentials.username ? `(@${credentials.username})` : ''}</span>
                <button
                  onClick={handleClearCredentials}
                  className="ml-1 text-zinc-400 hover:text-rose-400 cursor-pointer"
                  title="Clear Git credentials"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <a href="#how-it-works" className="hover:text-amber-400 transition-colors">
              How It Works
            </a>
            <a href="#faqs" className="hover:text-amber-400 transition-colors">
              Guide & FAQs
            </a>
            <button
              onClick={handleResetProcess}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 transition-all text-xs font-semibold cursor-pointer"
              title="Clear form and reset process"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Process</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800/80 mt-3 pt-3 pb-2 space-y-3 px-1 bg-black/95 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Engine Online
              </div>
              {credentials.password && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Git Auth Saved</span>
                  <button onClick={handleClearCredentials} className="text-zinc-400 hover:text-rose-400 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-zinc-900/80 text-zinc-200 hover:bg-amber-500/20 text-xs font-medium border border-zinc-800/80 text-center"
              >
                How It Works
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-zinc-900/80 text-zinc-200 hover:bg-amber-500/20 text-xs font-medium border border-zinc-800/80 text-center"
              >
                Guide & FAQs
              </a>
              <button
                onClick={() => {
                  handleResetProcess();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900 text-amber-400 text-xs font-semibold border border-zinc-800 active:scale-[0.98] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Process</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4 sm:mb-6 max-w-full">
          <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">Full-Stack Codebase Transpiler & Scaffold Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 sm:mb-5 leading-tight">
          Convert Any Codebase to <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Any Tech Stack
          </span>
        </h1>

        <p className="text-xs sm:text-base md:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8">
          Port existing GitHub repositories between frameworks or auto-generate complete frontend & backend structures with automated code transformation.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-300 mb-6 sm:mb-8">
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>50+ Frontend Stacks</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>35+ Backend Stacks</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>Private Repos Supported</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>Instant Zip Export</span>
          </div>
        </div>
      </section>

      {/* Main Guided Form Section */}
      <section className="px-3 sm:px-4 pb-16 sm:pb-20 max-w-3xl mx-auto">
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 border border-zinc-800/80 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-5 mb-6 sm:mb-8 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
                Configure Transformation
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Follow the 4 simple guided steps below to convert or generate code.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleResetProcess}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/80 transition-all text-xs font-medium cursor-pointer active:scale-[0.98]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Form</span>
              </button>
              <div className="hidden sm:block text-right">
                <span className="text-xs text-amber-400 code-pill uppercase font-semibold">4-Step Guided Setup</span>
              </div>
            </div>
          </div>

          {/* STEP 1: GitHub URL & Extraction */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
              <label className="text-sm sm:text-base font-semibold text-zinc-200 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-extrabold shrink-0">1</span>
                GitHub Repository URL
                {mode === 'conversion' && <span className="text-rose-400 text-xs">*Required</span>}
              </label>
              <div className="flex items-center gap-1 text-xs text-zinc-400 pl-8 sm:pl-0">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Public or Private</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Github className="w-5 h-5" />
                </div>
                <input
                  type="url"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full pl-11 pr-32 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-xs sm:text-sm transition-all"
                />
                {isDetectingTech && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1.5 pointer-events-none text-amber-400 text-xs font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span className="hidden sm:inline text-amber-300 font-semibold">Detecting tech...</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleExtract()}
                className="w-full sm:w-auto px-4 sm:px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-white font-semibold rounded-xl border border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0 cursor-pointer active:scale-[0.98]"
              >
                <FolderTree className="w-4 h-4 text-amber-400" />
                <span>Extract Structure</span>
              </button>
            </div>

            {/* Auto-Detected Tech Banner */}
            {detectedTech && (
              <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/15 border border-amber-500/40 text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-amber-200">Current Project Tech:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-extrabold text-xs shadow">
                    {detectedTech.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFromFramework(detectedTech.name);
                    setSearchFrom(detectedTech.name);
                    toast.success(`Set ${detectedTech.name} as Source Tech`);
                  }}
                  className="self-start sm:self-auto text-amber-400 hover:text-black hover:bg-amber-400 px-3 py-1 rounded-lg transition-all font-bold text-xs border border-amber-500/40 cursor-pointer"
                >
                  Set as Source Tech ➔
                </button>
              </div>
            )}

            {/* Git Authentication Status Badge */}
            {credentials.password && (
              <div className="mt-2.5 flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-amber-200">
                    Git Authenticated {credentials.username ? `(@${credentials.username})` : '(Token Saved)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearCredentials}
                  className="text-amber-400 hover:text-rose-400 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-all flex items-center gap-1 font-medium cursor-pointer"
                  title="Clear saved Git credentials"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Auth</span>
                </button>
              </div>
            )}

            {/* Quick Demo Pre-fills */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-400 w-full sm:w-auto">Try quick samples:</span>
              <button
                type="button"
                onClick={() => setDemoRepo('https://github.com/facebook/react', 'React', 'Next.js')}
                className="px-3 py-1.5 rounded-lg bg-zinc-900/90 text-amber-400 hover:bg-amber-950/40 hover:text-amber-300 border border-amber-500/30 transition-all active:scale-[0.98] cursor-pointer"
              >
                ⚡ React ➔ Next.js
              </button>
              <button
                type="button"
                onClick={() => setDemoRepo('https://github.com/expressjs/express', 'Express', 'FastAPI')}
                className="px-3 py-1.5 rounded-lg bg-zinc-900/90 text-yellow-400 hover:bg-yellow-950/40 hover:text-yellow-300 border border-yellow-500/30 transition-all active:scale-[0.98] cursor-pointer"
              >
                ⚡ Express ➔ FastAPI
              </button>
              <button
                type="button"
                onClick={() => setDemoRepo('https://github.com/spring-projects/spring-boot', 'Spring Boot', '.NET / ASP.NET Core')}
                className="px-3 py-1.5 rounded-lg bg-zinc-900/90 text-amber-300 hover:bg-amber-950/40 hover:text-amber-200 border border-amber-500/30 transition-all active:scale-[0.98] cursor-pointer"
              >
                ⚡ Spring Boot ➔ .NET Core
              </button>
            </div>
          </div>

          {/* STEP 2: Choose Mode */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm sm:text-base font-semibold text-zinc-200 mb-3">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs inline-flex items-center justify-center font-extrabold mr-2">2</span>
              Select Transformation Mode
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div
                onClick={() => setMode('conversion')}
                className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all active:scale-[0.99] ${
                  mode === 'conversion'
                    ? 'bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-500/30'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${mode === 'conversion' ? 'bg-amber-500 text-black font-extrabold' : 'bg-zinc-800 text-zinc-400'}`}>
                    {mode === 'conversion' ? 'Selected' : 'Select'}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1">Codebase Conversion</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Convert an existing GitHub repository from its current tech stack to a target framework.
                </p>
              </div>

              <div
                onClick={() => setMode('generate')}
                className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all active:scale-[0.99] ${
                  mode === 'generate'
                    ? 'bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-500/30'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${mode === 'generate' ? 'bg-amber-500 text-black font-extrabold' : 'bg-zinc-800 text-zinc-400'}`}>
                    {mode === 'generate' ? 'Selected' : 'Select'}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1">Auto Generation</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Generate a clean, modular frontend or backend starting structure tailored to a target framework.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 3: Framework Selection */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm sm:text-base font-semibold text-zinc-200 mb-3">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs inline-flex items-center justify-center font-extrabold mr-2">3</span>
              Select Tech Frameworks
            </label>

            {mode === 'conversion' ? (
              <div className="space-y-5 sm:space-y-6 bg-zinc-950/80 p-4 sm:p-5 rounded-2xl border border-zinc-800/80">
                {/* Source Tech */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-amber-400" />
                      Source Tech (Current Framework)
                    </label>
                    {fromFramework && (
                      <span className="text-xs text-amber-400 font-medium">Selected: {fromFramework}</span>
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
                      className="w-full px-3.5 py-2.5 sm:py-3 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs sm:text-sm"
                    />
                    {showFromDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-xl mt-1 max-h-56 overflow-y-auto z-40 shadow-2xl custom-scrollbar touch-scroll">
                        {allFrameworks
                          .filter((fw) => fw.toLowerCase().includes(searchFrom.toLowerCase()))
                          .map((fw) => (
                            <div
                              key={fw}
                              onClick={() => {
                                setFromFramework(fw);
                                setSearchFrom(fw);
                                setShowFromDropdown(false);
                              }}
                              className="px-4 py-3 hover:bg-amber-500/20 cursor-pointer text-zinc-200 text-xs sm:text-sm border-b border-zinc-800/50 last:border-0"
                            >
                              {fw}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {/* Quick Pills for Source */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {popularSourceFrameworks.map((fw) => (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => {
                          setFromFramework(fw);
                          setSearchFrom(fw);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all active:scale-[0.98] cursor-pointer ${
                          fromFramework === fw
                            ? 'bg-amber-500 text-black border-amber-400 font-bold'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {fw}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Arrow Bridge */}
                <div className="flex items-center justify-center my-2 text-amber-400">
                  <div className="h-px bg-zinc-800 flex-1" />
                  <span className="px-3 text-xs text-amber-400 font-mono flex items-center gap-1 bg-zinc-900 py-1 rounded-full border border-zinc-800">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    Transpile To
                  </span>
                  <div className="h-px bg-zinc-800 flex-1" />
                </div>

                {/* Target Tech */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Target Tech (Destination Framework)
                    </label>
                    {selectedFramework && (
                      <span className="text-xs text-amber-400 font-medium">Selected: {selectedFramework}</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchFrontend}
                      onChange={(e) => setSearchFrontend(e.target.value)}
                      onFocus={() => setShowFrontendDropdown(true)}
                      onBlur={() => setTimeout(() => setShowFrontendDropdown(false), 200)}
                      placeholder="Search or select target tech (e.g. Next.js, FastAPI, Spring Boot, .NET)"
                      className="w-full px-3.5 py-2.5 sm:py-3 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs sm:text-sm"
                    />
                    {showFrontendDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-xl mt-1 max-h-56 overflow-y-auto z-40 shadow-2xl custom-scrollbar touch-scroll">
                        {allFrameworks
                          .filter((fw) => fw.toLowerCase().includes(searchFrontend.toLowerCase()))
                          .map((fw) => (
                            <div
                              key={fw}
                              onClick={() => {
                                setSelectedFramework(fw);
                                setSearchFrontend(fw);
                                setShowFrontendDropdown(false);
                              }}
                              className="px-4 py-3 hover:bg-amber-500/20 cursor-pointer text-zinc-200 text-xs sm:text-sm border-b border-zinc-800/50 last:border-0"
                            >
                              {fw}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {/* Quick Pills for Target */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {popularTargetFrameworks.map((fw) => (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => {
                          setSelectedFramework(fw);
                          setSearchFrontend(fw);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all active:scale-[0.98] cursor-pointer ${
                          selectedFramework === fw
                            ? 'bg-amber-500 text-black border-amber-400 font-bold'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
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
              <div className="bg-zinc-950/80 p-4 sm:p-5 rounded-2xl border border-zinc-800/80 space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Generation Target Type
                  </label>
                  <div className="flex gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setGenerateType('frontend')}
                      className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-medium text-xs sm:text-sm transition-all border cursor-pointer active:scale-[0.98] ${
                        generateType === 'frontend'
                          ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      💻 Frontend Project
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerateType('backend')}
                      className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-medium text-xs sm:text-sm transition-all border cursor-pointer active:scale-[0.98] ${
                        generateType === 'backend'
                          ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      ⚙️ Backend Service
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
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
                      className="w-full px-3.5 py-2.5 sm:py-3 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs sm:text-sm"
                    />
                    {generateType === 'frontend' && showFrontendDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-xl mt-1 max-h-56 overflow-y-auto z-40 shadow-2xl custom-scrollbar touch-scroll">
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
                              className="px-4 py-3 hover:bg-amber-500/20 cursor-pointer text-zinc-200 text-xs sm:text-sm border-b border-zinc-800/50 last:border-0"
                            >
                              {fw}
                            </div>
                          ))}
                      </div>
                    )}
                    {generateType === 'backend' && showBackendDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-xl mt-1 max-h-56 overflow-y-auto z-40 shadow-2xl custom-scrollbar touch-scroll">
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
                              className="px-4 py-3 hover:bg-amber-500/20 cursor-pointer text-zinc-200 text-xs sm:text-sm border-b border-zinc-800/50 last:border-0"
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
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-sm sm:text-lg rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer"
            >
              <span>Execute Code Transformation</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-black font-extrabold" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 border-t border-zinc-900 bg-black/90">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">How TranspileAI Works</h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
              Automated code transpilation and scaffolding in 3 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-zinc-800/80 relative">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 font-bold text-lg border border-amber-500/20">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Connect Repo & Extract</h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Provide your GitHub repository link. Easily extract and inspect the directory structure before transpilation starts.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-zinc-800/80 relative">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 font-bold text-lg border border-amber-500/20">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Transpilation Engine</h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                The backend engine restructures syntax, maps dependencies, and streams real-time progress via SignalR WebSockets.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-zinc-800/80 relative">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 font-bold text-lg border border-amber-500/20">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Download ZIP Archive</h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Preview the transformed folder hierarchy and download your complete production-ready project as a ZIP package.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Tech Grid */}
      <section className="py-16 px-4 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Supported Ecosystems</h2>
          <p className="text-zinc-400 text-xs sm:text-sm mb-8">
            Transpile across modern frontend frameworks, backend microservices, and mobile platforms.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {['React', 'Next.js', 'Vue.js', 'Nuxt.js', 'SvelteKit', 'Angular', 'Remix', 'Astro', 'Express', 'FastAPI', 'Django', 'Spring Boot', 'Laravel', 'Gin', 'Actix', '.NET Core', 'React Native', 'Flutter', 'Tailwind CSS'].map((tech) => (
              <span
                key={tech}
                className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium hover:border-amber-500/50 hover:text-amber-300 transition-all cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Guide & FAQ Accordion Section */}
      <section id="faqs" className="py-16 px-4 border-t border-zinc-900 bg-black/90">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-amber-400" />
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">Quick guidance on common features and repository handling.</p>
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
                className="glass-panel rounded-2xl border border-zinc-800/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-white font-medium text-sm sm:text-base hover:bg-zinc-900/60 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="py-8 px-4 bg-black border-t border-zinc-800 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">TranspileAI Engine</span>
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
        onResetProcess={handleResetProcess}
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

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'toast-stylish',
          style: {
            background: 'rgba(9, 9, 11, 0.94)',
            color: '#f4f4f5',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.9), 0 0 30px rgba(245, 158, 11, 0.12)',
            borderRadius: '16px',
            padding: '12px 18px',
            fontSize: '13px',
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: '#f59e0b',
              secondary: '#000000',
            },
            style: {
              border: '1px solid rgba(245, 158, 11, 0.45)',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#ffffff',
            },
            style: {
              border: '1px solid rgba(244, 63, 94, 0.45)',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.9), 0 0 30px rgba(244, 63, 94, 0.18)',
            },
          },
          loading: {
            iconTheme: {
              primary: '#fbbf24',
              secondary: '#000000',
            },
            style: {
              border: '1px solid rgba(251, 191, 36, 0.4)',
            },
          },
        }}
      />
    </div>
  );
}

