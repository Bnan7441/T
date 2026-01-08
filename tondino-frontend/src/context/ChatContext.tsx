import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { chatAPI, ChatMessage, ChatSession } from '@/services/chatApi';
import { useAuth } from './AuthContext';

interface ChatContextType {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  messages: ChatMessage[];
  chatHistory: ChatMessage[]; // Alias for messages
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  addChatMessage: (content: string, role: 'user' | 'model') => Promise<void>;
  updateLastChatMessage: (content: string) => Promise<void>;
  createNewSession: (title?: string) => Promise<ChatSession>;
  switchSession: (sessionId: number) => Promise<void>;
  deleteSession: (sessionId: number) => Promise<void>;
  loadSessions: () => Promise<void>;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cache management
  const getCacheKey = (key: string) => `tondino_chat_${key}`;

  const loadFromCache = (key: string) => {
    if (!isAuthenticated) return null;
    try {
      const cached = localStorage.getItem(getCacheKey(key));
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const saveToCache = (key: string, data: any) => {
    if (!isAuthenticated) return;
    try {
      localStorage.setItem(getCacheKey(key), JSON.stringify(data));
    } catch {
      // Ignore cache failures
    }
  };

  const clearCache = () => {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('tondino_chat_'))
        .forEach(key => localStorage.removeItem(key));
    } catch {
      // Ignore cache failures
    }
  };

  // Load sessions from server with cache fallback
  const loadSessions = async () => {
    if (!isAuthenticated) {
      setSessions([]);
      setCurrentSession(null);
      setMessages([]);
      clearCache();
      return;
    }

    setIsLoading(true);
    try {
      const serverSessions = await chatAPI.getSessions();
      setSessions(serverSessions);
      saveToCache('sessions', serverSessions);
      
      // If no current session but we have sessions, load the most recent
      if (!currentSession && serverSessions.length > 0) {
        const mostRecent = serverSessions[0];
        await switchSession(mostRecent.id);
      }
    } catch (error) {
      console.warn('Failed to load sessions from server, using cache:', error);
      const cached = loadFromCache('sessions');
      if (cached) setSessions(cached);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to a different session
  const switchSession = async (sessionId: number) => {
    if (!isAuthenticated) return;

    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    setCurrentSession(session);
    setIsLoading(true);
    
    try {
      const serverMessages = await chatAPI.getMessages(sessionId);
      setMessages(serverMessages);
      saveToCache(`messages_${sessionId}`, serverMessages);
    } catch (error) {
      console.warn(`Failed to load messages from server for session ${sessionId}, using cache:`, error);
      const cached = loadFromCache(`messages_${sessionId}`);
      if (cached) setMessages(cached);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new chat session
  const createNewSession = async (title?: string): Promise<ChatSession> => {
    if (!isAuthenticated) throw new Error('Authentication required');
    
    try {
      const newSession = await chatAPI.createSession(title);
      setSessions(prev => [newSession, ...prev]);
      saveToCache('sessions', [newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
      return newSession;
    } catch (error) {
      console.error('Failed to create new session:', error);
      throw error;
    }
  };

  // Add a message to the current session
  const addChatMessage = async (content: string, role: 'user' | 'model') => {
    if (!isAuthenticated || !currentSession) return;

    // Optimistically add to local state
    const optimisticMessage: ChatMessage = {
      role,
      content,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const serverMessage = await chatAPI.addMessage(currentSession.id, role, content);
      
      // Replace optimistic message with server response
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = serverMessage;
        return newMessages;
      });
      
      saveToCache(`messages_${currentSession.id}`, messages);
    } catch (error) {
      console.error('Failed to save message to server:', error);
      // Keep optimistic update but log error
    }
  };

  // Update the last message (typically for streaming responses)
  const updateLastChatMessage = async (content: string) => {
    if (!currentSession || messages.length === 0) return;

    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = {
        ...newMessages[newMessages.length - 1],
        content
      };
      return newMessages;
    });

    // If this is updating a model response, save to server
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'model' && currentSession) {
      try {
        await chatAPI.addMessage(currentSession.id, 'model', content);
        saveToCache(`messages_${currentSession.id}`, messages);
      } catch (error) {
        console.error('Failed to update message on server:', error);
      }
    }
  };

  // Delete a session
  const deleteSession = async (sessionId: number) => {
    if (!isAuthenticated) return;

    try {
      await chatAPI.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        // Switch to another session if available
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          await switchSession(remainingSessions[0].id);
        }
      }
      
      // Clear cache for deleted session
      localStorage.removeItem(getCacheKey(`messages_${sessionId}`));
      saveToCache('sessions', sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  };

  // Load sessions when authentication state changes
  useEffect(() => {
    loadSessions();
  }, [isAuthenticated]);

  // Cache current messages when they change
  useEffect(() => {
    if (currentSession) {
      saveToCache(`messages_${currentSession.id}`, messages);
    }
  }, [messages, currentSession]);

  return (
    <ChatContext.Provider value={{
      currentSession,
      sessions,
      messages,
      chatHistory: messages,
      isChatOpen,
      setIsChatOpen,
      addChatMessage,
      updateLastChatMessage,
      createNewSession,
      switchSession,
      deleteSession,
      loadSessions,
      isLoading
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
