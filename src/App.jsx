import React, { useEffect } from 'react';
import { useDubAudio } from './audio/useDubAudio';
import Header from './components/Header';
import PlayerSection from './components/PlayerSection';
import KillSection from './components/KillSection';
import DubSiren from './components/DubSiren';
import DubDelay from './components/DubDelay';
import MasterSection from './components/MasterSection';

export default function App() {
  const {
    audioRef,
    isAudioInitialized,
    initEngine,

    // Player
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

    // Params
    params,

    // EQ & Kill Switches
    setKillBass,
    setKillMid,
    setKillHigh,
    setLowGain,
    setMidGain,
    setHighGain,

    // Siren
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

    // Delay
    setDelayTime,
    setDelayFeedback,
    setDelayTone,
    setDelayWet,
    killFeedback,

    // Volume & Mix
    setTrackVolume,
    setTrackDelaySend,
    setMasterVolume,

    // Live Analyser
    getAnalysisData,
  } = useDubAudio();

  // Keyboard Shortcuts for live performance
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setKillBass(!params.killBass);
      } else if (e.key === 's' || e.key === 'S') {
        if (!e.repeat) {
          triggerSiren(true);
        }
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        killFeedback();
      }
    };

    const handleKeyUp = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 's' || e.key === 'S') {
        if (!isSirenLatched) {
          triggerSiren(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [togglePlay, params.killBass, setKillBass, triggerSiren, isSirenLatched, killFeedback]);

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 font-body">
      {/* Hidden Audio Element with default track */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        preload="auto"
      />

      {/* Rack Flight Case Enclosure */}
      <div className="w-full max-w-6xl relative rounded-2xl bg-[#0f1219] border-4 border-zinc-800 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_0_2px_rgba(255,255,255,0.05)] p-2 sm:p-4 md:p-5">
        {/* Wooden Side Cheeks (Vintage Sound System Rack Vibe) */}
        <div className="hidden lg:block absolute -left-4 top-0 bottom-0 w-4 bg-wood-cheek rounded-l-md shadow-2xl border-l border-amber-950/40" />
        <div className="hidden lg:block absolute -right-4 top-0 bottom-0 w-4 bg-wood-cheek rounded-r-md shadow-2xl border-r border-amber-950/40" />

        {/* Rackmount Metal Rails */}
        <div className="absolute left-1 top-2 bottom-2 w-1.5 flex flex-col justify-between py-6 pointer-events-none opacity-40">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-inner" />
          ))}
        </div>
        <div className="absolute right-1 top-2 bottom-2 w-1.5 flex flex-col justify-between py-6 pointer-events-none opacity-40">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-inner" />
          ))}
        </div>

        {/* 1. Header Section */}
        <Header
          isAudioInitialized={isAudioInitialized}
          initEngine={initEngine}
        />

        {/* 2. Main Rack Modules Stack */}
        <div className="space-y-4">
          {/* Deck & Player */}
          <PlayerSection
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isLooping={isLooping}
            currentTrack={currentTrack}
            customTrackName={customTrackName}
            togglePlay={togglePlay}
            stop={stop}
            seek={seek}
            toggleLoop={toggleLoop}
            selectTrack={selectTrack}
            loadUserAudioFile={loadUserAudioFile}
            params={params}
            setTrackVolume={setTrackVolume}
            setTrackDelaySend={setTrackDelaySend}
          />

          {/* Grid: Kill Switches & Preamp (Col 1) and Dub Delay (Col 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* EQ / Kill Switches Module */}
            <KillSection
              params={params}
              setKillBass={setKillBass}
              setKillMid={setKillMid}
              setKillHigh={setKillHigh}
              setLowGain={setLowGain}
              setMidGain={setMidGain}
              setHighGain={setHighGain}
            />

            {/* Dub Delay FX Loop */}
            <DubDelay
              params={params}
              setDelayTime={setDelayTime}
              setDelayFeedback={setDelayFeedback}
              setDelayTone={setDelayTone}
              setDelayWet={setDelayWet}
              killFeedback={killFeedback}
            />
          </div>

          {/* Dub Siren Synth Generator (Full Width Rack Unit) */}
          <DubSiren
            params={params}
            triggerSiren={triggerSiren}
            isSirenLatched={isSirenLatched}
            toggleSirenLatch={toggleSirenLatch}
            setSirenPitch={setSirenPitch}
            setSirenLfoRate={setSirenLfoRate}
            setSirenLfoDepth={setSirenLfoDepth}
            setSirenWave={setSirenWave}
            setSirenLfoWave={setSirenLfoWave}
            setSirenVolume={setSirenVolume}
            setSirenDelaySend={setSirenDelaySend}
            applySirenPreset={applySirenPreset}
          />

          {/* Master Out & Real-Time Spectrum Visualizer */}
          <MasterSection
            params={params}
            setMasterVolume={setMasterVolume}
            getAnalysisData={getAnalysisData}
            isAudioInitialized={isAudioInitialized}
          />
        </div>

        {/* Keyboard Shortcuts Footer */}
        <footer className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 px-3 text-[10px] font-mono text-zinc-500">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-zinc-400 font-semibold">RACCOURCIS CLAVIER :</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">ESPACE</kbd> Play/Pause</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">B</kbd> Kill Bass</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">S</kbd> Dub Siren (Maintenir)</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">K</kbd> Cut Echo</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-zinc-400">PURE WEB AUDIO API • ZERO LATENCY</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
