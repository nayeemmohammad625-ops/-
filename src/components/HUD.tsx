import React from 'react';
import { GameStats, Language } from '../types/game';
import { getT } from '../utils/translations';
import { LEVEL_CONFIGS } from '../game/levels';
import { Volume2, VolumeX, Pause, Heart, ShieldAlert, Navigation, Coins } from 'lucide-react';
import { soundManager } from '../game/audio';

interface Props {
  stats: GameStats;
  lang: Language;
  onPause: () => void;
  onToggleSound: () => void;
  onToggleLang: () => void;
  isMuted: boolean;
}

export const HUD: React.FC<Props> = ({
  stats,
  lang,
  onPause,
  onToggleSound,
  onToggleLang,
  isMuted,
}) => {
  const t = getT(lang);
  const config = LEVEL_CONFIGS.find((l) => l.level === stats.level) || LEVEL_CONFIGS[0];
  const targetProgress = Math.min(100, Math.round((stats.money / config.targetMoney) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-5 select-none z-20">
      {/* Top Header Cluster */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: Level & Money Tracker */}
        <div className="pointer-events-auto flex flex-col gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2.5 md:p-3 shadow-xl backdrop-blur-xs min-w-[150px] md:min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-emerald-400">
              {t.level} {stats.level}
            </span>
            <span className="text-[10px] md:text-xs font-semibold text-slate-400">
              {targetProgress}%
            </span>
          </div>

          {/* Current Money / Target */}
          <div className="flex items-center gap-1.5 text-amber-400">
            <Coins className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-2xl font-black tabular-nums text-white">
                ৳{stats.money}
              </span>
              <span className="text-xs md:text-sm text-slate-400 font-medium">
                / ৳{config.targetMoney}
              </span>
            </div>
          </div>

          {/* Progress Bar towards Target */}
          <div className="w-full h-1.5 md:h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-amber-400 transition-all duration-300"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
        </div>

        {/* Center: Highway Police Warning / Alert Gauge (if on highway or suspicion > 0) */}
        {(stats.isOnHighway || stats.policeSuspicion > 0) && (
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-red-950/90 border border-red-500/80 text-red-200 shadow-2xl animate-bounce">
            <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] md:text-xs font-black uppercase text-red-300 tracking-wide">
                {t.policeAlert}
              </span>
              <div className="w-24 md:w-32 h-2 bg-red-900/60 rounded-full overflow-hidden mt-0.5 border border-red-700/40">
                <div
                  className="h-full bg-linear-to-r from-amber-400 to-red-500 transition-all duration-150"
                  style={{ width: `${stats.policeSuspicion}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Right: Lives, Sound & Pause Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 md:gap-2">
          {/* Lives Indicator */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-2xl shadow-xl">
            {Array.from({ length: stats.maxLives }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${
                  i < stats.lives
                    ? 'text-red-500 fill-red-500 scale-100'
                    : 'text-slate-600 fill-slate-800 scale-90'
                }`}
              />
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition shadow-xl"
            title={isMuted ? t.soundOff : t.soundOn}
          >
            {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-red-400" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="px-2.5 h-9 md:h-10 flex items-center justify-center rounded-2xl bg-slate-900/90 border border-slate-700/80 text-xs md:text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition shadow-xl"
            title="Toggle Language"
          >
            {lang === 'bn' ? 'EN' : 'বাং'}
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition shadow-xl"
            title={t.paused}
          >
            <Pause className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Center-Top: Active Passenger Mission Card (if on board) */}
      {stats.activePassenger ? (
        <div className="pointer-events-auto mx-auto mt-2 max-w-sm w-full bg-slate-900/95 border-2 border-emerald-500/70 rounded-2xl p-2.5 md:p-3 shadow-2xl backdrop-blur-xs flex items-center justify-between gap-3 text-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Navigation className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-medium text-emerald-400 uppercase tracking-wide">
                {t.destination}
              </p>
              <h4 className="font-bold text-xs md:text-sm text-white truncate max-w-[170px] md:max-w-[210px]">
                {lang === 'bn' ? stats.activePassenger.destNameBn : stats.activePassenger.destNameEn}
              </h4>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs md:text-sm font-black text-amber-400">
              ৳{stats.activePassenger.fare}
            </span>
            <div className="text-[10px] text-emerald-300 font-semibold tabular-nums">
              ⏱ {Math.ceil(stats.activePassenger.remainingBonusTime)}s
            </div>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none mx-auto mt-1 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700/50 text-[11px] md:text-xs text-slate-300 font-medium">
          {t.noActivePassenger}
        </div>
      )}

      {/* Spacer to leave 85% playfield unobstructed */}
      <div className="flex-1" />
    </div>
  );
};
