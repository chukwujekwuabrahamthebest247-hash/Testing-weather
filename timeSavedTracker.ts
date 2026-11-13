/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TimeSavedMetrics {
  monthlySecondsSaved: number;
  totalTasksCompleted: number;
  totalTapsAutomated: number;
  lastCalculated: string;
}

let currentMetrics: TimeSavedMetrics = {
  monthlySecondsSaved: 16200, // 4.5 hours
  totalTasksCompleted: 42,
  totalTapsAutomated: 388,
  lastCalculated: new Date().toLocaleDateString(),
};

const listeners = new Set<(metrics: TimeSavedMetrics) => void>();

export function getTimeSavedMetrics(): TimeSavedMetrics {
  return { ...currentMetrics };
}

export function subscribeToTimeSavedMetrics(cb: (metrics: TimeSavedMetrics) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function recordAutomationTask(params: {
  taskTitle: string;
  app: string;
  stepsCount: number;
  speedMultiplier: number;
}): void {
  const secondsSaved = Math.max(30, params.stepsCount * 18);
  currentMetrics = {
    ...currentMetrics,
    monthlySecondsSaved: currentMetrics.monthlySecondsSaved + secondsSaved,
    totalTasksCompleted: currentMetrics.totalTasksCompleted + 1,
    totalTapsAutomated: currentMetrics.totalTapsAutomated + params.stepsCount * 3,
    lastCalculated: new Date().toLocaleDateString(),
  };

  listeners.forEach((cb) => cb(currentMetrics));
}

export function formatHoursSaved(seconds: number): string {
  const hours = seconds / 3600;
  return hours.toFixed(1);
}
