import React, { useState } from 'react';
import { Radio, Power, Info, HelpCircle, X, Sparkles, Volume2 } from 'lucide-react';

export default function Header({ isAudioInitialized, initEngine }) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <header className="relative mb-5 rounded-xl bg-gradient-to-r from-[#141822] via-[#1a1f2c] to-[#141822] border border-zinc-700/80 p-4 shadow-rack-bevel overflow-hidden">
        {/* Rack Ears & Screws */}
        <div className="absolute top-3 left-3 rack-screw" />
        <div className="absolute top-3 right-3 rack-screw" />
        <div className="absolute bottom-3 left-3 rack-screw" />
        <div className="absolute bottom-3 right-3 rack-screw" />

        {/* Top Jamaican Sound System Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 dub-flag-stripe" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-1">
          {/* Brand & Preamp Model */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black border border-amber-500/60 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <span className="text-xl">🔊</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-mono font-bold tracking-wider text-white uppercase flex items-center gap-2">
                  DUB STATION <span className="text-amber-400 font-extrabold text-sm md:text-base">// PREAMP DS-4000</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-bold">
                  SOUND SYSTEM PRO
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 tracking-wide mt-0.5">
                DISCOTHEQUE HIGH-POWER AUDIO UNIT • 3-BAND KILL MATRIX • DUB SIREN • SPACE ECHO
              </p>
            </div>
          </div>

          {/* Right Controls: Guide Button & Audio Engine Power */}
          <div className="flex items-center gap-3">
            {/* Guide Button */}
            <button
              id="btn-guide-modal"
              onClick={() => setShowGuide(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Guide d'utilisation Sound System"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>GUIDE OPERATEUR</span>
            </button>

            {/* Power Status Pilot Lamp */}
            <button
              id="btn-init-audio"
              onClick={initEngine}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-mono font-bold transition-all shadow-inner ${
                isAudioInitialized
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                  : 'bg-amber-950/40 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse'
              }`}
              title="Statut AudioContext Web Audio API"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isAudioInitialized ? 'led-active-green' : 'led-active-amber'
                }`}
              />
              <span>{isAudioInitialized ? 'AUDIO ACTIVE' : 'INITIALIZE AUDIO'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Hazard Warning Ribbon */}
        <div className="absolute bottom-0 left-0 right-0 h-1 hazard-stripe opacity-40" />
      </header>

      {/* Operator Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-lg w-full rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-700 p-6 shadow-2xl text-zinc-200 font-mono">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-800">
              <span className="text-2xl">🇯🇲</span>
              <h3 className="text-base font-bold text-amber-400 tracking-wider">
                GUIDE DE L'OPÉRATEUR SOUND SYSTEM
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-zinc-300 leading-relaxed">
              <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800">
                <span className="text-amber-400 font-bold block mb-1">
                  1. Audio Player & Drag & Drop :
                </span>
                <p>
                  Cliquez sur <strong>PLAY DUB</strong> pour lancer la session Roots Dub intégrée (76 BPM ou Steppers 125 BPM). Vous pouvez également glisser-déposer n'importe quel fichier <strong>MP3 ou WAV</strong> de votre ordinateur !
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800">
                <span className="text-red-400 font-bold block mb-1">
                  2. Section Kill Bass & Isolateur :
                </span>
                <p>
                  Basculez le switch <strong>KILL BASS</strong> pour activer le filtre passe-haut à <strong>250 Hz</strong> et couper instantanément le sub. Utilisez le bouton <strong>HOLD TO KILL</strong> pour retenir la basse avant d'envoyer le drop !
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800">
                <span className="text-amber-400 font-bold block mb-1">
                  3. Dub Siren Synthétisée :
                </span>
                <p>
                  Maintenez le bouton <strong>HOLD TO PLAY</strong> pour déclencher la sirène analogique. Ajustez le <strong>Pitch</strong> et la vitesse <strong>LFO Speed</strong> pour faire rugir la sirène façon Jah Shaka ou King Jammy !
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800">
                <span className="text-emerald-400 font-bold block mb-1">
                  4. Dub Delay (FX Loop) :
                </span>
                <p>
                  Réglez le <strong>Delay Time</strong> et poussez le <strong>Feedback</strong> vers 70-90% pour des échos infinis. Si le délai part en auto-oscillation incontrôlée, frappez le bouton rouge <strong>CUT ECHO</strong> !
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-xs shadow-md transition-all"
            >
              C'EST PARTI // JAH GUIDE! 🔊
            </button>
          </div>
        </div>
      )}
    </>
  );
}
