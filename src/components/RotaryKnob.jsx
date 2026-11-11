import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * RotaryKnob
 * Realistic hardware rotary potentiometer.
 * Supports vertical dragging, mouse wheel, double-click to reset, and keyboard fine-tuning.
 */
export default function RotaryKnob({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  defaultValue = min,
  unit = '',
  onChange,
  size = 64,
  color = 'amber', // 'amber' | 'green' | 'red' | 'cyan'
  displayFormat = null,
  subLabel = null,
}) {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartValue = useRef(value);

  // Knob rotation angle: -135deg (min) to +135deg (max) => 270 deg total range
  const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = -135 + normalizedValue * 270;

  // Handle Dragging
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartValue.current = value;

    const handlePointerMove = (moveEvent) => {
      moveEvent.preventDefault();
      // Sensitivity: 200px drag = full range (shift key for fine tuning)
      const range = max - min;
      const sensitivity = moveEvent.shiftKey ? 600 : 180;
      const deltaY = dragStartY.current - moveEvent.clientY;
      const deltaValue = (deltaY / sensitivity) * range;

      let newValue = dragStartValue.current + deltaValue;
      newValue = Math.max(min, Math.min(max, newValue));

      if (step > 0) {
        newValue = Math.round(newValue / step) * step;
      }

      onChange?.(Number(newValue.toFixed(3)));
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [value, min, max, step, onChange]);

  // Handle Double Click to reset
  const handleDoubleClick = useCallback(() => {
    onChange?.(defaultValue);
  }, [defaultValue, onChange]);

  // Handle Wheel scroll
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const range = max - min;
    const stepSize = step > 0 ? step : range / 100;
    const direction = e.deltaY < 0 ? 1 : -1;
    const delta = (e.shiftKey ? stepSize : stepSize * 2) * direction;

    let newValue = Math.max(min, Math.min(max, value + delta));
    if (step > 0) {
      newValue = Math.round(newValue / step) * step;
    }
    onChange?.(Number(newValue.toFixed(3)));
  }, [value, min, max, step, onChange]);

  // Color mappings
  const colorGlows = {
    amber: 'rgba(245, 158, 11, 0.7)',
    green: 'rgba(34, 197, 94, 0.7)',
    red: 'rgba(239, 68, 68, 0.8)',
    cyan: 'rgba(6, 182, 212, 0.7)',
  };

  const indicatorColors = {
    amber: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
    green: 'bg-emerald-400 shadow-[0_0_8px_#22c55e]',
    red: 'bg-red-400 shadow-[0_0_8px_#ef4444]',
    cyan: 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]',
  };

  // Display text
  const displayText = displayFormat
    ? displayFormat(value)
    : `${Number(value).toFixed(step >= 1 ? 0 : 2)}${unit}`;

  return (
    <div className="flex flex-col items-center select-none group touch-none">
      {/* Knob Header Label */}
      <span className="text-[10px] font-mono tracking-wider font-semibold text-zinc-400 uppercase mb-1.5 transition-colors group-hover:text-zinc-200">
        {label}
      </span>

      {/* Knob Container & Tick Ring */}
      <div
        className="relative flex items-center justify-center cursor-ns-resize"
        style={{ width: size + 20, height: size + 20 }}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      >
        {/* Tick Mark Arc */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
        >
          {Array.from({ length: 11 }).map((_, i) => {
            const tickAngle = -135 + (i / 10) * 270;
            const rad = (tickAngle - 90) * (Math.PI / 180);
            const r1 = 44;
            const r2 = i === 0 || i === 5 || i === 10 ? 49 : 47;
            const x1 = 50 + r1 * Math.cos(rad);
            const y1 = 50 + r1 * Math.sin(rad);
            const x2 = 50 + r2 * Math.cos(rad);
            const y2 = 50 + r2 * Math.sin(rad);
            const isActive = tickAngle <= angle;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isActive ? colorGlows[color] : '#334155'}
                strokeWidth={i === 0 || i === 5 || i === 10 ? 2 : 1.2}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* 3D Hardware Bevel Outer Ring */}
        <div
          className="relative rounded-full p-[2px] transition-transform"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, #475569 0%, #0f172a 100%)',
            boxShadow: isDragging
              ? `0 0 16px ${colorGlows[color]}, 0 8px 16px rgba(0,0,0,0.8)`
              : '0 6px 14px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.2)',
          }}
        >
          {/* Rotating Knob Cap */}
          <motion.div
            ref={knobRef}
            className="w-full h-full rounded-full relative flex items-center justify-center bg-knob-metal overflow-hidden"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: isDragging ? 'none' : 'transform 0.08s ease-out',
            }}
          >
            {/* Fine Radial Serrations / Knurling Pattern */}
            <div className="absolute inset-1 rounded-full border border-zinc-700/40 bg-gradient-to-b from-zinc-700/20 to-zinc-900/60" />

            {/* Center Cap with subtle brushed ring */}
            <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-700 border border-zinc-600/50 shadow-inner flex items-center justify-center" />

            {/* Glowing Notch / Indicator Line */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[3px] h-[34%] rounded-full overflow-hidden">
              <div className={`w-full h-full ${indicatorColors[color]}`} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Numerical Readout */}
      <div className="mt-1 px-1.5 py-0.5 rounded bg-black/60 border border-zinc-800 text-[11px] font-mono text-zinc-300 min-w-[50px] text-center tracking-tight shadow-inner">
        {displayText}
      </div>

      {subLabel && (
        <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
          {subLabel}
        </span>
      )}
    </div>
  );
}
