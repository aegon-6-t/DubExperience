import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  Repeat,
  Upload,
  Music,
  Disc3,
  Sliders,
  Volume2,
  FolderOpen,
} from 'lucide-react';
import RotaryKnob from './RotaryKnob';
import { DEFAULT_TRACKS } from '../audio/useDubAudio';

export default function PlayerSection({
  isPlaying,
  currentTime,
  duration,
  isLooping,
  currentTrack,
  customTrackName,
  togglePlay,
  stop,
  seek,
  toggleLoop,
  selectTrack,
  loadUserAudioFile,
  params,
  setTrackVolume,
  setTrackDelaySend,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Format time mm:ss
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav'))) {
      loadUserAudioFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      loadUserAudioFile(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl bg-gradient-to-b from-[#191d27] to-[#111319] border transition-all duration-300 p-4 shadow-rack-bevel overflow-hidden ${
        isDragOver
          ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-400/50'
          : 'border-zinc-700/80'
      }`}
    >
      {/* Decorative Screws */}
      <div className="absolute top-2 left-2 rack-screw" />
      <div className="absolute top-2 right-2 rack-screw" />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/wav,audio/ogg,audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 px-3">
        <div className="flex items-center gap-2">
          <Disc3 className={`w-4 h-4 text-amber-500 ${isPlaying ? 'animate-spin' : ''}`} />
          <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-200">
            DUB AUDIO DECK // TAPE PLAYER
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-import-file"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-[10px] font-mono font-bold text-zinc-300 hover:text-white border border-zinc-700 flex items-center gap-1 transition-all"
            title="Importer un fichier audio local MP3 / WAV"
          >
            <Upload className="w-3 h-3 text-amber-400" />
            IMPORT FILE
          </button>
          <span className="tape-label text-[10px]">DROP WAV/MP3</span>
        </div>
      </div>

      {/* Track Selection & Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3 items-center">
        {/* Track Selector buttons - 8 cols */}
        <div className="md:col-span-8 flex flex-wrap items-center gap-2">
          {DEFAULT_TRACKS.map((t) => (
            <button
              key={t.id}
              id={`btn-select-track-${t.id}`}
              onClick={() => selectTrack(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-2 ${
                currentTrack.id === t.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.name}</span>
            </button>
          ))}

          {customTrackName && (
            <div className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/80 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[150px] truncate">{customTrackName}</span>
            </div>
          )}
        </div>

        {/* Tape Reels Visual Animation - 4 cols */}
        <div className="md:col-span-4 flex items-center justify-end gap-3 px-2 py-1 bg-black/40 rounded-lg border border-zinc-800">
          <div className="flex items-center gap-2">
            {/* Left Reel */}
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
              className="w-7 h-7 rounded-full border-2 border-zinc-600 bg-zinc-900 flex items-center justify-center relative"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
              <div className="absolute w-5 h-[1px] bg-zinc-600" />
              <div className="absolute h-5 w-[1px] bg-zinc-600" />
            </motion.div>

            {/* Tape Path */}
            <div className="w-8 h-[2px] bg-zinc-600/80 relative overflow-hidden">
              {isPlaying && (
                <div className="w-full h-full bg-amber-400/80 animate-pulse" />
              )}
            </div>

            {/* Right Reel */}
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
              className="w-7 h-7 rounded-full border-2 border-zinc-600 bg-zinc-900 flex items-center justify-center relative"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
              <div className="absolute w-5 h-[1px] bg-zinc-600" />
              <div className="absolute h-5 w-[1px] bg-zinc-600" />
            </motion.div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-zinc-500 block leading-tight">STATUS</span>
            <span
              className={`text-[11px] font-mono font-bold leading-tight ${
                isPlaying ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            >
              {isPlaying ? 'PLAYING 🔊' : 'STOPPED'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Seek Bar */}
      <div className="p-3 bg-black/50 rounded-lg border border-zinc-800/90 mb-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1.5 px-0.5">
          <span className="text-amber-400 font-bold">{formatTime(currentTime)}</span>
          <span className="text-zinc-500 uppercase tracking-widest text-[9px]">
            {currentTrack?.name || 'CUSTOM DUB TRACK'}
          </span>
          <span className="text-zinc-400">{formatTime(duration)}</span>
        </div>

        {/* Scrubber slider */}
        <input
          id="slider-track-seek"
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="w-full h-2 cursor-pointer"
        />
      </div>

      {/* Controls Row: Transport buttons + Track Knobs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Transport Buttons - 7 cols */}
        <div className="md:col-span-7 flex flex-wrap items-center gap-2">
          {/* PLAY / PAUSE BUTTON */}
          <motion.button
            id="btn-play-dub"
            whileTap={{ scale: 0.94 }}
            onClick={togglePlay}
            className={`px-5 py-3 rounded-lg font-mono font-bold text-xs flex items-center gap-2 border shadow-lg transition-all ${
              isPlaying
                ? 'bg-gradient-to-b from-amber-500 to-amber-700 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-gradient-to-b from-emerald-600 to-emerald-900 text-white border-emerald-400/80 hover:from-emerald-500 hover:to-emerald-800 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>PLAY DUB</span>
              </>
            )}
          </motion.button>

          {/* STOP BUTTON */}
          <button
            id="btn-stop-dub"
            onClick={stop}
            className="p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 hover:text-white border border-zinc-700 shadow-sm transition-all flex items-center gap-1.5 font-mono text-xs font-bold"
            title="Stop & Rewind"
          >
            <Square className="w-4 h-4 fill-current text-red-400" />
            <span>STOP</span>
          </button>

          {/* LOOP TOGGLE */}
          <button
            id="btn-loop-dub"
            onClick={toggleLoop}
            className={`p-3 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isLooping
                ? 'bg-amber-400/20 text-amber-300 border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300'
            }`}
            title="Boucle infinie"
          >
            <Repeat className="w-4 h-4" />
            <span>{isLooping ? 'LOOP ON' : 'NO LOOP'}</span>
          </button>
        </div>

        {/* Track Level & Send to Delay Knobs - 5 cols */}
        <div className="md:col-span-5 flex items-center justify-around bg-black/30 p-2 rounded-lg border border-zinc-800/80">
          <RotaryKnob
            label="TRACK VOL"
            subLabel="LEVEL"
            value={params.trackVolume}
            min={0}
            max={1.5}
            step={0.02}
            defaultValue={0.85}
            unit=""
            displayFormat={(v) => `${Math.round(v * 100)}%`}
            onChange={setTrackVolume}
            size={48}
            color="green"
          />

          <RotaryKnob
            label="TO DELAY"
            subLabel="DUB SEND"
            value={params.trackDelaySend}
            min={0}
            max={1.0}
            step={0.02}
            defaultValue={0.35}
            unit=""
            displayFormat={(v) => `${Math.round(v * 100)}%`}
            onChange={setTrackDelaySend}
            size={48}
            color="amber"
          />
        </div>
      </div>

      {/* Decorative Screws */}
      <div className="absolute bottom-2 left-2 rack-screw" />
      <div className="absolute bottom-2 right-2 rack-screw" />
    </div>
  );
}
