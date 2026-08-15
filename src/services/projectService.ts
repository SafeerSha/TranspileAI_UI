import * as signalR from '@microsoft/signalr';

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface ProcessProjectParams {
  githubUrl?: string;
  mode: 'conversion' | 'generate';
  type?: 'backend' | 'frontend';
  targetFramework: string;
  fromFramework?: string;
  username?: string;
  password?: string;
  aiApiKey?: string;
}

interface ConvertProjectParams {
  id: string;
  fromDomain: string;
  targetDomain: string;
  baseProjectId?: string;
}

interface GenerateBackendParams {
  id: string;
  targetDomain: string;
}

interface PushToGithubParams {
  id: string;
  repoName: string;
  isPrivate: boolean;
  description?: string;
  githubToken: string;
}

interface PushToGithubResponse {
  success: boolean;
  repoUrl: string;
  cloneUrl: string;
}

interface CreateBaseResponse {
  id: string;
  folders: string[];
  taskId: string;
}

interface ProcessProjectResponse {
  projectId: string;
  folders: string[];
  taskId: string;
}

export interface ProgressData {
  percentage: number;
  message: string;
  projectId?: string;
  folders?: string[];
  error?: string;
}

export interface DetectedTech {
  name: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'general';
  confidence: 'high' | 'medium' | 'low';
  summary: string;
}

export function detectTechFromTree(rootNode: any): DetectedTech | null {
  if (!rootNode) return null;

  const allFileNames: string[] = [];

  function collectNames(node: any) {
    if (!node) return;
    if (node.name) allFileNames.push(node.name.toLowerCase());
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(collectNames);
    }
  }

  collectNames(rootNode);

  if (allFileNames.some(f => f === 'next.config.js' || f === 'next.config.mjs' || f === 'next.config.ts')) {
    return { name: 'Next.js', category: 'frontend', confidence: 'high', summary: 'Next.js Project' };
  }
  if (allFileNames.some(f => f === 'nuxt.config.js' || f === 'nuxt.config.ts')) {
    return { name: 'Nuxt.js', category: 'frontend', confidence: 'high', summary: 'Nuxt.js Project' };
  }
  if (allFileNames.some(f => f === 'svelte.config.js')) {
    return { name: 'SvelteKit', category: 'frontend', confidence: 'high', summary: 'SvelteKit Project' };
  }
  if (allFileNames.some(f => f === 'pom.xml' || f.endsWith('.gradle') || f.endsWith('.gradle.kts'))) {
    return { name: 'Spring Boot', category: 'backend', confidence: 'high', summary: 'Spring Boot Backend' };
  }
  if (allFileNames.some(f => f.endsWith('.csproj') || f.endsWith('.sln'))) {
    return { name: '.NET / ASP.NET Core', category: 'backend', confidence: 'high', summary: '.NET / ASP.NET Core Backend' };
  }
  if (allFileNames.some(f => f === 'requirements.txt' || f === 'pyproject.toml' || f === 'pipfile')) {
    return { name: 'FastAPI', category: 'backend', confidence: 'medium', summary: 'FastAPI Backend' };
  }
  if (allFileNames.some(f => f === 'composer.json')) {
    return { name: 'Laravel', category: 'backend', confidence: 'medium', summary: 'Laravel Backend' };
  }
  if (allFileNames.some(f => f === 'gemfile')) {
    return { name: 'Ruby on Rails', category: 'backend', confidence: 'high', summary: 'Ruby on Rails Backend' };
  }
  if (allFileNames.some(f => f === 'go.mod')) {
    return { name: 'Gin', category: 'backend', confidence: 'medium', summary: 'Go Backend' };
  }
  if (allFileNames.some(f => f.endsWith('.cs'))) {
    return { name: '.NET / ASP.NET Core', category: 'backend', confidence: 'medium', summary: '.NET / ASP.NET Core Backend' };
  }
  if (allFileNames.some(f => f.endsWith('.java') || f.endsWith('.kt'))) {
    return { name: 'Spring Boot', category: 'backend', confidence: 'medium', summary: 'Spring Boot Backend' };
  }
  if (allFileNames.some(f => f.endsWith('.py'))) {
    return { name: 'FastAPI', category: 'backend', confidence: 'medium', summary: 'Python Backend' };
  }

  return null;
}

class ProjectService {
  private connection: signalR.HubConnection | null = null;
  private connectionId: string | null = null;
  private progressCallback: ((message: string, percentage: number) => void) | null = null;

  constructor() {}

