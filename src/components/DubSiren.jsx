import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Zap, Flame, Volume2, Waves, Lock, Unlock } from 'lucide-react';
import RotaryKnob from './RotaryKnob';
import { SIREN_PRESETS } from '../audio/useDubAudio';

export default function DubSiren({
  params,
  triggerSiren,
  isSirenLatched,
  toggleSirenLatch,
  setSirenPitch,
  setSirenLfoRate,
  setSirenLfoDepth,
  setSirenWave,
  setSirenLfoWave,
  setSirenVolume,
  setSirenDelaySend,
  applySirenPreset,
}) {
  const waveforms = [
    { id: 'sine', label: 'SINE', icon: '∿' },
    { id: 'square', label: 'SQR', icon: '⊓' },
    { id: 'sawtooth', label: 'SAW', icon: '⩓' },
    { id: 'triangle', label: 'TRI', icon: '▲' },
  ];

  const lfoWaves = [
    { id: 'sine', label: 'SINE' },
    { id: 'square', label: 'SQR' },
    { id: 'sawtooth', label: 'SAW' },
  ];

  const isFiring = params.sirenTriggered;

  return (
    <div className="relative rounded-xl bg-gradient-to-b from-[#1c1e28] to-[#12141c] border border-amber-500/30 p-4 shadow-rack-bevel overflow-hidden flex flex-col justify-between">
      {/* Decorative Screws */}
      <div className="absolute top-2 left-2 rack-screw" />
      <div className="absolute top-2 right-2 rack-screw" />

      {/* Module Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 px-3">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${isFiring ? 'text-amber-400 animate-bounce' : 'text-amber-500/70'}`} />
          <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-amber-300">
            DUB SIREN SYNTH // NJD-STYLE ANALOG
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Latch / Lock Switch */}
          <button
            id="switch-siren-latch"
            onClick={toggleSirenLatch}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 border transition-all ${
              isSirenLatched
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
            title="Mode Latch: activer pour jouer en continu et manipuler les potentiomètres"
          >
            {isSirenLatched ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            {isSirenLatched ? 'LATCH ON' : 'MOMENTARY'}
          </button>
          <span className="tape-label tape-label-red text-[10px]">OSC + LFO</span>
        </div>
      </div>

      {/* Preset Buttons Bar */}
      <div className="mb-3 flex items-center justify-between gap-1.5 px-1 bg-black/40 p-1.5 rounded-lg border border-zinc-800">
        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider pl-1">
          PRESETS:
        </span>
        <div className="flex items-center gap-1.5">
          {Object.entries(SIREN_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              id={`btn-siren-preset-${key}`}
              onClick={() => applySirenPreset(key)}
              className="px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-[10px] font-mono font-bold text-zinc-200 hover:text-white border border-zinc-700/60 transition-all"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Center Section: Selectors + Knobs + Big Trigger */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Waveform Selection (Carrier & LFO) - 3 cols */}
        <div className="md:col-span-3 flex flex-col gap-2.5 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/90 shadow-inner">
          {/* Carrier Wave */}
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
              CARRIER WAVE
            </span>
            <div className="grid grid-cols-2 gap-1">
              {waveforms.map((w) => (
                <button
                  key={w.id}
                  id={`btn-siren-wave-${w.id}`}
                  onClick={() => setSirenWave(w.id)}
                  className={`py-1 px-1 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1 border transition-all ${
                    params.sirenWave === w.id
                      ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span>{w.icon}</span>
                  <span>{w.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LFO Wave */}
          <div className="pt-2 border-t border-zinc-800">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
              LFO WAVE
            </span>
            <div className="grid grid-cols-3 gap-1">
              {lfoWaves.map((w) => (
                <button
                  key={w.id}
                  id={`btn-siren-lfo-${w.id}`}
                  onClick={() => setSirenLfoWave(w.id)}
                  className={`py-1 px-1 rounded text-[9px] font-mono font-bold flex items-center justify-center border transition-all ${
                    params.sirenLfoWave === w.id
                      ? 'bg-amber-400/20 text-amber-300 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/80 hover:text-zinc-200'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rotary Knobs (Pitch, LFO Rate, Depth, Vol, Delay Send) - 6 cols */}
        <div className="md:col-span-6 grid grid-cols-3 gap-2 py-1 items-center justify-center bg-black/20 p-2 rounded-lg border border-zinc-800/60">
          <RotaryKnob
            label="PITCH"
            subLabel="BASE FREQ"
            value={params.sirenPitch}
            min={80}
            max={2000}
            step={5}
            defaultValue={580}
            unit="Hz"
            onChange={setSirenPitch}
            size={52}
            color="amber"
          />

          <RotaryKnob
            label="LFO SPEED"
            subLabel="MOD RATE"
            value={params.sirenLfoRate}
            min={0.2}
            max={25}
            step={0.1}
            defaultValue={5.5}
            unit="Hz"
            onChange={setSirenLfoRate}
            size={52}
            color="amber"
          />

          <RotaryKnob
            label="LFO DEPTH"
            subLabel="INTENSITY"
            value={params.sirenLfoDepth}
            min={0}
            max={1000}
            step={10}
            defaultValue={380}
            unit="Hz"
            onChange={setSirenLfoDepth}
            size={52}
            color="amber"
          />

          <RotaryKnob
            label="SIREN VOL"
            subLabel="LEVEL"
            value={params.sirenVolume}
            min={0}
            max={1.2}
            step={0.02}
            defaultValue={0.75}
            unit=""
            displayFormat={(v) => `${Math.round(v * 100)}%`}
            onChange={setSirenVolume}
            size={48}
            color="green"
          />

          <RotaryKnob
            label="TO DELAY"
            subLabel="FX SEND"
            value={params.sirenDelaySend}
            min={0}
            max={1.0}
            step={0.02}
            defaultValue={0.65}
            unit=""
            displayFormat={(v) => `${Math.round(v * 100)}%`}
            onChange={setSirenDelaySend}
            size={48}
            color="cyan"
          />

          {/* Mini Status Monitor */}
          <div className="flex flex-col items-center justify-center p-2 rounded bg-zinc-950 border border-zinc-800 text-center">
            <span className="text-[9px] font-mono text-zinc-500 uppercase">STATUS</span>
            <span
              className={`text-[11px] font-mono font-bold mt-1 ${
                isFiring ? 'text-amber-400 animate-pulse' : 'text-zinc-600'
              }`}
            >
              {isFiring ? 'FIRING 🔊' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Big Momentary Trigger Button - 3 cols */}
        <div className="md:col-span-3 flex flex-col items-center justify-center p-2">
          <span className="text-[10px] font-mono font-bold text-amber-400/90 uppercase tracking-wider mb-2 text-center">
            SIREN TRIGGER
          </span>

          <motion.button
            id="btn-siren-trigger"
            onPointerDown={() => triggerSiren(true)}
            onPointerUp={() => triggerSiren(false)}
            onPointerLeave={() => {
              if (params.sirenTriggered && !isSirenLatched) triggerSiren(false);
            }}
            whileTap={{ scale: 0.94 }}
            className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center select-none shadow-2xl transition-all cursor-pointer touch-none relative ${
              isFiring
                ? 'bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-white text-black shadow-[0_0_35px_#f59e0b]'
                : 'bg-gradient-to-b from-amber-600 to-amber-900 border-amber-400/60 text-amber-100 hover:border-amber-300 shadow-[0_6px_20px_rgba(0,0,0,0.8)]'
            }`}
          >
            {/* Outer Bezel */}
            <div className="absolute inset-0 rounded-full border border-black/40" />

            <Flame className={`w-7 h-7 mb-0.5 ${isFiring ? 'animate-bounce text-black' : 'text-amber-200'}`} />
            <span className="text-[11px] font-mono font-extrabold tracking-wider text-center leading-tight">
              {isSirenLatched ? (isFiring ? 'LOCKED ON' : 'TAP TO ON') : 'HOLD TO PLAY'}
            </span>
            <span className="text-[8px] font-mono opacity-80 uppercase tracking-tighter mt-0.5">
              TRIGGER
            </span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Info Stripe */}
      <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isFiring ? 'led-active-amber' : 'led-off'}`} />
          <span>VCF/LFO MODULATION ACTIVE</span>
        </span>
        <span className="text-zinc-400">
          CARRIER: <span className="text-amber-400 font-bold uppercase">{params.sirenWave}</span> | LFO: <span className="text-amber-400 font-bold uppercase">{params.sirenLfoWave}</span>
        </span>
      </div>

      {/* Decorative Bottom Screws */}
      <div className="absolute bottom-2 left-2 rack-screw" />
      <div className="absolute bottom-2 right-2 rack-screw" />
    </div>
  );
}
