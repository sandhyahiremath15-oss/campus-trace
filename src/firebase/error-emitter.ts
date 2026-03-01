'use client';

/**
 * @fileOverview A simple, browser-compatible event emitter to avoid Node.js module dependencies.
 */

type Listener = (data: any) => void;

const listeners: Record<string, Listener[]> = {};

export const errorEmitter = {
  on(event: string, listener: Listener) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(listener);
  },
  off(event: string, listener: Listener) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(l => l !== listener);
  },
  emit(event: string, data: any) {
    if (!listeners[event]) return;
    listeners[event].forEach(l => l(data));
  }
};
