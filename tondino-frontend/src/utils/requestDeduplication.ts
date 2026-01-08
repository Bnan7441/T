/**
 * Request Deduplication Utility
 * 
 * Prevents duplicate API requests and provides:
 * - Request caching
 * - In-flight request tracking
 * - Automatic request coalescing
 * - TTL-based cache invalidation
 */

interface RequestCache {
  promise: Promise<any>;
  timestamp: number;
  data?: any;
}

interface DedupeOptions {
  ttl?: number; // Time to live in milliseconds
  enabled?: boolean;
}

class RequestDeduplicator {
  private inFlightRequests: Map<string, RequestCache> = new Map();
  private cache: Map<string, RequestCache> = new Map();
  private defaultTTL: number = 5000; // 5 seconds default

  /**
   * Generate a unique key for a request
   */
  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Check if cached response is still valid
   */
  private isValid(cached: RequestCache, ttl: number): boolean {
    return Date.now() - cached.timestamp < ttl;
  }

  /**
   * Execute deduplicated fetch request
   */
  async fetch<T = any>(
    url: string,
    options?: RequestInit,
    dedupeOptions: DedupeOptions = {}
  ): Promise<T> {
    const { ttl = this.defaultTTL, enabled = true } = dedupeOptions;

    if (!enabled) {
      return fetch(url, options).then(res => res.json());
    }

    const key = this.generateKey(url, options);

    // Check cache first (only for GET requests)
    const method = options?.method || 'GET';
    if (method === 'GET') {
      const cached = this.cache.get(key);
      if (cached && this.isValid(cached, ttl)) {
        console.log('[Dedupe] Cache hit:', url);
        return Promise.resolve(cached.data);
      }
    }

    // Check in-flight requests
    const inFlight = this.inFlightRequests.get(key);
    if (inFlight) {
      console.log('[Dedupe] Using in-flight request:', url);
      return inFlight.promise;
    }

    // Make new request
    console.log('[Dedupe] New request:', url);
    const promise = fetch(url, options)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();

        // Cache GET requests
        if (method === 'GET') {
          this.cache.set(key, {
            promise,
            timestamp: Date.now(),
            data
          });
        }

        return data;
      })
      .finally(() => {
        this.inFlightRequests.delete(key);
      });

    this.inFlightRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  /**
   * Invalidate cache for a specific key or pattern
   */
  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      // Clear all cache
      this.cache.clear();
      console.log('[Dedupe] Cache cleared');
      return;
    }

    const keysToDelete: string[] = [];

    if (typeof pattern === 'string') {
      keysToDelete.push(pattern);
    } else {
      // RegExp pattern
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`[Dedupe] Invalidated ${keysToDelete.length} cache entries`);
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(ttl: number = this.defaultTTL): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`[Dedupe] Cleared ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      inFlightCount: this.inFlightRequests.size,
      cacheKeys: Array.from(this.cache.keys()),
      inFlightKeys: Array.from(this.inFlightRequests.keys())
    };
  }

  /**
   * Preload/prefetch data
   */
  async prefetch<T = any>(
    url: string,
    options?: RequestInit,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    return this.fetch<T>(url, options, { ttl, enabled: true });
  }
}

// Singleton instance
export const requestDeduplicator = new RequestDeduplicator();

// React Hook for request deduplication
export function useDedupedFetch<T = any>(
  url: string | null,
  options?: RequestInit,
  dedupeOptions?: DedupeOptions
) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!url) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    requestDeduplicator
      .fetch<T>(url, options, dedupeOptions)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, options, dedupeOptions]);

  return { data, error, isLoading };
}

// Batch request manager for multiple simultaneous requests
export class BatchRequestManager {
  private batchQueue: Map<string, Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>> = new Map();
  
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchDelay: number = 50; // ms

  /**
   * Add request to batch
   */
  async request<T = any>(key: string, fetcher: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batchQueue.has(key)) {
        this.batchQueue.set(key, []);
      }

      this.batchQueue.get(key)!.push({ resolve, reject });

      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }

      this.batchTimeout = setTimeout(() => {
        this.executeBatch(key, fetcher);
      }, this.batchDelay);
    });
  }

  /**
   * Execute batched requests
   */
  private async executeBatch<T = any>(key: string, fetcher: () => Promise<T>) {
    const callbacks = this.batchQueue.get(key);
    if (!callbacks || callbacks.length === 0) return;

    this.batchQueue.delete(key);
    console.log(`[Batch] Executing ${callbacks.length} batched requests for:`, key);

    try {
      const result = await fetcher();
      callbacks.forEach(cb => cb.resolve(result));
    } catch (error) {
      callbacks.forEach(cb => cb.reject(error));
    }
  }
}

export const batchRequestManager = new BatchRequestManager();

// Auto-cleanup expired cache entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    requestDeduplicator.clearExpired();
  }, 60000);
}

import React from 'react';
