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

interface ProgressData {
  percentage: number;
  message: string;
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

  // Initialize SignalR connection
  async initializeProgressTracking(onProgress: (message: string, percentage: number) => void): Promise<string | null> {
    this.progressCallback = onProgress;

    const hubUrl = `${BACKEND_URL || ''}/progressHub`;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < 5) {
            return 2000;
          }
          return 5000;
        }
      })
      .withHubProtocol(new signalR.JsonHubProtocol())
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.on('ReceiveProgress', (message: string, percentage: number) => {
      if (this.progressCallback) {
        this.progressCallback(message, percentage);
      }
    });

    try {
      await this.connection.start();
      this.connectionId = this.connection.connectionId;
      console.log('SignalR connection established successfully:', this.connectionId);
      return this.connectionId;
    } catch (err) {
      console.warn('SignalR negotiation skipped or backend server initializing:', err);
      this.connectionId = null;
      return null;
    }
  }


  // Process API - Main endpoint for cloning, conversion, generation
  async processProject({ githubUrl, mode, type, targetFramework, fromFramework, username, password }: ProcessProjectParams): Promise<ProcessProjectResponse> {
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
        connectionId: this.connectionId
      })
    });

    if (!response.ok) {
      let errorMessage = `Process failed: ${response.statusText}`;
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
    return new Promise((resolve) => {
      const poll = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/project/progress/${taskId}`);

          if (response.ok) {
            const progress: ProgressData = await response.json();
            console.log(`Progress: ${progress.percentage}% - ${progress.message}`);

            if (onProgress) {
              onProgress(progress);
            }

            if (progress.percentage >= 100) {
              resolve(progress);
            } else {
              setTimeout(poll, 1000); // Poll every second
            }
          } else if (response.status === 404) {
            console.log('Progress not found, operation might be complete');
            resolve(null);
          } else {
            throw new Error('Failed to get progress');
          }
        } catch (error) {
          console.error('Error polling progress:', error);
          setTimeout(poll, 2000); // Retry after 2 seconds on error
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
}

export default ProjectService;