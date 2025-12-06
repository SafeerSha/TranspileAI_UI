import * as signalR from '@microsoft/signalr';

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface ProcessProjectParams {
  githubUrl?: string;
  mode: 'conversion' | 'generate';
  type?: 'backend' | 'frontend';
  targetFramework: string;
  fromFramework?: string;
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

class ProjectService {
  private connection: signalR.HubConnection | null = null;
  private connectionId: string | null = null;
  private progressCallback: ((message: string, percentage: number) => void) | null = null;

  // Initialize SignalR connection
  async initializeProgressTracking(onProgress: (message: string, percentage: number) => void): Promise<string> {
    this.progressCallback = onProgress;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BACKEND_URL}/progressHub`)
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveProgress', (message: string, percentage: number) => {
      if (this.progressCallback) {
        this.progressCallback(message, percentage);
      }
    });

    await this.connection.start();
    this.connectionId = this.connection.connectionId;
    return this.connectionId!;
  }

  // Process API - Main endpoint for cloning, conversion, generation
  async processProject({ githubUrl, mode, type, targetFramework, fromFramework }: ProcessProjectParams): Promise<ProcessProjectResponse> {
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
        connectionId: this.connectionId
      })
    });

    if (!response.ok) {
      throw new Error(`Process failed: ${response.statusText}`);
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
  async extractProjectStructure(url: string): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/project/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`Extract failed: ${response.statusText}`);
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
}

export default ProjectService;