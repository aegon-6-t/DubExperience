import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, Activity, Cpu, Radio, Shield } from 'lucide-react';
import RotaryKnob from './RotaryKnob';

export default function MasterSection({
  params,
  setMasterVolume,
  getAnalysisData,
  isAudioInitialized,
}) {
  const canvasRef = useRef(null);
  const [vuLevels, setVuLevels] = useState({ left: 0, right: 0, peak: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const prevVolumeRef = useRef(params.masterVolume);

  // Toggle Mute
  const toggleMute = () => {
    if (isMuted) {
      setMasterVolume(prevVolumeRef.current || 0.9);
      setIsMuted(false);
    } else {
      prevVolumeRef.current = params.masterVolume;
      setMasterVolume(0);
      setIsMuted(true);
    }
  };

  // Real-time animation loop for VU meters & Spectrum Visualizer
  useEffect(() => {
    let animId;
    const freqData = new Uint8Array(128);
    const timeData = new Uint8Array(128);

    const updateVisuals = () => {
      const { rms, peak } = getAnalysisData(freqData, timeData);

      // Smooth decay for VU meter
      setVuLevels((prev) => ({
        left: Math.max(rms, prev.left * 0.88),
        right: Math.max(rms * 0.96, prev.right * 0.88),
        peak: Math.max(peak, prev.peak * 0.93),
      }));

      // Draw real-time spectrum canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw dark grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let y = 0; y < height; y += 15) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw Frequency Bars (Sound System Colors: Green -> Amber -> Red)
        const barCount = 48;
        const barWidth = (width / barCount) - 1.5;

        for (let i = 0; i < barCount; i++) {
          const index = Math.floor((i / barCount) * (freqData.length * 0.85));
          const val = freqData[index] || 0;
          const barHeight = (val / 255) * (height - 4);

          // Color gradient depending on frequency band & height
          let fill = '#10b981'; // Green for sub & lows
          if (i > 14 && i < 34) fill = '#f59e0b'; // Amber for mids
          if (i >= 34) fill = '#06b6d4'; // Cyan for highs
          if (barHeight > height * 0.82) fill = '#ef4444'; // Red peak!

          const x = i * (barWidth + 1.5);
          const y = height - barHeight;

          ctx.fillStyle = fill;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Top peak dot
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillRect(x, y - 2, barWidth, 1.5);
        }
      }

      animId = requestAnimationFrame(updateVisuals);
    };

    animId = requestAnimationFrame(updateVisuals);
    return () => cancelAnimationFrame(animId);
  }, [getAnalysisData]);

  // VU meter thresholds (-24 to +3dB)
  const vuSegments = [
    { label: '-24', threshold: 0.08, color: 'green' },
    { label: '-18', threshold: 0.16, color: 'green' },
    { label: '-12', threshold: 0.28, color: 'green' },
    { label: '-6', threshold: 0.45, color: 'green' },
    { label: '-3', threshold: 0.62, color: 'amber' },
    { label: '0dB', threshold: 0.78, color: 'amber' },
    { label: '+3', threshold: 0.92, color: 'red' },
  ];

  return (
    <div className="relative rounded-xl bg-gradient-to-b from-[#181c25] to-[#0f1117] border border-zinc-700/80 p-4 shadow-rack-bevel overflow-hidden flex flex-col justify-between">
      {/* Decorative Screws */}
      <div className="absolute top-2 left-2 rack-screw" />
      <div className="absolute top-2 right-2 rack-screw" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 px-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-200">
            MASTER OUT & SPECTRUM // VU MONITOR
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Audio Engine Status */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isAudioInitialized ? 'led-active-green' : 'led-active-amber animate-pulse'
              }`}
            />
            <span className="text-zinc-300">
              {isAudioInitialized ? 'WEB AUDIO 24-BIT' : 'CLICK TO RUN'}
            </span>
          </div>
          <span className="tape-label tape-label-black text-[10px]">PEAK LIMITER</span>
        </div>
      </div>

      {/* Main Grid: VU Meters + Spectrum Canvas + Master Knob */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Real-time Spectrum Display - 5 cols */}
        <div className="md:col-span-5 flex flex-col p-2.5 rounded-lg bg-black/60 border border-zinc-800/90 shadow-inner">
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mb-1 px-1">
            <span>20Hz SUB</span>
            <span>1kHz MID</span>
            <span>20kHz AIR</span>
          </div>
          <canvas
            ref={canvasRef}
            width={240}
            height={80}
            className="w-full h-20 rounded bg-zinc-950/80 border border-zinc-900"
          />
        </div>

        {/* Dual Channel VU-Meter LED Ladder - 4 cols */}
        <div className="md:col-span-4 flex flex-col justify-center p-2.5 rounded-lg bg-black/60 border border-zinc-800/90 shadow-inner">
          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5 text-center">
            STEREO BUS LEVEL (dB)
          </span>

          {/* Left & Right Channels */}
          <div className="flex flex-col gap-1.5">
            {/* Channel L */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono text-zinc-500 w-3">L</span>
              <div className="flex-1 flex gap-1">
                {vuSegments.map((seg, idx) => {
                  const isActive = vuLevels.left >= seg.threshold;
                  let bg = 'bg-zinc-800';
                  if (isActive) {
                    if (seg.color === 'green') bg = 'led-active-green';
                    if (seg.color === 'amber') bg = 'led-active-amber';
                    if (seg.color === 'red') bg = 'led-active-red';
                  }
                  return (
                    <div
                      key={`l-${idx}`}
                      className={`flex-1 h-3 rounded-xs transition-colors duration-75 ${bg}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Channel R */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono text-zinc-500 w-3">R</span>
              <div className="flex-1 flex gap-1">
                {vuSegments.map((seg, idx) => {
                  const isActive = vuLevels.right >= seg.threshold;
                  let bg = 'bg-zinc-800';
                  if (isActive) {
                    if (seg.color === 'green') bg = 'led-active-green';
                    if (seg.color === 'amber') bg = 'led-active-amber';
                    if (seg.color === 'red') bg = 'led-active-red';
                  }
                  return (
                    <div
                      key={`r-${idx}`}
                      className={`flex-1 h-3 rounded-xs transition-colors duration-75 ${bg}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Decibel markings */}
            <div className="flex justify-between pl-4 pr-0.5 text-[8px] font-mono text-zinc-500">
              {vuSegments.map((seg) => (
                <span key={seg.label}>{seg.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Master Output Knob & Mute - 3 cols */}
        <div className="md:col-span-3 flex flex-col items-center justify-center p-2 bg-black/30 rounded-lg border border-zinc-800/80">
          <RotaryKnob
            label="MASTER GAIN"
            subLabel="MAIN OUT"
            value={params.masterVolume}
            min={0}
            max={1.4}
            step={0.02}
            defaultValue={0.9}
            unit=""
            displayFormat={(v) => `${Math.round(v * 100)}%`}
            onChange={setMasterVolume}
            size={56}
            color={params.masterVolume > 1.0 ? 'red' : 'green'}
          />

          <button
            onClick={toggleMute}
            className={`mt-2 px-3 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 border transition-all ${
              isMuted
                ? 'bg-red-500 text-white border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            <span>{isMuted ? 'UNMUTE' : 'MUTE ALL'}</span>
          </button>
        </div>
      </div>

      {/* Decorative Screws */}
      <div className="absolute bottom-2 left-2 rack-screw" />
      <div className="absolute bottom-2 right-2 rack-screw" />
    </div>
  );
}
