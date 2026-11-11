import { useState, useEffect, useRef, useCallback } from 'react';
import { dubAudioEngine } from './DubAudioEngine';

export const DEFAULT_TRACKS = [
  {
    id: 'roots-session',
    name: 'Roots Dub Session (76 BPM)',
    artist: 'Dub Station Studio',
    bpm: 76,
    url: '/dub-roots-session.wav',
    type: 'roots',
  },
  {
    id: 'stepper-session',
    name: 'Heavy Steppers Dub (125 BPM)',
    artist: 'Sound System Crew',
    bpm: 125,
    url: '/dub-stepper-session.wav',
    type: 'stepper',
  },
];

export const SIREN_PRESETS = {
  roots: {
    name: 'Roots 2-Tone',
    pitch: 520,
    lfoRate: 4.8,
    lfoDepth: 350,
    wave: 'square',
    lfoWave: 'square',
  },
  laser: {
    name: 'Laser Sweeper',
    pitch: 980,
    lfoRate: 14.5,
    lfoDepth: 750,
    wave: 'sawtooth',
    lfoWave: 'sawtooth',
  },
  wobble: {
    name: 'UFO Sub Wobble',
    pitch: 280,
    lfoRate: 3.2,
    lfoDepth: 220,
    wave: 'sine',
    lfoWave: 'sine',
  },
  patrol: {
    name: 'Dub Patrol',
    pitch: 740,
    lfoRate: 8.0,
    lfoDepth: 480,
    wave: 'triangle',
    lfoWave: 'triangle',
  },
};

export function useDubAudio() {
  const audioRef = useRef(null);
  const [params, setParams] = useState(() => dubAudioEngine.getParams());
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(DEFAULT_TRACKS[0]);
  const [customTrackName, setCustomTrackName] = useState(null);

  // Siren latch mode (continuous play)
  const [isSirenLatched, setIsSirenLatched] = useState(false);

  // Sync engine params
  useEffect(() => {
    const unsubscribe = dubAudioEngine.subscribe((newParams) => {
      setParams({ ...newParams });
    });
    return unsubscribe;
  }, []);

  // Initialize engine on first interaction
  const initEngine = useCallback(async () => {
    if (!audioRef.current) return;
    dubAudioEngine.init(audioRef.current);
    await dubAudioEngine.ensureContext();
    setIsAudioInitialized(true);
  }, []);

  // Setup audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = isLooping;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      if (!audio.loop) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isLooping]);

  // Audio Playback Controls
  const play = useCallback(async () => {
    await initEngine();
    if (audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (err) {
        console.warn('Playback error:', err);
      }
    }
  }, [initEngine]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.loop = next;
      }
      return next;
    });
  }, []);

  // Track selection
  const selectTrack = useCallback(
    async (track) => {
      const wasPlaying = isPlaying;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = track.url;
        audioRef.current.load();
        setCurrentTrack(track);
        setCustomTrackName(null);
        setCurrentTime(0);
        if (wasPlaying) {
          await initEngine();
          try {
            await audioRef.current.play();
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
    [isPlaying, initEngine]
  );

  // User file drop / upload
  const loadUserAudioFile = useCallback(
    async (file) => {
      if (!file || !audioRef.current) return;
      const fileUrl = URL.createObjectURL(file);
      const wasPlaying = isPlaying;

      audioRef.current.pause();
      audioRef.current.src = fileUrl;
      audioRef.current.load();

      const userTrack = {
        id: 'user-track-' + Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Custom Dub Import',
        bpm: 'Custom',
        url: fileUrl,
        type: 'user',
      };

      setCurrentTrack(userTrack);
      setCustomTrackName(file.name);
      setCurrentTime(0);

      await initEngine();
      if (wasPlaying) {
        try {
          await audioRef.current.play();
        } catch (e) {
          console.error(e);
        }
      }
    },
    [isPlaying, initEngine]
  );

  // Siren Trigger
  const triggerSiren = useCallback(
    async (down) => {
      await initEngine();
      if (isSirenLatched && down) {
        // Toggle latch
        const newState = !params.sirenTriggered;
        dubAudioEngine.triggerSiren(newState);
      } else if (!isSirenLatched) {
        dubAudioEngine.triggerSiren(down);
      }
    },
    [initEngine, isSirenLatched, params.sirenTriggered]
  );

  const toggleSirenLatch = useCallback(() => {
    setIsSirenLatched((prev) => {
      const next = !prev;
      if (!next && params.sirenTriggered) {
        dubAudioEngine.triggerSiren(false);
      }
      return next;
    });
  }, [params.sirenTriggered]);

  const applySirenPreset = useCallback(
    (presetKey) => {
      const preset = SIREN_PRESETS[presetKey];
      if (!preset) return;
      dubAudioEngine.setSirenPitch(preset.pitch);
      dubAudioEngine.setSirenLfoRate(preset.lfoRate);
      dubAudioEngine.setSirenLfoDepth(preset.lfoDepth);
      dubAudioEngine.setSirenWave(preset.wave);
      dubAudioEngine.setSirenLfoWave(preset.lfoWave);
    },
    []
  );

  return {
    audioRef,
    isAudioInitialized,
    initEngine,

    // Audio Playback State & Controls
    isPlaying,
    currentTime,
    duration,
    isLooping,
    currentTrack,
    customTrackName,
    play,
    pause,
    stop,
    togglePlay,
    seek,
    toggleLoop,
    selectTrack,
    loadUserAudioFile,

    // Parameters from Engine
    params,

    // Kill Switches & Preamp EQ
    setKillBass: (active) => dubAudioEngine.setKillBass(active),
    setKillMid: (active) => dubAudioEngine.setKillMid(active),
    setKillHigh: (active) => dubAudioEngine.setKillHigh(active),
    setLowGain: (dB) => dubAudioEngine.setLowGain(dB),
    setMidGain: (dB) => dubAudioEngine.setMidGain(dB),
    setHighGain: (dB) => dubAudioEngine.setHighGain(dB),

    // Dub Siren Controls
    triggerSiren,
    isSirenLatched,
    toggleSirenLatch,
    setSirenPitch: (freq) => dubAudioEngine.setSirenPitch(freq),
    setSirenLfoRate: (rate) => dubAudioEngine.setSirenLfoRate(rate),
    setSirenLfoDepth: (depth) => dubAudioEngine.setSirenLfoDepth(depth),
    setSirenWave: (wave) => dubAudioEngine.setSirenWave(wave),
    setSirenLfoWave: (wave) => dubAudioEngine.setSirenLfoWave(wave),
    setSirenVolume: (vol) => dubAudioEngine.setSirenVolume(vol),
    setSirenDelaySend: (send) => dubAudioEngine.setSirenDelaySend(send),
    applySirenPreset,

    // Dub Delay Controls
    setDelayTime: (sec) => dubAudioEngine.setDelayTime(sec),
    setDelayFeedback: (fb) => dubAudioEngine.setDelayFeedback(fb),
    setDelayTone: (tone) => dubAudioEngine.setDelayTone(tone),
    setDelayWet: (wet) => dubAudioEngine.setDelayWet(wet),
    killFeedback: () => dubAudioEngine.killFeedback(),

    // Player Track & Master Volumes
    setTrackVolume: (vol) => dubAudioEngine.setTrackVolume(vol),
    setTrackDelaySend: (send) => dubAudioEngine.setTrackDelaySend(send),
    setMasterVolume: (vol) => dubAudioEngine.setMasterVolume(vol),

    // Live Analyser Data
    getAnalysisData: (freqArr, timeArr) => dubAudioEngine.getAnalysisData(freqArr, timeArr),
  };
}
