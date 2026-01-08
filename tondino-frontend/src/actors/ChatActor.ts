/**
 * Chat Actor - Manages chat sessions using the Actor System
 * 
 * This demonstrates how to integrate the actor system with the chat functionality,
 * providing message-based chat management with proper isolation.
 */

import { Actor, ActorSystem, ActorPatterns, Message } from '@/utils/actorSystem';
import { chatAPI, ChatSession, ChatMessage } from '@/services/chatApi';

interface ChatActorState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  messages: ChatMessage[];
  isLoading: boolean;
}

export class ChatActor {
  private static instance: Actor | null = null;
  private static readonly ACTOR_ID = 'chat-manager';

  public static getInstance(): Actor {
    if (!ChatActor.instance) {
      ChatActor.instance = ChatActor.createChatActor();
    }
    return ChatActor.instance;
  }

  private static createChatActor(): Actor {
    const initialState: ChatActorState = {
      currentSession: null,
      sessions: [],
      messages: [],
      isLoading: false,
    };

    return ActorPatterns.statefulActor(
      ChatActor.ACTOR_ID,
      initialState,
      ChatActor.reducer
    );
  }

  private static reducer(state: ChatActorState, message: Message): ChatActorState {
    switch (message.type) {
      case 'chat:load_sessions':
        return { ...state, isLoading: true };

      case 'chat:sessions_loaded':
        return {
          ...state,
          sessions: message.payload.sessions,
          isLoading: false,
        };

      case 'chat:session_created':
        return {
          ...state,
          sessions: [message.payload.session, ...state.sessions],
          currentSession: message.payload.session,
          messages: [],
        };

      case 'chat:switch_session':
        return {
          ...state,
          currentSession: message.payload.session,
          isLoading: true,
        };

      case 'chat:messages_loaded':
        return {
          ...state,
          messages: message.payload.messages,
          isLoading: false,
        };

      case 'chat:message_added':
        return {
          ...state,
          messages: [...state.messages, message.payload.message],
        };

      case 'chat:message_updated':
        const updatedMessages = [...state.messages];
        const lastIndex = updatedMessages.length - 1;
        if (lastIndex >= 0) {
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            content: message.payload.content,
          };
        }
        return { ...state, messages: updatedMessages };

      case 'chat:session_deleted':
        const filteredSessions = state.sessions.filter(
          s => s.id !== message.payload.sessionId
        );
        return {
          ...state,
          sessions: filteredSessions,
          currentSession: state.currentSession?.id === message.payload.sessionId 
            ? (filteredSessions[0] || null) 
            : state.currentSession,
          messages: state.currentSession?.id === message.payload.sessionId ? [] : state.messages,
        };

      case 'chat:error':
        return { ...state, isLoading: false };

      default:
        return state;
    }
  }

  // Static helper methods for sending messages to the chat actor
  public static async loadSessions(): Promise<void> {
    const actor = ChatActor.getInstance();
    await actor.send({ type: 'chat:load_sessions' });

    try {
      const sessions = await chatAPI.getSessions();
      await actor.send({
        type: 'chat:sessions_loaded',
        payload: { sessions },
      });
    } catch (error) {
      await actor.send({
        type: 'chat:error',
        payload: { error: error.message },
      });
    }
  }

  public static async createSession(title?: string): Promise<void> {
    try {
      const session = await chatAPI.createSession(title);
      const actor = ChatActor.getInstance();
      await actor.send({
        type: 'chat:session_created',
        payload: { session },
      });
    } catch (error) {
      const actor = ChatActor.getInstance();
      await actor.send({
        type: 'chat:error',
        payload: { error: error.message },
      });
    }
  }

  public static async switchSession(sessionId: number): Promise<void> {
    const system = ActorSystem.getInstance();
    const actor = ChatActor.getInstance();
    
    // Get current state to find the session
    await actor.send({ type: 'get:state' });
    
    // This would typically be handled with a proper state query mechanism
    // For now, we'll make the API call directly
    try {
      const messages = await chatAPI.getMessages(sessionId);
      await actor.send({
        type: 'chat:messages_loaded',
        payload: { messages },
      });
    } catch (error) {
      await actor.send({
        type: 'chat:error',
        payload: { error: error.message },
      });
    }
  }

  public static async addMessage(content: string, role: 'user' | 'model'): Promise<void> {
    const actor = ChatActor.getInstance();
    
    // Optimistic update
    const optimisticMessage: ChatMessage = {
      role,
      content,
      created_at: new Date().toISOString(),
    };
    
    await actor.send({
      type: 'chat:message_added',
      payload: { message: optimisticMessage },
    });

    // This would need to get current session from state
    // For demo purposes, assuming currentSession is available
    try {
      // const serverMessage = await chatAPI.addMessage(currentSessionId, role, content);
      // In a real implementation, we'd update with the server response
    } catch (error) {
      await actor.send({
        type: 'chat:error',
        payload: { error: error.message },
      });
    }
  }

  public static async deleteSession(sessionId: number): Promise<void> {
    try {
      await chatAPI.deleteSession(sessionId);
      const actor = ChatActor.getInstance();
      await actor.send({
        type: 'chat:session_deleted',
        payload: { sessionId },
      });
    } catch (error) {
      const actor = ChatActor.getInstance();
      await actor.send({
        type: 'chat:error',
        payload: { error: error.message },
      });
    }
  }

  public static subscribeToStateChanges(callback: (state: ChatActorState) => void): void {
    const system = ActorSystem.getInstance();
    system.subscribe('state:changed', (event: any) => {
      if (event.detail.actorId === ChatActor.ACTOR_ID) {
        callback(event.detail.newState);
      }
    });
  }

  public static stop(): void {
    if (ChatActor.instance) {
      ChatActor.instance.stop();
      ChatActor.instance = null;
    }
  }
}

// Example usage in a React component:
/*
useEffect(() => {
  // Subscribe to state changes
  ChatActor.subscribeToStateChanges((state) => {
    // Update React state based on actor state
    setMessages(state.messages);
    setCurrentSession(state.currentSession);
    setSessions(state.sessions);
    setIsLoading(state.isLoading);
  });

  // Load initial sessions
  ChatActor.loadSessions();

  return () => {
    // Cleanup if needed
  };
}, []);
*/