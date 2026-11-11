import React from 'react';
import { Volume2, VolumeX, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import RotaryKnob from './RotaryKnob';
import ToggleSwitch from './ToggleSwitch';

export default function KillSection({
  params,
  setKillBass,
  setKillMid,
  setKillHigh,
  setLowGain,
  setMidGain,
  setHighGain,
}) {
  return (
    <div className="relative rounded-xl bg-gradient-to-b from-[#181c25] to-[#101319] border border-zinc-700/80 p-4 shadow-rack-bevel overflow-hidden flex flex-col justify-between">
      {/* Decorative Top Screws */}
      <div className="absolute top-2 left-2 rack-screw" />
      <div className="absolute top-2 right-2 rack-screw" />

      {/* Module Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 px-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
          <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-200">
            PREAMP ISOLATOR // KILL SWITCHES
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="tape-label tape-label-black text-[10px]">3-BAND MATRIX</span>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 my-auto">
        {/* ================= BASS BAND ================= */}
        <div
          className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${
            params.killBass
              ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              : 'bg-zinc-900/60 border-zinc-800 shadow-inner'
          }`}
        >
          {/* Band Header */}
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className={`w-2 h-2 rounded-full ${
                params.killBass ? 'led-active-red' : 'led-active-green'
              }`}
            />
            <span className="text-xs font-mono font-bold text-zinc-100">SUB BASS</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 mb-2">HPF 250Hz</span>

          {/* Kill Bass Toggle Switch */}
          <ToggleSwitch
            id="switch-kill-bass"
            label="KILL BASS"
            subLabel="HIGHPASS"
            checked={params.killBass}
            onChange={setKillBass}
            activeLabel="CUT 250Hz"
            inactiveLabel="SUB ON"
            color="red"
          />

          {/* Bass Level Knob */}
          <div className="mt-3">
            <RotaryKnob
              label="BASS GAIN"
              value={params.lowGain}
              min={-15}
              max={15}
              step={0.5}
              defaultValue={0}
              unit="dB"
              onChange={setLowGain}
              size={54}
              color={params.killBass ? 'red' : 'green'}
              displayFormat={(v) => `${v > 0 ? '+' : ''}${v} dB`}
            />
          </div>

          {/* Momentary Punch Kill Button (Selector Favorite!) */}
          <button
            id="btn-punch-kill-bass"
            onPointerDown={() => setKillBass(true)}
            onPointerUp={() => setKillBass(false)}
            onPointerLeave={() => {
              if (params.killBass) setKillBass(false);
            }}
            className="mt-3 w-full py-1.5 px-2 rounded bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 active:scale-95 text-white font-mono text-[10px] font-bold tracking-wider uppercase border border-red-400/40 shadow-sm flex items-center justify-center gap-1 transition-all"
            title="Maintenir pour couper la basse, relâcher pour faire claquer le DROP!"
          >
            <ShieldAlert className="w-3 h-3" />
            HOLD TO KILL
          </button>
        </div>

        {/* ================= MID BAND ================= */}
        <div
          className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${
            params.killMid
              ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-zinc-900/60 border-zinc-800 shadow-inner'
          }`}
        >
          {/* Band Header */}
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className={`w-2 h-2 rounded-full ${
                params.killMid ? 'led-active-red' : 'led-active-green'
              }`}
            />
            <span className="text-xs font-mono font-bold text-zinc-100">MIDRANGE</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 mb-2">1000Hz NOTCH</span>

          {/* Kill Mid Toggle Switch */}
          <ToggleSwitch
            id="switch-kill-mid"
            label="KILL MID"
            subLabel="VOX/SKANK"
            checked={params.killMid}
            onChange={setKillMid}
            activeLabel="CUT 1kHz"
            inactiveLabel="MID ON"
            color="amber"
          />

          {/* Mid Level Knob */}
          <div className="mt-3">
            <RotaryKnob
              label="MID GAIN"
              value={params.midGain}
              min={-15}
              max={15}
              step={0.5}
              defaultValue={0}
              unit="dB"
              onChange={setMidGain}
              size={54}
              color="amber"
              displayFormat={(v) => `${v > 0 ? '+' : ''}${v} dB`}
            />
          </div>

          {/* Quick Mute Mid button */}
          <button
            id="btn-punch-kill-mid"
            onPointerDown={() => setKillMid(true)}
            onPointerUp={() => setKillMid(false)}
            onPointerLeave={() => {
              if (params.killMid) setKillMid(false);
            }}
            className="mt-3 w-full py-1.5 px-2 rounded bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 active:scale-95 text-white font-mono text-[10px] font-bold tracking-wider uppercase border border-amber-400/40 shadow-sm flex items-center justify-center gap-1 transition-all"
            title="Maintenir pour couper les voix et accords de skank"
          >
            <ShieldAlert className="w-3 h-3" />
            HOLD TO KILL
          </button>
        </div>

        {/* ================= HIGH BAND ================= */}
        <div
          className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${
            params.killHigh
              ? 'bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'bg-zinc-900/60 border-zinc-800 shadow-inner'
          }`}
        >
          {/* Band Header */}
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className={`w-2 h-2 rounded-full ${
                params.killHigh ? 'led-active-red' : 'led-active-green'
              }`}
            />
            <span className="text-xs font-mono font-bold text-zinc-100">TREBLE</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 mb-2">LPF 1.2kHz</span>

          {/* Kill High Toggle Switch */}
          <ToggleSwitch
            id="switch-kill-high"
            label="KILL HIGH"
            subLabel="HATS/AIR"
            checked={params.killHigh}
            onChange={setKillHigh}
            activeLabel="CUT HATS"
            inactiveLabel="HIGH ON"
            color="red"
          />

          {/* High Level Knob */}
          <div className="mt-3">
            <RotaryKnob
              label="HIGH GAIN"
              value={params.highGain}
              min={-15}
              max={15}
              step={0.5}
              defaultValue={0}
              unit="dB"
              onChange={setHighGain}
              size={54}
              color="cyan"
              displayFormat={(v) => `${v > 0 ? '+' : ''}${v} dB`}
            />
          </div>

          {/* Quick Mute High button */}
          <button
            onPointerDown={() => setKillHigh(true)}
            onPointerUp={() => setKillHigh(false)}
            onPointerLeave={() => {
              if (params.killHigh) setKillHigh(false);
            }}
            className="mt-3 w-full py-1.5 px-2 rounded bg-gradient-to-b from-sky-600 to-sky-800 hover:from-sky-500 hover:to-sky-700 active:scale-95 text-white font-mono text-[10px] font-bold tracking-wider uppercase border border-sky-400/40 shadow-sm flex items-center justify-center gap-1 transition-all"
            title="Maintenir pour couper les cymbales et shakers"
          >
            <ShieldAlert className="w-3 h-3" />
            HOLD TO KILL
          </button>
        </div>
      </div>

      {/* Footer Info / Dub Preamp Advice */}
      <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>ISOLATOR RESPONSE: 12dB/OCT HIGH-Q</span>
        </span>
        <span className="text-amber-400 font-bold tracking-wider">
          {params.killBass ? '⚠️ BASS DROPPED' : 'BASS THUMPING'}
        </span>
      </div>

      {/* Decorative Bottom Screws */}
      <div className="absolute bottom-2 left-2 rack-screw" />
      <div className="absolute bottom-2 right-2 rack-screw" />
    </div>
  );
}
