
'use client';

/**
 * @fileOverview A robust, browser-safe event emitter to avoid Node.js dependencies in the client.
 */

type Listener = (data: any) => void;

class SimpleEventEmitter {
  private listeners: Record<string, Listener[]> = {};

  on(event: string, listener: Listener) {
    if (typeof window === 'undefined') return;
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    if (!this.listeners[event].includes(listener)) {
      this.listeners[event].push(listener);
    }
  }

  off(event: string, listener: Listener) {
    if (typeof window === 'undefined') return;
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  emit(event: string, data: any) {
    if (typeof window === 'undefined') return;
    
    // Defer emission to avoid triggering state updates during render
    if (this.listeners[event]) {
      this.listeners[event].forEach(l => {
        try {
          l(data);
        } catch (e) {
          console.error('Error in event listener:', e);
        }
      });
    }
  }
}

export const errorEmitter = new SimpleEventEmitter();
