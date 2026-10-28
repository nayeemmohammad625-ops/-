import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Bell } from 'lucide-react';
import { Language } from '../types/game';
import { getT } from '../utils/translations';

interface Props {
  lang: Language;
  onPedalStart: () => void;
  onPedalEnd: () => void;
  onBrakeStart: () => void;
  onBrakeEnd: () => void;
  onLeftStart: () => void;
  onLeftEnd: () => void;
  onRightStart: () => void;
  onRightEnd: () => void;
  onBell: () => void;
}

export const TouchControls: React.FC<Props> = ({
  lang,
  onPedalStart,
  onPedalEnd,
  onBrakeStart,
  onBrakeEnd,
  onLeftStart,
  onLeftEnd,
  onRightStart,
  onRightEnd,
  onBell,
}) => {
  const t = getT(lang);

  return (
    <div className="absolute bottom-2 md:bottom-5 inset-x-0 pointer-events-none flex justify-between items-end px-3 md:px-8 z-30 select-none pb-1">
      {/* Left Thumb Cluster: Steering Buttons (Left / Right) */}
      <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onLeftStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onLeftEnd();
          }}
          onMouseDown={onLeftStart}
          onMouseUp={onLeftEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 active:bg-emerald-600/90 active:scale-90 border-2 border-slate-600/70 active:border-emerald-400 text-white flex flex-col items-center justify-center shadow-2xl transition-transform touch-none"
          title={t.leftBtn}
        >
          <ArrowLeft className="w-6 h-6 md:w-7 md:h-7" />
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {t.leftBtn}
          </span>
        </button>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onRightStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onRightEnd();
          }}
          onMouseDown={onRightStart}
          onMouseUp={onRightEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 active:bg-emerald-600/90 active:scale-90 border-2 border-slate-600/70 active:border-emerald-400 text-white flex flex-col items-center justify-center shadow-2xl transition-transform touch-none"
          title={t.rightBtn}
        >
          <ArrowRight className="w-6 h-6 md:w-7 md:h-7" />
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {t.rightBtn}
          </span>
        </button>
      </div>

      {/* Center: Quick Bell Button (Big Brass Bell) */}
      <div className="pointer-events-auto flex items-center justify-center">
        <button
          onClick={(e) => {
            e.preventDefault();
            onBell();
          }}
          onContextMenu={(e) => e.preventDefault()}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-linear-to-b from-amber-400 to-amber-600 active:from-amber-500 active:to-amber-700 active:scale-90 border-2 border-amber-200 text-slate-950 flex flex-col items-center justify-center shadow-xl transition-transform touch-none"
          title={t.bellBtn}
        >
          <Bell className="w-5 h-5 md:w-6 md:h-6 fill-slate-950" />
          <span className="text-[8px] font-black uppercase tracking-tight">
            {lang === 'bn' ? 'ঘণ্টা' : 'BELL'}
          </span>
        </button>
      </div>

      {/* Right Thumb Cluster: Pedal (Accelerate) & Brake / Reverse */}
      <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
        {/* Brake */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onBrakeStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onBrakeEnd();
          }}
          onMouseDown={onBrakeStart}
          onMouseUp={onBrakeEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="w-13 h-13 md:w-15 md:h-15 rounded-2xl bg-red-950/80 hover:bg-red-900/90 active:bg-red-600 active:scale-90 border-2 border-red-500/70 text-red-200 active:text-white flex flex-col items-center justify-center shadow-2xl transition-transform touch-none"
          title={t.brakeBtn}
        >
          <ArrowDown className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-[9px] font-black uppercase tracking-wider">
            {t.brakeBtn.split('/')[0]}
          </span>
        </button>

        {/* Accelerate / Pedal */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onPedalStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onPedalEnd();
          }}
          onMouseDown={onPedalStart}
          onMouseUp={onPedalEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="w-16 h-16 md:w-18 md:h-18 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 active:bg-emerald-400 active:scale-90 border-2 border-emerald-300 text-white flex flex-col items-center justify-center shadow-2xl transition-transform touch-none"
          title={t.pedalBtn}
        >
          <ArrowUp className="w-7 h-7 md:w-8 md:h-8" />
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider">
            {lang === 'bn' ? 'প্যাডেল' : 'PEDAL'}
          </span>
        </button>
      </div>
    </div>
  );
};
