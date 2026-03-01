'use client';

/**
 * @fileOverview A simple, browser-compatible event emitter to avoid Node.js module dependencies
 * that can cause client-side crashes in production environments like Vercel.
 */

type Listener = (data: any) => void;

class SimpleEmitter {
  private listeners: { [event: string]: Listener[] } = {};

  on(event: string, listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  off(event: string, listener: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  emit(event: string, data: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(l => l(data));
  }
}

export const errorEmitter = new SimpleEmitter();
