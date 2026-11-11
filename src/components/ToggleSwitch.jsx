import React from 'react';
import { motion } from 'framer-motion';

/**
 * ToggleSwitch
 * Heavy-duty industrial toggle switch with chrome bat lever and glowing indicator LED.
 */
export default function ToggleSwitch({
  id,
  label,
  subLabel,
  checked,
  onChange,
  activeLabel = 'KILL',
  inactiveLabel = 'THRU',
  color = 'red', // 'red' | 'green' | 'amber'
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const handleToggle = () => {
    onChange(!checked);
  };

  const ledStyles = {
    red: checked ? 'led-active-red' : 'led-off',
    green: checked ? 'led-active-green' : 'led-off',
    amber: checked ? 'led-active-amber' : 'led-off',
  };

  return (
    <div className="flex flex-col items-center select-none group">
      {/* Label */}
      <span className="text-[11px] font-mono tracking-wider font-bold text-zinc-300 uppercase mb-1">
        {label}
      </span>

      {/* Switch Faceplate Plate */}
      <div
        id={id}
        onClick={handleToggle}
        className="cursor-pointer relative p-3 rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-700/60 shadow-rack-panel flex flex-col items-center justify-between transition-all hover:border-zinc-500/80 active:scale-95"
        style={{ minWidth: 64, minHeight: 90 }}
      >
        {/* Faceplate top screw and mini LED */}
        <div className="flex items-center justify-between w-full px-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600/40" />
          {/* Status Indicator LED */}
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${ledStyles[color]}`}
          />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600/40" />
        </div>

        {/* Toggle Switch Lever Slot & Bat */}
        <div className="relative my-2 w-7 h-12 bg-black rounded-full border border-zinc-700/80 shadow-inner flex items-center justify-center p-0.5">
          {/* Guide Slot */}
          <div className="w-2 h-9 bg-zinc-900 rounded-full" />

          {/* Chrome Bat Lever */}
          <motion.div
            className="absolute w-5 h-6 rounded-md bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 border border-slate-300/80 shadow-md flex items-center justify-center"
            animate={{
              y: checked ? -10 : 10,
              rotateX: checked ? -20 : 20,
            }}
            transition={{
              type: 'spring',
              stiffness: 700,
              damping: 30,
            }}
          >
            {/* Grip Ribs on Lever Tip */}
            <div className="w-3 h-[2px] bg-slate-500 rounded-full mb-0.5" />
            <div className="w-3 h-[2px] bg-slate-500 rounded-full" />
          </motion.div>
        </div>

        {/* Status text badge */}
        <div
          className={`text-[9px] font-mono font-bold tracking-tight px-1.5 py-0.5 rounded transition-all ${
            checked
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          }`}
        >
          {checked ? activeLabel : inactiveLabel}
        </div>
      </div>

      {subLabel && (
        <span className="text-[9px] font-mono text-zinc-500 mt-1 font-semibold">
          {subLabel}
        </span>
      )}
    </div>
  );
}