  // Initialize SignalR connection for real-time progress
  async initializeProgressTracking(onProgress: (message: string, percentage: number) => void): Promise<string | null> {
    this.progressCallback = onProgress;

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return this.connectionId;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${BACKEND_URL}/progressHub`, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            if (retryContext.previousRetryCount === 0) {
              return 0;
            }
            if (retryContext.previousRetryCount < 3) {
              return 2000;
            }
            return 5000;
          }
        })
        .withHubProtocol(new signalR.JsonHubProtocol())
        .configureLogging(signalR.LogLevel.None)
        .build();

      this.connection.on('ReceiveProgress', (message: string, percentage: number) => {
        if (this.progressCallback) {
          this.progressCallback(message, percentage);
        }
      });

      await this.connection.start();
      this.connectionId = this.connection.connectionId;
      return this.connectionId;
    } catch {
      this.connectionId = null;
      return null;
    }
  }

  // Check backend engine health
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(`${BACKEND_URL}/api/project/health`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Process API - Main endpoint for cloning, conversion, generation
  async processProject({ githubUrl, mode, type, targetFramework, fromFramework, username, password, aiApiKey }: ProcessProjectParams): Promise<ProcessProjectResponse> {
    const response = await fetch(`${BACKEND_URL}/api/project/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        githubUrl,
        mode,
        type,
        targetFramework,
        fromFramework,
        username: username || null,
        password: password || null,
        aiApiKey: aiApiKey || null,
        connectionId: this.connectionId
      })
    });

    if (!response.ok) {
      let errorMessage = `Process failed: ${response.statusText}`;
      if (response.status === 429) {
        let rateLimitMsg = 'Gemini free tier rate limit reached. Please wait a moment or use your own Gemini API key (BYOK).';
        try {
          const errorData = await response.json();
          rateLimitMsg = errorData.error || rateLimitMsg;
        } catch {}
        const rateLimitError = new Error(rateLimitMsg);
        (rateLimitError as any).status = 429;
        (rateLimitError as any).isRateLimit = true;
        throw rateLimitError;
      }
      if (response.status === 401) {
        const authError = new Error('Authentication required for this repository');
        (authError as any).status = 401;
        throw authError;
      }
      if (response.status === 400) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          if (errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('resource_exhausted')) {
            const rateLimitError = new Error('Gemini free tier rate limit reached. Please wait a moment or use your own Gemini API key (BYOK).');
            (rateLimitError as any).status = 429;
            (rateLimitError as any).isRateLimit = true;
            throw rateLimitError;
          }
        } catch (e: any) {
          if (e.isRateLimit) throw e;
        }
      }
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    return await response.json();
  }

  // Create base project
  async createBaseProject(domain: string): Promise<CreateBaseResponse> {
    const response = await fetch(`${BACKEND_URL}/api/project/createBase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        connectionId: this.connectionId
      })
    });

    if (!response.ok) {
      throw new Error(`Create base failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Poll for progress updates
  async pollProgress(taskId: string, onProgress?: (progress: ProgressData) => void): Promise<ProgressData | null> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/project/progress/${taskId}`);

          if (response.ok) {
            const progress: ProgressData = await response.json();

            if (onProgress) {
              onProgress(progress);
            }

            if (progress.error) {
              const err = new Error(progress.error);
              if (progress.error.includes('rate limit') || progress.error.includes('Gemini')) {
                (err as any).isRateLimit = true;
                (err as any).status = 429;
              }
              reject(err);
              return;
            }

            if (progress.percentage >= 100 || progress.projectId) {
              resolve(progress);
            } else {
              setTimeout(poll, 3000); // Poll every 3 seconds
            }
          } else if (response.status === 404) {
            setTimeout(poll, 3000);
          } else {
            setTimeout(poll, 3000);
          }
        } catch (error) {
          setTimeout(poll, 3000);
        }
      };

      poll();
    });
  }

  // Convert project
  async convertProject({ id, fromDomain, targetDomain, baseProjectId }: ConvertProjectParams): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/project/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        fromDomain,
        targetDomain,
        baseProjectId,
        connectionId: this.connectionId
      })
    });

    if (!response.ok) {
      throw new Error(`Convert failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Generate backend
  async generateBackend({ id, targetDomain }: GenerateBackendParams): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/project/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        targetDomain,
        connectionId: this.connectionId
      })
    });

    if (!response.ok) {
      throw new Error(`Generate backend failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Extract project structure
  async extractProjectStructure(url: string, username?: string, password?: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/project/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        username: username || null,
        password: password || null
      })
    });

    if (!response.ok) {
      let errorMessage = `Extract failed: ${response.statusText}`;
      if (response.status === 401) {
        const authError = new Error('Authentication required for this repository');
        (authError as any).status = 401;
        throw authError;
      }
      if (response.status === 400) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If parsing fails, use default message
        }
      }
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    return await response.json();
  }

  // Download project
  async downloadProject(id: string): Promise<Blob> {
    const response = await fetch(`${BACKEND_URL}/api/project/download/${id}`);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  // Push to GitHub
  async pushToGithub({ id, repoName, isPrivate, description, githubToken }: PushToGithubParams): Promise<PushToGithubResponse> {
    const response = await fetch(`${BACKEND_URL}/api/project/pushToGithub`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        repoName,
        isPrivate,
        description,
        githubToken,
        connectionId: this.connectionId
      })
    });

    if (!response.ok) {
      let errorMessage = `Push to GitHub failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Use default error message if JSON parse fails
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  // Get project files dictionary for Sandpack Live Sandbox
  async getProjectFiles(id: string): Promise<Record<string, string>> {
    const response = await fetch(`${BACKEND_URL}/api/project/files/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch project files: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files || {};
  }
}

export default ProjectService;