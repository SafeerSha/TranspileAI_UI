import * as signalR from '@microsoft/signalr';

interface ProcessProjectParams {
  githubUrl?: string;
  mode: 'conversion' | 'generate';
  type?: 'backend' | 'frontend';
  targetFramework: string;
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

class ProjectService {
  private connection: signalR.HubConnection | null = null;
  private connectionId: string | null = null;
  private progressCallback: ((message: string, percentage: number) => void) | null = null;

  // Initialize SignalR connection
  async initializeProgressTracking(onProgress: (message: string, percentage: number) => void): Promise<string> {
    this.progressCallback = onProgress;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/progressHub')
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
  async processProject({ githubUrl, mode, type, targetFramework }: ProcessProjectParams): Promise<any> {
    const response = await fetch('/api/project/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        githubUrl,
        mode,
        type,
        targetFramework,
        connectionId: this.connectionId
      })
    });

    if (!response.ok) {
      throw new Error(`Process failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Create base project
  async createBaseProject(domain: string): Promise<any> {
    const response = await fetch('/api/project/createBase', {
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

  // Convert project
  async convertProject({ id, fromDomain, targetDomain, baseProjectId }: ConvertProjectParams): Promise<any> {
    const response = await fetch('/api/project/convert', {
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
    const response = await fetch('/api/project/generate', {
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

  // Download project
  async downloadProject(id: string): Promise<Blob> {
    const response = await fetch(`/api/project/download/${id}`);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return await response.blob();
  }
}

export default ProjectService;