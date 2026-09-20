'use client';

import * as React from 'react';
import { Play, Pause, RotateCcw, Flame, Coffee, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FocusTimerCard() {
  const [mode, setMode] = React.useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = React.useState(25 * 60);
  const [isRunning, setIsRunning] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [sessionsCompleted, setSessionsCompleted] = React.useState(0);

  // Play synthetic chime via Web Audio API
  const playChime = React.useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // AudioContext blocked or unsupported; silent fallback
    }
  }, [soundEnabled]);

  // Timer interval
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playChime();
            if (mode === 'focus') {
              setSessionsCompleted((c) => c + 1);
              setMode('break');
              return 5 * 60;
            } else {
              setMode('focus');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, playChime]);

  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalDuration = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progressPct = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-5 shadow-xs transition-all hover:border-border">
      {/* Subtle background glow when running */}
      {isRunning && (
        <div
          className={`absolute -right-12 -top-12 size-40 rounded-full blur-3xl opacity-20 pointer-events-none ${
            mode === 'focus' ? 'bg-primary' : 'bg-emerald-500'
          }`}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex size-8 items-center justify-center rounded-xl ring-1 transition-colors ${
              mode === 'focus'
                ? 'bg-primary/10 text-primary ring-primary/20'
                : 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20'
            }`}
          >
            {mode === 'focus' ? <Flame className="size-4" /> : <Coffee className="size-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {mode === 'focus' ? 'Deep Work Sprint' : 'Rest & Recharge'}
              </h3>
              {isRunning && (
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              {sessionsCompleted} sesi selesai hari ini
            </p>
          </div>
        </div>

        {/* Audio Toggle & Mode Switcher */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={soundEnabled ? 'Matikan suara chime' : 'Nyalakan suara chime'}
            aria-label="Toggle chime sound"
          >
            {soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          </button>

          <div className="flex rounded-lg bg-muted/60 p-0.5 text-[10px] font-mono font-semibold">
            <button
              type="button"
              onClick={() => switchMode('focus')}
              className={`rounded-md px-2 py-1 transition-colors ${
                mode === 'focus'
                  ? 'bg-surface text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              25m
            </button>
            <button
              type="button"
              onClick={() => switchMode('break')}
              className={`rounded-md px-2 py-1 transition-colors ${
                mode === 'break'
                  ? 'bg-surface text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              5m
            </button>
          </div>
        </div>
      </div>

      {/* Main Clock Readout */}
      <div className="my-4 flex items-baseline justify-between">
        <div className="font-mono text-4xl font-extrabold tracking-tight tabular-nums text-foreground">
          {timeFormatted}
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono text-muted-foreground">
            {progressPct}% selesai
          </span>
        </div>
      </div>

      {/* Segmented / Smooth Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            mode === 'focus' ? 'bg-primary' : 'bg-emerald-500'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={toggleRunning}
          size="sm"
          className={`flex-1 h-8 text-xs font-semibold gap-1.5 transition-all active:scale-[0.98] ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : mode === 'focus'
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="size-3.5" />
              <span>Jeda Sesi</span>
            </>
          ) : (
            <>
              <Play className="size-3.5 fill-current" />
              <span>Mulai {mode === 'focus' ? 'Fokus' : 'Istirahat'}</span>
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={resetTimer}
          size="sm"
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground active:scale-[0.98]"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
