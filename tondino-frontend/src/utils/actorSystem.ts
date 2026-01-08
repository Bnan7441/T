/**
 * Simple Actor System Implementation for Tondino
 * 
 * This implements a basic actor model with:
 * - Message-based communication
 * - Actor isolation and state encapsulation
 * - Event-driven architecture
 * - Asynchronous message handling
 */

export interface Message {
  type: string;
  payload?: any;
  sender?: string;
  timestamp?: number;
}

export interface ActorContext {
  self: string;
  system: ActorSystem;
  send: (target: string, message: Message) => Promise<void>;
  reply: (message: Message) => Promise<void>;
  stop: () => void;
}

export type ActorBehavior = (ctx: ActorContext, message: Message) => Promise<void> | void;

export class Actor {
  public readonly id: string;
  private behavior: ActorBehavior;
  private mailbox: Message[] = [];
  private processing = false;
  private stopped = false;
  private currentSender?: string;

  constructor(id: string, behavior: ActorBehavior) {
    this.id = id;
    this.behavior = behavior;
  }

  async send(message: Message): Promise<void> {
    if (this.stopped) {
      console.warn(`Actor ${this.id} is stopped, ignoring message:`, message);
      return;
    }

    this.mailbox.push({
      ...message,
      timestamp: Date.now(),
    });

    if (!this.processing) {
      this.processMailbox();
    }
  }

  private async processMailbox(): Promise<void> {
    if (this.processing || this.stopped) return;
    
    this.processing = true;
    
    while (this.mailbox.length > 0 && !this.stopped) {
      const message = this.mailbox.shift()!;
      this.currentSender = message.sender;
      
      try {
        await this.behavior(this.createContext(), message);
      } catch (error) {
        console.error(`Actor ${this.id} error processing message:`, error);
        // Actor continues processing despite errors (fault tolerance)
      }
      
      this.currentSender = undefined;
    }
    
    this.processing = false;
  }

  private createContext(): ActorContext {
    return {
      self: this.id,
      system: ActorSystem.getInstance(),
      send: async (target: string, message: Message) => {
        await ActorSystem.getInstance().send(target, {
          ...message,
          sender: this.id,
        });
      },
      reply: async (message: Message) => {
        if (this.currentSender) {
          await ActorSystem.getInstance().send(this.currentSender, {
            ...message,
            sender: this.id,
          });
        }
      },
      stop: () => {
        this.stopped = true;
        ActorSystem.getInstance().removeActor(this.id);
      },
    };
  }

  stop(): void {
    this.stopped = true;
    this.mailbox.length = 0;
  }
}

export class ActorSystem {
  private static instance: ActorSystem;
  private actors = new Map<string, Actor>();
  public eventBus = new EventTarget();

  private constructor() {}

  public static getInstance(): ActorSystem {
    if (!ActorSystem.instance) {
      ActorSystem.instance = new ActorSystem();
    }
    return ActorSystem.instance;
  }

  public spawn(id: string, behavior: ActorBehavior): Actor {
    if (this.actors.has(id)) {
      throw new Error(`Actor with id '${id}' already exists`);
    }

    const actor = new Actor(id, behavior);
    this.actors.set(id, actor);
    
    this.eventBus.dispatchEvent(new CustomEvent('actor:spawned', {
      detail: { actorId: id }
    }));

    return actor;
  }

  public async send(actorId: string, message: Message): Promise<void> {
    const actor = this.actors.get(actorId);
    if (!actor) {
      console.warn(`Actor '${actorId}' not found, ignoring message:`, message);
      return;
    }

    await actor.send(message);
  }

  public getActor(id: string): Actor | undefined {
    return this.actors.get(id);
  }

  public removeActor(id: string): void {
    const actor = this.actors.get(id);
    if (actor) {
      actor.stop();
      this.actors.delete(id);
      
      this.eventBus.dispatchEvent(new CustomEvent('actor:stopped', {
        detail: { actorId: id }
      }));
    }
  }

  public stopAll(): void {
    for (const [id, actor] of this.actors) {
      actor.stop();
      this.actors.delete(id);
    }
  }

  public getActorCount(): number {
    return this.actors.size;
  }

  public subscribe(eventType: string, listener: EventListener): void {
    this.eventBus.addEventListener(eventType, listener);
  }

  public unsubscribe(eventType: string, listener: EventListener): void {
    this.eventBus.removeEventListener(eventType, listener);
  }
}

// Utility functions for common patterns
export class ActorPatterns {
  /**
   * Create a request-response actor that handles async operations
   */
  static requestResponseActor(
    id: string,
    handler: (message: Message) => Promise<any>
  ): Actor {
    return ActorSystem.getInstance().spawn(id, async (ctx, message) => {
      try {
        const result = await handler(message);
        
        if (message.type.endsWith(':request')) {
          await ctx.reply({
            type: message.type.replace(':request', ':response'),
            payload: { success: true, data: result },
          });
        }
      } catch (error) {
        if (message.type.endsWith(':request')) {
          await ctx.reply({
            type: message.type.replace(':request', ':error'),
            payload: { success: false, error: error.message },
          });
        }
      }
    });
  }

  /**
   * Create a state management actor
   */
  static statefulActor<T>(
    id: string,
    initialState: T,
    reducer: (state: T, message: Message) => T
  ): Actor {
    let state = initialState;
    
    return ActorSystem.getInstance().spawn(id, async (ctx, message) => {
      switch (message.type) {
        case 'get:state':
          await ctx.reply({
            type: 'state:response',
            payload: state,
          });
          break;
          
        default:
          const oldState = state;
          state = reducer(state, message);
          
          // Notify of state changes
          if (state !== oldState) {
            ctx.system.eventBus?.dispatchEvent(new CustomEvent('state:changed', {
              detail: { actorId: id, oldState, newState: state, message }
            }));
          }
          break;
      }
    });
  }
}