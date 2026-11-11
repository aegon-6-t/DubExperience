import React from 'react';
import { motion } from 'framer-motion';
import { Repeat, Sliders, ShieldX, Disc3, Radio } from 'lucide-react';
import RotaryKnob from './RotaryKnob';

export default function DubDelay({
  params,
  setDelayTime,
  setDelayFeedback,
  setDelayTone,
  setDelayWet,
  killFeedback,
}) {
  // Quick delay sync divisions based on typical Dub tempo (~76-120 BPM)
  const timePresets = [
    { label: '1/16', time: 0.12, name: '120ms Slap' },
    { label: '1/8', time: 0.25, name: '250ms Groove' },
    { label: '1/8d', time: 0.38, name: '380ms Dotted Dub' },
    { label: '1/4', time: 0.50, name: '500ms Space' },
    { label: 'LONG', time: 0.85, name: '850ms Infinite' },
  ];

  const isSelfOscillating = params.delayFeedback >= 0.90;

  return (
    <div className="relative rounded-xl bg-gradient-to-b from-[#181a24] to-[#0f1118] border border-emerald-500/30 p-4 shadow-rack-bevel overflow-hidden flex flex-col justify-between">
      {/* Decorative Screws */}
      <div className="absolute top-2 left-2 rack-screw" />
      <div className="absolute top-2 right-2 rack-screw" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 px-3">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-300">
            DUB TAPE DELAY // FX REPEAT LOOP
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Feedback runaway warning LED */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isSelfOscillating ? 'led-active-red animate-ping' : 'led-active-green'
              }`}
            />
            <span className={isSelfOscillating ? 'text-red-400 font-bold' : 'text-zinc-400'}>
              {isSelfOscillating ? 'OSCILLATING ⚠️' : 'ECHO STABLE'}
            </span>
          </div>
          <span className="tape-label tape-label-black text-[10px]">TAPE SATURATION</span>
        </div>
      </div>

      {/* Sync Buttons */}
      <div className="mb-3 flex items-center justify-between gap-1.5 px-1 bg-black/40 p-1.5 rounded-lg border border-zinc-800">
        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider pl-1">
          TIME SYNC:
        </span>
        <div className="flex items-center gap-1.5">
          {timePresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setDelayTime(preset.time)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all ${
                Math.abs(params.delayTime - preset.time) < 0.03
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                  : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700/60'
              }`}
              title={preset.name}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Knobs & Controls Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center justify-center bg-black/25 p-3 rounded-lg border border-zinc-800/80">
        {/* TIME */}
        <RotaryKnob
          label="DELAY TIME"
          subLabel="ECHO SPEED"
          value={params.delayTime}
          min={0.03}
          max={1.5}
          step={0.01}
          defaultValue={0.38}
          unit="s"
          displayFormat={(v) => `${Math.round(v * 1000)} ms`}
          onChange={setDelayTime}
          size={56}
          color="green"
        />

        {/* FEEDBACK */}
        <RotaryKnob
          label="FEEDBACK"
          subLabel="REPEATS"
          value={params.delayFeedback}
          min={0}
          max={1.05}
          step={0.01}
          defaultValue={0.62}
          unit=""
          displayFormat={(v) => `${Math.round(v * 100)}%`}
          onChange={setDelayFeedback}
          size={56}
          color={isSelfOscillating ? 'red' : 'green'}
        />

        {/* TAPE TONE */}
        <RotaryKnob
          label="TAPE COLOR"
          subLabel="LPF DAMPING"
          value={params.delayTone}
          min={400}
          max={8000}
          step={50}
          defaultValue={2800}
          unit="Hz"
          displayFormat={(v) => `${(v / 1000).toFixed(1)} kHz`}
          onChange={setDelayTone}
          size={56}
          color="amber"
        />

        {/* DRY/WET MIX */}
        <RotaryKnob
          label="ECHO MIX"
          subLabel="DRY / WET"
          value={params.delayWet}
          min={0}
          max={1.0}
          step={0.02}
          defaultValue={0.5}
          unit=""
          displayFormat={(v) => `${Math.round(v * 100)}%`}
          onChange={setDelayWet}
          size={56}
          color="cyan"
        />

        {/* KILL FEEDBACK SWITCH */}
        <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-2 rounded-lg bg-red-950/20 border border-red-900/60 shadow-inner">
          <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider mb-2 text-center">
            PANIC KILL
          </span>

          <motion.button
            id="btn-kill-feedback"
            onClick={killFeedback}
            whileTap={{ scale: 0.92 }}
            className="w-16 h-16 rounded-full bg-gradient-to-b from-red-600 to-red-950 border-2 border-red-500 text-white font-mono font-bold text-[10px] uppercase shadow-lg shadow-red-900/40 flex flex-col items-center justify-center gap-0.5 hover:from-red-500 hover:to-red-900 active:border-white transition-all"
            title="Coupe instantanément les répétitions de l'écho sans toucher au signal sec"
          >
            <ShieldX className="w-5 h-5 text-red-200" />
            <span>CUT ECHO</span>
          </motion.button>

          <span className="text-[8px] font-mono text-zinc-500 mt-1 uppercase text-center">
            RESET BUFFER
          </span>
        </div>
      </div>

      {/* Footer Routing Info */}
      <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full led-active-green" />
          <span>ROUTING: PLAYER SEND + SIREN SEND → SPACE ECHO → MASTER</span>
        </span>
        <span className="text-zinc-500">
          ANALOG MODEL: <span className="text-emerald-400 font-bold">ROLAND RE-201 TAPE DUB</span>
        </span>
      </div>

      {/* Decorative Screws */}
      <div className="absolute bottom-2 left-2 rack-screw" />
      <div className="absolute bottom-2 right-2 rack-screw" />
    </div>
  );
}
