import React, { useState } from 'react';
import { Difficulty, Language, GameStatus } from '../types/game';
import { getT } from '../utils/translations';
import { LEVEL_CONFIGS } from '../game/levels';
import {
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  GitBranch,
  Volume2,
  VolumeX,
  X,
  Trophy,
  Heart,
  AlertTriangle,
  ArrowRight,
  Home,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface MainMenuProps {
  lang: Language;
  difficulty: Difficulty;
  unlockedLevels: number;
  highScore: number;
  isMuted: boolean;
  onPlay: (level?: number) => void;
  onSelectDifficulty: (d: Difficulty) => void;
  onToggleLang: () => void;
  onToggleSound: () => void;
}

export const MainMenuModal: React.FC<MainMenuProps> = ({
  lang,
  difficulty,
  unlockedLevels,
  highScore,
  isMuted,
  onPlay,
  onSelectDifficulty,
  onToggleLang,
  onToggleSound,
}) => {
  const t = getT(lang);
  const [activeTab, setActiveTab] = useState<'menu' | 'levels' | 'guide' | 'deploy'>('menu');
  const [copied, setCopied] = useState(false);

  const gitCommands = `# ১. প্রজেক্টের ফোল্ডারে টার্মিনাল খুলুন
git init
git add .
git commit -m "Initial commit - 3D Rickshaw Rush PWA"

# ২. গিটহাবে একটি নতুন রিপোজিটরি বানিয়ে লিঙ্ক করুন
git remote add origin https://github.com/YOUR_USERNAME/rickshaw-rush-3d.git
git branch -M main
git push -u origin main

# ৩. GitHub Pages এ হোস্ট করার জন্য বিল্ড করুন:
npm run build

# ৪. dist ফোল্ডার gh-pages ব্রাঞ্চে পুশ করুন অথবা 
# GitHub Settings > Pages > Source > 'GitHub Actions' সিলেক্ট করুন!`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top bar with Lang, Sound & PWA Install */}
        <div className="flex items-center justify-between mb-4">
          <PWAInstallButton lang={lang} />
          
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title={isMuted ? t.soundOff : t.soundOn}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>
            <button
              onClick={onToggleLang}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs md:text-sm text-emerald-400 border border-slate-700 transition"
            >
              {lang === 'bn' ? 'English (EN)' : 'বাংলা (BN)'}
            </button>
          </div>
        </div>

        {/* Bespoke Rickshaw Title Lockup */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-800 border-2 border-emerald-400 shadow-xl mb-3 shadow-emerald-950/50">
            <svg viewBox="0 0 100 100" className="w-12 h-12 md:w-16 md:h-16">
              {/* Rickshaw hood stylized SVG */}
              <circle cx="30" cy="70" r="16" fill="none" stroke="#fde047" strokeWidth="4" />
              <circle cx="75" cy="70" r="14" fill="none" stroke="#fde047" strokeWidth="4" />
              <path d="M 20 52 C 20 28, 40 24, 60 28 C 65 30, 70 40, 65 52 Z" fill="#ef4444" stroke="#fde047" strokeWidth="3" />
              <path d="M 30 70 L 55 58 L 70 55 L 75 70" fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
              <circle cx="72" cy="46" r="3" fill="#fde047" />
            </svg>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-amber-300 to-emerald-200 tracking-tight">
            {t.appTitle}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {t.subTitle}
          </p>

          {/* High Score Badge */}
          {highScore > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.highScore}: ৳{highScore}</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs if opened */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            {/* Primary Start CTA */}
            <button
              onClick={() => onPlay()}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-lg md:text-xl shadow-xl shadow-emerald-950/60 active:scale-98 transition flex items-center justify-center gap-3 border border-emerald-400/40"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>{t.play}</span>
            </button>

            {/* Difficulty Selector */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                {t.difficulty}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => onSelectDifficulty(d)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
                      difficulty === d
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>
                      {d === 'easy' ? 'সহজ' : d === 'medium' ? 'মাঝারি' : 'কঠিন'}
                    </span>
                    <span className="text-[10px] opacity-80 font-normal">
                      {d === 'easy' ? '৩ জীবন' : d === 'medium' ? '২ জীবন' : '১ জীবন'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Buttons: Level Select, How to Play, Deploy Guide */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTab('levels')}
                className="py-3 px-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition flex flex-col items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t.selectLevel}</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className="py-3 px-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition flex flex-col items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>{t.howToPlay}</span>
              </button>

              <button
                onClick={() => setActiveTab('deploy')}
                className="py-3 px-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition flex flex-col items-center gap-1.5"
              >
                <GitBranch className="w-4 h-4 text-sky-400" />
                <span>{lang === 'bn' ? 'GitHub গাইড' : 'GitHub Guide'}</span>
              </button>
            </div>

            {/* Flat control hint line */}
            <p className="text-[11px] text-center text-slate-500 pt-1 font-medium">
              কন্ট্রোল: টাচ স্ক্রিন বাটন অথবা WASD / Arrow Keys · Space/Braking · B Bell
            </p>
          </div>
        )}

        {/* Level Select Modal View */}
        {activeTab === 'levels' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{t.selectLevel} (১ - ১০)</span>
              </h3>
              <button
                onClick={() => setActiveTab('menu')}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1">
              {LEVEL_CONFIGS.map((lvl) => {
                const isUnlocked = lvl.level <= unlockedLevels;
                return (
                  <button
                    key={lvl.level}
                    disabled={!isUnlocked}
                    onClick={() => {
                      onPlay(lvl.level);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isUnlocked
                        ? 'bg-slate-800/80 border-emerald-500/40 hover:border-emerald-400 hover:bg-slate-700/80 text-white cursor-pointer'
                        : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-black text-sm md:text-base text-emerald-400">
                        #{lvl.level}
                      </span>
                      {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="mt-2">
                      <p className="text-[10px] md:text-xs font-semibold text-slate-200 line-clamp-1">
                        {lang === 'bn' ? lvl.nameBn : lvl.nameEn}
                      </p>
                      <p className="text-[10px] text-amber-400 font-bold mt-0.5">
                        ৳{lvl.targetMoney}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setActiveTab('menu')}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-sm text-slate-300"
            >
              {lang === 'bn' ? 'ফিরে যান' : 'Back to Menu'}
            </button>
          </div>
        )}

        {/* How to Play Guide View */}
        {activeTab === 'guide' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                <span>{t.guideTitle}</span>
              </h3>
              <button
                onClick={() => setActiveTab('menu')}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm text-slate-300 max-h-[340px] overflow-y-auto pr-1">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <p className="font-medium">{t.guideStep1}</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <p className="font-medium">{t.guideStep2}</p>
              </div>
              <div className="bg-red-950/40 p-3 rounded-xl border border-red-500/40 text-red-200">
                <p className="font-medium">{t.guideStep3}</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <p className="font-medium">{t.guideStep4}</p>
              </div>
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/40 text-amber-200">
                <p className="font-medium">{t.guideStep5}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('menu')}
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-sm text-white"
            >
              {lang === 'bn' ? 'বুঝেছি, খেলা শুরু করি!' : 'Got it, Let’s Play!'}
            </button>
          </div>
        )}

        {/* GitHub Pages Deployment Guide View */}
        {activeTab === 'deploy' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base md:text-lg text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-sky-400" />
                <span>{t.deployTitle}</span>
              </h3>
              <button
                onClick={() => setActiveTab('menu')}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {t.deployDesc}
            </p>

            <div className="relative mb-3">
              <pre className="bg-slate-950 p-3.5 rounded-xl text-[11px] md:text-xs text-emerald-400 font-mono overflow-x-auto max-h-[220px] border border-slate-800">
                {gitCommands}
              </pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 flex items-center gap-1 border border-slate-700"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
              <p>📱 <strong>Android Chrome:</strong> মেন্যু থেকে <em>Add to Home Screen</em> চাপলে সরাসরি অ্যাপ হয়ে যাবে।</p>
              <p>⚡ <strong>Offline Support:</strong> গেমটিতে Service Worker ও Manifest যুক্ত রয়েছে, তাই ইন্টারনেট ছাড়াও চলবে।</p>
            </div>

            <button
              onClick={() => setActiveTab('menu')}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-sm text-slate-300"
            >
              {lang === 'bn' ? 'ফিরে যান' : 'Back'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

interface LevelClearedProps {
  level: number;
  money: number;
  lang: Language;
  onNextLevel: () => void;
  onMainMenu: () => void;
}

export const LevelClearedModal: React.FC<LevelClearedProps> = ({
  level,
  money,
  lang,
  onNextLevel,
  onMainMenu,
}) => {
  const t = getT(lang);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 md:p-8 shadow-2xl text-center text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-3xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-950/50 mb-4">
          <Trophy className="w-10 h-10 text-slate-950" />
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-amber-300">
          {t.levelCleared}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {t.level} {level} সফলভাবে সম্পন্ন হয়েছে!
        </p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 my-4">
          <span className="text-3xl">⭐</span>
          <span className="text-4xl -translate-y-1">⭐</span>
          <span className="text-3xl">⭐</span>
        </div>

        {/* Stats */}
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 mb-6">
          <p className="text-xs text-slate-400 uppercase font-semibold">
            {lang === 'bn' ? 'মোট উপার্জিত টাকা' : 'Total Earnings'}
          </p>
          <p className="text-3xl font-black text-amber-400 mt-1">
            ৳{money}
          </p>
        </div>

        <div className="space-y-2">
          {level < 10 ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base md:text-lg shadow-xl shadow-emerald-950/60 active:scale-98 transition flex items-center justify-center gap-2 border border-emerald-400/40"
            >
              <span>{t.nextLevel}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <p className="text-emerald-400 font-bold text-sm py-2">
              🎉 আপনি সকল লেভেল জয় করেছেন! কিংবদন্তি রিকসাওয়ালা!
            </p>
          )}

          <button
            onClick={onMainMenu}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
          >
            {t.mainMenu}
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverProps {
  reasonBn: string;
  reasonEn: string;
  money: number;
  lang: Language;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverProps> = ({
  reasonBn,
  reasonEn,
  money,
  lang,
  onRestart,
  onMainMenu,
}) => {
  const t = getT(lang);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-red-500/80 rounded-3xl p-6 md:p-8 shadow-2xl text-center text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-3xl bg-red-950 border-2 border-red-500 flex items-center justify-center shadow-lg shadow-red-950/50 mb-4 animate-bounce">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-red-400">
          {lang === 'bn' ? 'গেম ওভার!' : 'Game Over!'}
        </h2>

        {/* Reason display (Angry crowd or Police Bankruptcy) */}
        <div className="my-4 bg-red-950/50 border border-red-500/40 p-4 rounded-2xl">
          <p className="text-sm md:text-base font-bold text-red-200">
            {lang === 'bn' ? reasonBn : reasonEn}
          </p>
          <p className="text-xs text-red-300/80 mt-1">
            {lang === 'bn'
              ? 'রাস্তায় ট্রাফিক ও পুলিশের হাত থেকে সাবধানে চালান।'
              : 'Steer clear of highway police and heavy road traffic.'}
          </p>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          {lang === 'bn' ? 'অর্জিত টাকা' : 'Earnings'}: <span className="font-bold text-amber-400">৳{money}</span>
        </p>

        <div className="space-y-2">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-2xl bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base shadow-xl active:scale-98 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{t.restart}</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
          >
            {t.mainMenu}
          </button>
        </div>
      </div>
    </div>
  );
};

interface PauseProps {
  lang: Language;
  isMuted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseProps> = ({
  lang,
  isMuted,
  onResume,
  onRestart,
  onMainMenu,
  onToggleSound,
}) => {
  const t = getT(lang);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-xl md:text-2xl font-black text-white mb-6">
          {t.paused}
        </h3>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{t.resume}</span>
          </button>

          <button
            onClick={onToggleSound}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2 border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? t.soundOff : t.soundOn}</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>{t.restart}</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <Home className="w-4 h-4" />
            <span>{t.mainMenu}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
