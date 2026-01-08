/**
 * Courses Actor - Manages course data using the Actor System
 * 
 * This implements a stateful actor for managing courses, my courses, and course-related
 * state with proper isolation and message-based communication.
 * 
 * Architecture Decision:
 * - Uses statefulActor pattern for automatic state management
 * - No localStorage - relies on server-side sessions via withCredentials
 * - All course data flows through this actor
 */

import { Actor, ActorSystem, ActorPatterns, Message } from '@/utils/actorSystem';
import { enhancedCoursesAPI } from '@/services/enhancedAPI';
import type { Course } from '@/types';

export interface CoursesActorState {
  courses: Course[];
  myCourses: Course[];
  loading: boolean;
  error: string | null;
  lastRefresh: number | null;
}

export class CoursesActor {
  private static instance: Actor | null = null;
  private static readonly ACTOR_ID = 'courses-manager';
  private static stateSubscribers: Set<(state: CoursesActorState) => void> = new Set();

  public static getInstance(): Actor {
    if (!CoursesActor.instance) {
      CoursesActor.instance = CoursesActor.createCoursesActor();
    }
    return CoursesActor.instance;
  }

  private static createCoursesActor(): Actor {
    const initialState: CoursesActorState = {
      courses: [],
      myCourses: [],
      loading: false,
      error: null,
      lastRefresh: null,
    };

    const actor = ActorPatterns.statefulActor(
      CoursesActor.ACTOR_ID,
      initialState,
      CoursesActor.reducer
    );

    // Subscribe to state changes to notify React components
    const system = ActorSystem.getInstance();
    system.subscribe('state:changed', ((event: CustomEvent) => {
      if (event.detail.actorId === CoursesActor.ACTOR_ID) {
        CoursesActor.notifySubscribers(event.detail.newState);
      }
    }) as EventListener);

    return actor;
  }

  private static reducer(state: CoursesActorState, message: Message): CoursesActorState {
    switch (message.type) {
      case 'courses:load':
        return { ...state, loading: true, error: null };

      case 'courses:loaded':
        return {
          ...state,
          courses: message.payload.courses || [],
          loading: false,
          error: null,
          lastRefresh: Date.now(),
        };

      case 'my_courses:load':
        return { ...state, loading: true, error: null };

      case 'my_courses:loaded':
        return {
          ...state,
          myCourses: message.payload.courses || [],
          loading: false,
          error: null,
        };

      case 'courses:error':
        return {
          ...state,
          loading: false,
          error: message.payload.error || 'Unknown error',
        };

      case 'courses:clear_my_courses':
        return {
          ...state,
          myCourses: [],
        };

      case 'courses:reset':
        return {
          courses: [],
          myCourses: [],
          loading: false,
          error: null,
          lastRefresh: null,
        };

      default:
        return state;
    }
  }

  // Static API methods for interacting with the actor

  public static async loadCourses(): Promise<void> {
    const actor = CoursesActor.getInstance();
    await actor.send({ type: 'courses:load' });

    try {
      const response = await enhancedCoursesAPI.getAll();
      await actor.send({
        type: 'courses:loaded',
        payload: { courses: response.courses || [] },
      });
    } catch (error: any) {
      await actor.send({
        type: 'courses:error',
        payload: { error: error.message || 'Failed to load courses' },
      });
    }
  }

  public static async loadMyCourses(): Promise<void> {
    const actor = CoursesActor.getInstance();
    await actor.send({ type: 'my_courses:load' });

    try {
      const response = await enhancedCoursesAPI.getMyCourses();
      await actor.send({
        type: 'my_courses:loaded',
        payload: { courses: response.courses || [] },
      });
    } catch (error: any) {
      await actor.send({
        type: 'courses:error',
        payload: { error: error.message || 'Failed to load my courses' },
      });
      // On error (likely auth failure), clear my courses
      await actor.send({ type: 'courses:clear_my_courses' });
    }
  }

  public static async reset(): Promise<void> {
    const actor = CoursesActor.getInstance();
    await actor.send({ type: 'courses:reset' });
  }

  // State subscription mechanism for React components
  public static subscribe(callback: (state: CoursesActorState) => void): () => void {
    CoursesActor.stateSubscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      CoursesActor.stateSubscribers.delete(callback);
    };
  }

  private static notifySubscribers(state: CoursesActorState): void {
    CoursesActor.stateSubscribers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in CoursesActor subscriber:', error);
      }
    });
  }

  // Helper method to get current state (for synchronous reads)
  public static async getState(): Promise<CoursesActorState> {
    return new Promise((resolve) => {
      const actor = CoursesActor.getInstance();
      
      // Subscribe once to get the state response
      const handler = ((event: CustomEvent) => {
        if (event.detail.actorId === CoursesActor.ACTOR_ID) {
          const system = ActorSystem.getInstance();
          system.unsubscribe('state:changed', handler as EventListener);
          resolve(event.detail.newState);
        }
      }) as EventListener;
      
      const system = ActorSystem.getInstance();
      system.subscribe('state:changed', handler);
      
      // Request current state
      actor.send({ type: 'get:state' });
    });
  }

  // Helper to get course by ID from current state
  public static async getCourseById(id: string): Promise<Course | undefined> {
    const state = await CoursesActor.getState();
    return state.courses.find(c => c.id === id || c.course_id === id);
  }
}
