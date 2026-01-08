/**
 * Chat API Service
 * 
 * Zero-Trust Architecture: Uses httpOnly cookies via withCredentials, no localStorage
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ChatMessage {
  id?: number;
  role: 'user' | 'model';
  content: string;
  created_at?: string;
}

interface ChatSession {
  id: number;
  session_title: string;
  created_at: string;
  updated_at: string;
}

class ChatAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE}/api/chat${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // CRITICAL: Send httpOnly cookies
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getSessions(): Promise<ChatSession[]> {
    const data = await this.request('/sessions');
    return data.sessions;
  }

  async createSession(title?: string): Promise<ChatSession> {
    const data = await this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    return data.session;
  }

  async getMessages(sessionId: number): Promise<ChatMessage[]> {
    const data = await this.request(`/sessions/${sessionId}/messages`);
    return data.messages;
  }

  async addMessage(sessionId: number, role: 'user' | 'model', content: string): Promise<ChatMessage> {
    const data = await this.request(`/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ role, content }),
    });
    return data.message;
  }

  async deleteSession(sessionId: number): Promise<void> {
    await this.request(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }
}

export const chatAPI = new ChatAPI();
export type { ChatMessage, ChatSession };