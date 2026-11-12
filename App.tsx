/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { OmniAgentInstance } from './components/OmniAgentInstance';
import { PhoneAppType } from './types/phone';
import {
  Plus,
  Layers,
  LayoutGrid,
  Minimize2,
  Maximize2,
  X,
  Minus,
  Zap,
  Cpu,
  Activity,
  Terminal,
  Clock,
  Shield,
  Smartphone,
  Bot,
  Sparkles,
  Move,
  RefreshCw,
  FolderOpen,
  Volume2,
  AlertCircle,
  Star,
} from 'lucide-react';
import { ReviewModal } from './components/modals/ReviewModal';
import { TokenWalletWidget } from './components/widgets/TokenWalletWidget';
import { TokenBillingModal } from './components/modals/TokenBillingModal';


export const MAX_PROMPT_SLOTS = 5;

export interface PromptSlot {
  id: string;
  slotNumber: number;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prevBounds?: { x: number; y: number; width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  status: 'idle' | 'running' | 'paused' | 'completed';
  currentTaskSummary: string;
  stepProgress?: { current: number; total: number };
  currentApp: PhoneAppType;
  threadId: string;
  memoryUsageMb: number;
  themeColor: 'emerald' | 'cyan' | 'indigo' | 'amber' | 'rose' | 'teal';
}

const THEME_STYLES = {
  emerald: {
    border: 'border-emerald-500/40 hover:border-emerald-500/70',
    activeBorder: 'border-emerald-400 ring-2 ring-emerald-500/30',
    headerBg: 'bg-slate-900/95',
    pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    glow: 'shadow-emerald-500/10',
  },
  cyan: {
    border: 'border-cyan-500/40 hover:border-cyan-500/70',
    activeBorder: 'border-cyan-400 ring-2 ring-cyan-500/30',
    headerBg: 'bg-slate-900/95',
    pill: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-400',
    glow: 'shadow-cyan-500/10',
  },
  indigo: {
    border: 'border-indigo-500/40 hover:border-indigo-500/70',
    activeBorder: 'border-indigo-400 ring-2 ring-indigo-500/30',
    headerBg: 'bg-slate-900/95',
    pill: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-400',
    glow: 'shadow-indigo-500/10',
  },
  amber: {
    border: 'border-amber-500/40 hover:border-amber-500/70',
    activeBorder: 'border-amber-400 ring-2 ring-amber-500/30',
    headerBg: 'bg-slate-900/95',
    pill: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    glow: 'shadow-amber-500/10',
  },
  rose: {
    border: 'border-rose-500/40 hover:border-rose-500/70',
    activeBorder: 'border-rose-400 ring-2 ring-rose-500/30',
    headerBg: 'bg-slate-900/95',
    pill: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
    glow: 'shadow-rose-500/10',
  },
  teal: {
    border: 'border-teal-500/40 hover:border-teal-500/70',
    activeBorder: 'border-teal-400 ring-2 ring-teal-500/30',
    headerBg: 'bg-slate-900/95',
    pill: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    dot: 'bg-teal-400',
    glow: 'shadow-teal-500/10',
  },
};

const THEME_KEYS: Array<keyof typeof THEME_STYLES> = [
  'emerald',
  'cyan',
  'indigo',
  'amber',
  'rose',
  'teal',
];

export default function App() {
  const [slots, setSlots] = useState<PromptSlot[]>([
    {
      id: 'slot-1',
      slotNumber: 1,
      title: 'Prompt Slot #1: Autonomous Mobile Operator',
      x: 32,
      y: 64,
      width: 1040,
      height: 720,
      zIndex: 10,
      isMinimized: false,
      isMaximized: false,
      status: 'idle',
      currentTaskSummary: 'Ready for instructions',
      currentApp: 'home',
      threadId: 'IsolateWorker-0x01',
      memoryUsageMb: 42.4,
      themeColor: 'emerald',
    },
  ]);

  const [activeSlotId, setActiveSlotId] = useState<string>('slot-1');
  const [topZIndex, setTopZIndex] = useState<number>(10);
  const [limitToastMessage, setLimitToastMessage] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-dismiss limit toast banner
  useEffect(() => {
    if (!limitToastMessage) return;
    const timer = setTimeout(() => setLimitToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [limitToastMessage]);

  // Dragging & Resizing state
  const dragStateRef = useRef<{
    slotId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const resizeStateRef = useRef<{
    slotId: string;
    startX: number;
    startY: number;
    origW: number;
    origH: number;
  } | null>(null);

  // Bring a slot to top z-index and focus
  const focusSlot = useCallback((id: string) => {
    setActiveSlotId(id);
    setTopZIndex((prev) => {
      const nextZ = prev + 1;
      setSlots((current) =>
        current.map((slot) => (slot.id === id ? { ...slot, zIndex: nextZ } : slot))
      );
      return nextZ;
    });
  }, []);

  // Dynamically spawn a new independent app window (Max 5 slots limit enforced)
  const handleAddPromptSlot = useCallback(() => {
    setSlots((current) => {
      if (current.length >= MAX_PROMPT_SLOTS) {
        setLimitToastMessage(`Maximum limit of ${MAX_PROMPT_SLOTS} prompt slots reached. Close an existing slot to spawn another.`);
        return current;
      }

      setLimitToastMessage(null);
      const newSlotNumber = current.length > 0 ? Math.max(...current.map((s) => s.slotNumber)) + 1 : 1;
      const newId = `slot-${Date.now()}`;
      const color = THEME_KEYS[(newSlotNumber - 1) % THEME_KEYS.length];
      const offsetIndex = current.length % 6;
      const defaultX = Math.min(window.innerWidth - 600, 48 + offsetIndex * 42);
      const defaultY = Math.min(window.innerHeight - 500, 72 + offsetIndex * 36);

      const newSlot: PromptSlot = {
        id: newId,
        slotNumber: newSlotNumber,
        title: `Prompt Slot #${newSlotNumber}: Autonomous Agent`,
        x: defaultX,
        y: defaultY,
        width: Math.min(1040, window.innerWidth - 80),
        height: Math.min(720, window.innerHeight - 140),
        zIndex: topZIndex + 1,
        isMinimized: false,
        isMaximized: false,
        status: 'idle',
        currentTaskSummary: 'Ready for instructions',
        currentApp: 'home',
        threadId: `IsolateWorker-0x0${newSlotNumber}`,
        memoryUsageMb: +(36 + Math.random() * 12).toFixed(1),
        themeColor: color,
      };

      setTopZIndex((z) => z + 1);
      setActiveSlotId(newId);
      return [...current, newSlot];
    });
  }, [topZIndex]);

  // Window Controls: Close
  const handleCloseSlot = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  // Window Controls: Minimize
  const handleToggleMinimize = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextMin = !s.isMinimized;
          return { ...s, isMinimized: nextMin };
        }
        return s;
      })
    );
  };

  // Window Controls: Maximize / Restore
  const handleToggleMaximize = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          if (!s.isMaximized) {
            return {
              ...s,
              isMaximized: true,
              prevBounds: { x: s.x, y: s.y, width: s.width, height: s.height },
              x: 0,
              y: 48,
              width: window.innerWidth,
              height: window.innerHeight - 96,
            };
          } else {
            return {
              ...s,
              isMaximized: false,
              x: s.prevBounds?.x ?? 48,
              y: s.prevBounds?.y ?? 72,
              width: s.prevBounds?.width ?? 1040,
              height: s.prevBounds?.height ?? 720,
            };
          }
        }
        return s;
      })
    );
  };

  // Layout Organizers: Cascade
  const handleCascadeWindows = () => {
    setSlots((prev) =>
      prev.map((slot, idx) => ({
        ...slot,
        isMinimized: false,
        isMaximized: false,
        x: 32 + (idx % 8) * 38,
        y: 60 + (idx % 8) * 34,
        width: Math.min(1000, window.innerWidth - 120),
        height: Math.min(700, window.innerHeight - 150),
        zIndex: 10 + idx,
      }))
    );
  };

  // Layout Organizers: Tile Side-by-Side or Grid
  const handleTileWindows = () => {
    const visible = slots.filter((s) => !s.isMinimized);
    const count = visible.length;
    if (count === 0) return;

    const availableW = window.innerWidth;
    const availableH = window.innerHeight - 100; // room for top bar & dock
    const startY = 48;

    if (count === 1) {
      setSlots((prev) =>
        prev.map((s) =>
          s.id === visible[0].id
            ? { ...s, x: 20, y: startY + 10, width: availableW - 40, height: availableH - 20, isMaximized: false }
            : s
        )
      );
    } else if (count === 2) {
      const halfW = Math.floor(availableW / 2) - 16;
      setSlots((prev) =>
        prev.map((s) => {
          const idx = visible.findIndex((v) => v.id === s.id);
          if (idx === 0) {
            return { ...s, x: 10, y: startY + 10, width: halfW, height: availableH - 20, isMaximized: false };
          } else if (idx === 1) {
            return { ...s, x: halfW + 20, y: startY + 10, width: halfW, height: availableH - 20, isMaximized: false };
          }
          return s;
        })
      );
    } else {
      // 3 or more: 2x2 grid
      const cols = 2;
      const rows = Math.ceil(count / 2);
      const w = Math.floor(availableW / cols) - 16;
      const h = Math.floor(availableH / rows) - 16;

      setSlots((prev) =>
        prev.map((s) => {
          const idx = visible.findIndex((v) => v.id === s.id);
          if (idx >= 0) {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            return {
              ...s,
              x: 10 + col * (w + 12),
              y: startY + 10 + row * (h + 12),
              width: w,
              height: h,
              isMaximized: false,
            };
          }
          return s;
        })
      );
    }
  };

  // Global Pointer Events for Dragging and Resizing
  const handlePointerDownHeader = (id: string, e: React.PointerEvent) => {
    // Only drag with left click and not on control buttons
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;

    focusSlot(id);
    const slot = slots.find((s) => s.id === id);
    if (!slot || slot.isMaximized) return;

    dragStateRef.current = {
      slotId: id,
      startX: e.clientX,
      startY: e.clientY,
      origX: slot.x,
      origY: slot.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerDownResize = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    focusSlot(id);
    const slot = slots.find((s) => s.id === id);
    if (!slot || slot.isMaximized) return;

    resizeStateRef.current = {
      slotId: id,
      startX: e.clientX,
      startY: e.clientY,
      origW: slot.width,
      origH: slot.height,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStateRef.current) {
      const { slotId, startX, startY, origX, origY } = dragStateRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      setSlots((prev) =>
        prev.map((s) => {
          if (s.id === slotId) {
            const newX = Math.max(-s.width + 100, Math.min(window.innerWidth - 100, origX + dx));
            const newY = Math.max(48, Math.min(window.innerHeight - 80, origY + dy));
            return { ...s, x: newX, y: newY };
          }
          return s;
        })
      );
    } else if (resizeStateRef.current) {
      const { slotId, startX, startY, origW, origH } = resizeStateRef.current;
      const dw = e.clientX - startX;
      const dh = e.clientY - startY;

      setSlots((prev) =>
        prev.map((s) => {
          if (s.id === slotId) {
            const minW = 480;
            const minH = 460;
            const newW = Math.max(minW, origW + dw);
            const newH = Math.max(minH, origH + dh);
            return { ...s, width: newW, height: newH };
          }
          return s;
        })
      );
    }
  };

  const handlePointerUp = () => {
    dragStateRef.current = null;
    resizeStateRef.current = null;
  };

  // Status updates from isolated child instances with equality guard
  const handleInstanceStatusUpdate = useCallback(
    (slotId: string, status: {
      isExecuting: boolean;
      currentApp: PhoneAppType;
      taskSummary?: string;
      stepIndex: number;
      totalSteps: number;
    }) => {
      setSlots((prev) => {
        const slot = prev.find((s) => s.id === slotId);
        if (!slot) return prev;

        const nextStatus = status.isExecuting ? 'running' : 'idle';
        const nextApp = status.currentApp;
        const nextSummary = status.taskSummary || slot.currentTaskSummary;
        const nextStep = status.stepIndex + 1;
        const nextTotal = Math.max(1, status.totalSteps);

        if (
          slot.status === nextStatus &&
          slot.currentApp === nextApp &&
          slot.currentTaskSummary === nextSummary &&
          slot.stepProgress?.current === nextStep &&
          slot.stepProgress?.total === nextTotal
        ) {
          return prev; // Nothing changed, return exact same array reference
        }

        return prev.map((s) => {
          if (s.id === slotId) {
            return {
              ...s,
              status: nextStatus,
              currentApp: nextApp,
              currentTaskSummary: nextSummary,
              stepProgress: { current: nextStep, total: nextTotal },
            };
          }
          return s;
        });
      });
    },
    []
  );

  // Cached, referentially stable callbacks per slot
  const statusCallbacksRef = useRef<Map<string, (status: any) => void>>(new Map());
  const getStatusCallback = useCallback(
    (slotId: string) => {
      let cb = statusCallbacksRef.current.get(slotId);
      if (!cb) {
        cb = (status: any) => handleInstanceStatusUpdate(slotId, status);
        statusCallbacksRef.current.set(slotId, cb);
      }
      return cb;
    },
    [handleInstanceStatusUpdate]
  );

  // Keyboard shortcut: Ctrl+N or Cmd+N for adding prompt slot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handleAddPromptSlot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddPromptSlot]);

  // Aggregate metrics across isolated processes
  const totalSlotsCount = slots.length;
  const runningSlotsCount = slots.filter((s) => s.status === 'running').length;
  const totalMemoryMb = slots.reduce((acc, s) => acc + s.memoryUsageMb, 0).toFixed(1);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none relative font-sans"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 30%, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 1) 100%)',
      }}
    >
      {/* Top OS Desktop Command Bar */}
      <header className="h-12 bg-slate-900/90 border-b border-slate-800/80 px-4 flex items-center justify-between z-50 shrink-0 backdrop-blur-md shadow-sm">
        {/* Left: Branding & Core Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
              OmniAgent OS
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          {/* "+ Add Prompt Slot" PRIMARY SPAWN BUTTON (Max 5 Slots) */}
          <button
            onClick={handleAddPromptSlot}
            disabled={totalSlotsCount >= MAX_PROMPT_SLOTS}
            data-agent-target="btn-add-prompt-slot"
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg active:scale-95 ${
              totalSlotsCount >= MAX_PROMPT_SLOTS
                ? 'bg-slate-800 text-slate-400 border border-slate-700/80 cursor-not-allowed opacity-75'
                : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/40 cursor-pointer ring-1 ring-emerald-400/40'
            }`}
            title={
              totalSlotsCount >= MAX_PROMPT_SLOTS
                ? `Maximum limit of ${MAX_PROMPT_SLOTS} slots reached`
                : 'Dynamically spawn a new, independent app window in a parallel process thread (Ctrl+N)'
            }
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>
              + Add Prompt Slot{' '}
              <span className="text-[10px] font-mono opacity-80">
                ({totalSlotsCount}/{MAX_PROMPT_SLOTS})
              </span>
            </span>
            <span className="text-[10px] font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded-md border border-emerald-400/30 text-emerald-300 hidden md:inline">
              Ctrl+N
            </span>
          </button>

          {/* Quick Active Slots Count Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                totalSlotsCount >= MAX_PROMPT_SLOTS ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span>
              {totalSlotsCount}/{MAX_PROMPT_SLOTS} Slots {totalSlotsCount >= MAX_PROMPT_SLOTS ? '(Max)' : 'Isolated'}
            </span>
            {runningSlotsCount > 0 && (
              <span className="text-emerald-400 font-bold ml-1">
                ({runningSlotsCount} executing)
              </span>
            )}
          </div>
        </div>

        {/* Center: System Performance & Isolation Telemetry */}
        <div className="hidden xl:flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-1 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Workers: {totalSlotsCount} Threads</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Process Isolation: Active</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Memory: ~{totalMemoryMb} MB</span>
          </div>
        </div>

        {/* Right: Window Arrangement Tools, Token Billing & Feedback */}
        <div className="flex items-center gap-1.5">
          {/* Standalone Token Quota Wallet Widget ($8 = 20M tokens) */}
          <TokenWalletWidget onOpenBillingModal={() => setIsBillingModalOpen(true)} />

          {/* Place for users to write their review */}
          <button
            onClick={() => setIsReviewModalOpen(true)}
            data-agent-target="btn-open-review-modal"
            className="p-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
            title="Write a review or feedback about the app"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold">Write Review</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5 hidden sm:block" />

          <button
            onClick={handleCascadeWindows}
            className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
            title="Cascade windows diagonally"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Cascade</span>
          </button>
          <button
            onClick={handleTileWindows}
            className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
            title="Tile windows side-by-side or in grid"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Tile Grid</span>
          </button>
        </div>
      </header>

      {/* Main OS Canvas: Independent Overlapping App Windows */}
      <div className="flex-1 relative overflow-hidden">
        {/* Floating Max Limit Warning Toast Banner */}
        {limitToastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{limitToastMessage}</span>
            <button
              onClick={() => setLimitToastMessage(null)}
              className="p-1 hover:bg-black/15 rounded-lg text-slate-950 ml-1 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {slots.length === 0 ? (
          /* Empty Workspace State */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-xl">
              <Layers className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h2 className="text-lg font-bold text-white">No Active Prompt Slots</h2>
              <p className="text-xs text-slate-400">
                Click "+ Add Prompt Slot" to spawn a new independent app window with isolated memory,
                autonomous actuators, and background threading.
              </p>
            </div>
            <button
              onClick={handleAddPromptSlot}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Prompt Slot</span>
            </button>
          </div>
        ) : (
          slots.map((slot) => {
            const isFocused = activeSlotId === slot.id;
            const theme = THEME_STYLES[slot.themeColor];

            return (
              <div
                key={slot.id}
                onPointerDown={() => focusSlot(slot.id)}
                className={`absolute rounded-2xl flex flex-col overflow-hidden transition-shadow duration-150 ${
                  slot.isMinimized
                    ? 'opacity-0 pointer-events-none scale-90 translate-y-8'
                    : 'opacity-100 shadow-2xl'
                } ${isFocused ? `${theme.activeBorder} ${theme.glow}` : theme.border}`}
                style={{
                  left: slot.isMaximized ? 0 : `${slot.x}px`,
                  top: slot.isMaximized ? 0 : `${slot.y}px`,
                  width: slot.isMaximized ? '100%' : `${slot.width}px`,
                  height: slot.isMaximized ? '100%' : `${slot.height}px`,
                  zIndex: slot.zIndex,
                  backgroundColor: '#020617',
                }}
              >
                {/* Independent Window OS Titlebar (Draggable Handle) */}
                <div
                  onPointerDown={(e) => handlePointerDownHeader(slot.id, e)}
                  className={`h-11 px-3.5 border-b border-slate-800/80 flex items-center justify-between text-xs select-none cursor-move ${
                    isFocused ? 'bg-slate-900 text-white' : 'bg-slate-950/95 text-slate-400'
                  }`}
                >
                  {/* Left: Window Title & Status Pill */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          slot.status === 'running'
                            ? 'bg-emerald-400 animate-pulse'
                            : slot.status === 'paused'
                            ? 'bg-amber-400'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span className="font-bold text-xs truncate max-w-[220px] sm:max-w-xs">
                        {slot.title}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${theme.pill}`}
                    >
                      {slot.status === 'running'
                        ? `⚡ Executing (${slot.stepProgress?.current}/${slot.stepProgress?.total})`
                        : slot.status === 'paused'
                        ? '⏸️ Paused'
                        : '🟢 Idle'}
                    </span>

                    <span className="text-[10px] text-slate-500 font-mono hidden xl:inline shrink-0">
                      [{slot.threadId} • {slot.memoryUsageMb} MB]
                    </span>
                  </div>

                  {/* Right: Window Controls (Minimize, Maximize, Close) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleToggleMinimize(slot.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Minimize to taskbar (runs in background)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleToggleMaximize(slot.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title={slot.isMaximized ? 'Restore' : 'Maximize'}
                    >
                      {slot.isMaximized ? (
                        <Minimize2 className="w-3.5 h-3.5" />
                      ) : (
                        <Maximize2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleCloseSlot(slot.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Close slot"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Independent App Window Body (Mounts complete OmniAgentInstance with full state isolation) */}
                <div className="flex-1 w-full h-[calc(100%-44px)] overflow-hidden relative">
                  <OmniAgentInstance
                    instanceId={slot.id}
                    slotNumber={slot.slotNumber}
                    onStatusUpdate={getStatusCallback(slot.id)}
                    isWindowed={true}
                    onOpenBillingModal={() => setIsBillingModalOpen(true)}
                  />
                </div>

                {/* Resizable Corner Drag Handle */}
                {!slot.isMaximized && (
                  <div
                    onPointerDown={(e) => handlePointerDownResize(slot.id, e)}
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-40 flex items-center justify-center opacity-40 hover:opacity-100 transition"
                    title="Resize window"
                  >
                    <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 mr-0.5 mb-0.5" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Desktop Taskbar / Shelf */}
      <footer className="h-12 bg-slate-900/90 border-t border-slate-800/90 px-4 flex items-center justify-between z-50 shrink-0 backdrop-blur-md">
        {/* Left: Taskbar Instances List */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {slots.map((slot) => {
            const isFocused = activeSlotId === slot.id && !slot.isMinimized;
            const theme = THEME_STYLES[slot.themeColor];

            return (
              <button
                key={slot.id}
                onClick={() => {
                  if (slot.isMinimized) {
                    setSlots((prev) =>
                      prev.map((s) => (s.id === slot.id ? { ...s, isMinimized: false } : s))
                    );
                  }
                  focusSlot(slot.id);
                }}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs transition cursor-pointer max-w-[200px] shrink-0 ${
                  isFocused
                    ? 'bg-slate-800 border-emerald-500/60 text-white font-bold shadow-xs'
                    : slot.isMinimized
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title={`Click to focus or restore ${slot.title}`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    slot.status === 'running'
                      ? 'bg-emerald-400 animate-pulse'
                      : slot.status === 'paused'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}
                />
                <span className="truncate">Slot #{slot.slotNumber}</span>
                {slot.status === 'running' && (
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">⚡</span>
                )}
              </button>
            );
          })}

          {/* Quick Add Button on Taskbar (Max 5 Slots) */}
          <button
            onClick={handleAddPromptSlot}
            disabled={totalSlotsCount >= MAX_PROMPT_SLOTS}
            className={`p-1.5 px-2.5 border rounded-xl text-xs flex items-center gap-1.5 transition shrink-0 ${
              totalSlotsCount >= MAX_PROMPT_SLOTS
                ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white cursor-pointer active:scale-95'
            }`}
            title={
              totalSlotsCount >= MAX_PROMPT_SLOTS
                ? `Maximum of ${MAX_PROMPT_SLOTS} prompt slots reached`
                : 'Add Prompt Slot'
            }
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">
              Add Slot {totalSlotsCount >= MAX_PROMPT_SLOTS ? `(${MAX_PROMPT_SLOTS}/${MAX_PROMPT_SLOTS})` : `(${totalSlotsCount}/${MAX_PROMPT_SLOTS})`}
            </span>
          </button>
        </div>

        {/* Right: OS Quick Info & Clock */}
        <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0 font-mono">
          <span className="hidden md:inline text-[11px] text-slate-500">
            Multi-Instance Process Isolation v3.5
          </span>
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-xl text-slate-300">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </footer>

      {/* Place for users to write their review */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />

      {/* Standalone Token Quota & Billing Management Modal ($8 for 20M Tokens) */}
      <TokenBillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
      />
    </div>
  );
}
