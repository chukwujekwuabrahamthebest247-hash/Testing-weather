/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentStep } from '../types/phone';

export interface TimeSavedMetrics {
  monthKey: string;
  monthlySecondsSaved: number;
  totalTasksCompleted: number;
  totalTapsAutomated: number;
  lastCalculated: string;
}

const STORAGE_KEY = 'omniagent_accurate_time_saved_v1';

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function loadInitialMetrics(): TimeSavedMetrics {
  const currentMonth = getCurrentMonthKey();
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TimeSavedMetrics;
        // Reset monthly counter automatically if a new month has started
        if (parsed.monthKey === currentMonth) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Time-saved storage read notice:', err);
  }

  return {
    monthKey: currentMonth,
    monthlySecondsSaved: 0,
    totalTasksCompleted: 0,
    totalTapsAutomated: 0,
    lastCalculated: new Date().toLocaleDateString(),
  };
}

let currentMetrics: TimeSavedMetrics = loadInitialMetrics();
const listeners = new Set<(metrics: TimeSavedMetrics) => void>();

function saveMetrics(metrics: TimeSavedMetrics): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
    }
  } catch (err) {
    console.warn('Time-saved storage write notice:', err);
  }
}

export function getTimeSavedMetrics(): TimeSavedMetrics {
  return { ...currentMetrics };
}

export function subscribeToTimeSavedMetrics(cb: (metrics: TimeSavedMetrics) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Computes accurate human manual time (in seconds) and equivalent taps
 * based on the actual step types executed by the AI agent.
 */
export function calculateAccurateHumanTime(steps: AgentStep[] = []): {
  secondsSaved: number;
  equivalentTaps: number;
} {
  if (!steps || steps.length === 0) {
    return { secondsSaved: 4, equivalentTaps: 1 };
  }

  let totalSeconds = 0;
  let totalTaps = 0;

  for (const step of steps) {
    const action = (step.action || '').toLowerCase();
    // Base 2.5s for a human to visually locate the UI target on screen
    totalSeconds += 2.5;

    if (action === 'type_text') {
      const charCount = (step.value || '').length;
      // Average mobile thumb typing is ~3.5 chars/sec + 1 tap to focus field
      totalSeconds += Math.max(3, Math.round(charCount / 3.5));
      totalTaps += Math.max(2, charCount);
    } else if (action === 'navigate_app' || action === 'go_home') {
      // Unlocking/swiping home + locating app icon + waiting for splash load
      totalSeconds += 3.5;
      totalTaps += 2;
    } else if (action === 'swipe_up' || action === 'swipe_down') {
      totalSeconds += 2.0;
      totalTaps += 1;
    } else if (action === 'tap') {
      totalSeconds += 1.5;
      totalTaps += 1;
    } else if (action === 'biometric_auth' || action === 'guardrail_approval') {
      totalSeconds += 3.0;
      totalTaps += 1;
    } else {
      totalSeconds += 1.5;
      totalTaps += 1;
    }
  }

  return {
    secondsSaved: Math.round(totalSeconds),
    equivalentTaps: totalTaps,
  };
}

export function recordAutomationTask(params: {
  taskTitle: string;
  app: string;
  stepsCount: number;
  steps?: AgentStep[];
  speedMultiplier: number;
}): void {
  const currentMonth = getCurrentMonthKey();
  if (currentMetrics.monthKey !== currentMonth) {
    currentMetrics = loadInitialMetrics();
  }

  const { secondsSaved, equivalentTaps } = params.steps
    ? calculateAccurateHumanTime(params.steps)
    : {
        secondsSaved: Math.max(4, params.stepsCount * 5),
        equivalentTaps: Math.max(1, params.stepsCount * 2),
      };

  currentMetrics = {
    ...currentMetrics,
    monthKey: currentMonth,
    monthlySecondsSaved: currentMetrics.monthlySecondsSaved + secondsSaved,
    totalTasksCompleted: currentMetrics.totalTasksCompleted + 1,
    totalTapsAutomated: currentMetrics.totalTapsAutomated + equivalentTaps,
    lastCalculated: new Date().toLocaleDateString(),
  };

  saveMetrics(currentMetrics);
  listeners.forEach((cb) => cb(currentMetrics));
}

export function formatHoursSaved(seconds: number): string {
  const hours = seconds / 3600;
  // Show 2 decimal places when under 1 hour so users immediately see real progress (e.g., 0.05h)
  return hours < 1 && hours > 0 ? hours.toFixed(2) : hours.toFixed(1);
}
