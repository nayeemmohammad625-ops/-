import React, { useEffect, useRef, useState } from 'react';
import { RickshawGameEngine } from './game/engine';
import { GameStats, Difficulty, Language, GameStatus } from './types/game';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import {
  MainMenuModal,
  LevelClearedModal,
  GameOverModal,
  PauseModal,
} from './components/Modals';
import { soundManager } from './game/audio';
import { getMaxLivesForDifficulty } from './game/levels';

export default function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<RickshawGameEngine | null>(null);

  // States
  const [lang, setLang] = useState<Language>('bn');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameStatus, setGameStatus] = useState<GameStatus>('menu');
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [gameOverReason, setGameOverReason] = useState<{ bn: string; en: string }>({
    bn: '',
    en: '',
  });

  const [notification, setNotification] = useState<{
    msgBn: string;
    msgEn: string;
    type: 'info' | 'warn' | 'success';
  } | null>(null);

  const [stats, setStats] = useState<GameStats>(() => {
    const maxLives = getMaxLivesForDifficulty('easy');
    let highScore = 0;
    let unlocked = 1;
    try {
      highScore = parseInt(localStorage.getItem('rickshaw_high_score') || '0', 10) || 0;
      unlocked = parseInt(localStorage.getItem('rickshaw_unlocked_level') || '1', 10) || 1;
    } catch {}

    return {
      money: 0,
      level: 1,
      lives: maxLives,
      maxLives,
      passengersServed: 0,
      finesPaid: 0,
      policeSuspicion: 0,
      isOnHighway: false,
      activePassenger: null,
      highScore,
      unlockedLevels: unlocked,
    };
  });

  // Initialize Three.js Game Engine once on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new RickshawGameEngine(canvasRef.current, difficulty, currentLevel);
    engineRef.current = engine;

    engine.onStatsUpdate = (newStats) => {
      setStats(newStats);
    };

    engine.onNotification = (msgBn, msgEn, type = 'info') => {
      setNotification({ msgBn, msgEn, type });
      setTimeout(() => {
        setNotification(null);
      }, 2800);
    };

    engine.onGameOver = (reasonBn, reasonEn) => {
      setGameOverReason({ bn: reasonBn, en: reasonEn });
      setGameStatus('game_over');
    };

    engine.onLevelCleared = (clearedLevel) => {
      setCurrentLevel(clearedLevel);
      setGameStatus('level_cleared');
    };

    // Start engine in background for title screen cinematic world live view
    engine.start();

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Sync difficulty when changed
  const handleSelectDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    if (engineRef.current) {
      engineRef.current.difficulty = d;
      const maxLives = getMaxLivesForDifficulty(d);
      engineRef.current.stats.maxLives = maxLives;
      engineRef.current.stats.lives = maxLives;
      setStats({ ...engineRef.current.stats });
    }
  };

  // Sound toggle
  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
  };

  // Language toggle
  const handleToggleLang = () => {
    setLang((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  // Game start / level select
  const handleStartGame = (level?: number) => {
    const targetLevel = level || currentLevel;
    setCurrentLevel(targetLevel);
    if (engineRef.current) {
      engineRef.current.difficulty = difficulty;
      const maxLives = getMaxLivesForDifficulty(difficulty);
      engineRef.current.stats.lives = maxLives;
      engineRef.current.stats.maxLives = maxLives;
      engineRef.current.stats.money = 0;
      engineRef.current.setupLevel(targetLevel);
      engineRef.current.resume();
    }
    setGameStatus('playing');
  };

  // Next level
  const handleNextLevel = () => {
    const nextLevel = Math.min(10, currentLevel + 1);
    setCurrentLevel(nextLevel);
    if (engineRef.current) {
      engineRef.current.setupLevel(nextLevel);
      engineRef.current.resume();
    }
    setGameStatus('playing');
  };

  // Restart
  const handleRestart = () => {
    if (engineRef.current) {
      const maxLives = getMaxLivesForDifficulty(difficulty);
      engineRef.current.stats.lives = maxLives;
      engineRef.current.stats.money = 0;
      engineRef.current.setupLevel(currentLevel);
      engineRef.current.resume();
    }
    setGameStatus('playing');
  };

  // Pause & Resume
  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
    setGameStatus('paused');
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resume();
    }
    setGameStatus('playing');
  };

  const handleMainMenu = () => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
    setGameStatus('menu');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Viewport (100% Unobstructed, Isolated Container) */}
      <div ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-auto" />

      {/* In-Game HUD (During active gameplay) */}
      {gameStatus === 'playing' && (
        <>
          <HUD
            stats={stats}
            lang={lang}
            onPause={handlePause}
            onToggleSound={handleToggleSound}
            onToggleLang={handleToggleLang}
            isMuted={isMuted}
          />

          {/* On-Screen Thumb-Friendly Touch Controls */}
          <TouchControls
            lang={lang}
            onPedalStart={() => engineRef.current?.setInput('forward', true)}
            onPedalEnd={() => engineRef.current?.setInput('forward', false)}
            onBrakeStart={() => engineRef.current?.setInput('backward', true)}
            onBrakeEnd={() => engineRef.current?.setInput('backward', false)}
            onLeftStart={() => engineRef.current?.setInput('left', true)}
            onLeftEnd={() => engineRef.current?.setInput('left', false)}
            onRightStart={() => engineRef.current?.setInput('right', true)}
            onRightEnd={() => engineRef.current?.setInput('right', false)}
            onBell={() => engineRef.current?.ringBell()}
          />
        </>
      )}

      {/* Floating Animated Toast Notifications */}
      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 py-2 rounded-2xl bg-slate-900/95 border border-emerald-500/80 shadow-2xl text-xs md:text-sm font-bold text-emerald-300 animate-in fade-in slide-in-from-top-4 duration-200">
          {lang === 'bn' ? notification.msgBn : notification.msgEn}
        </div>
      )}

      {/* Modals & Screens */}
      {gameStatus === 'menu' && (
        <MainMenuModal
          lang={lang}
          difficulty={difficulty}
          unlockedLevels={stats.unlockedLevels}
          highScore={stats.highScore}
          isMuted={isMuted}
          onPlay={handleStartGame}
          onSelectDifficulty={handleSelectDifficulty}
          onToggleLang={handleToggleLang}
          onToggleSound={handleToggleSound}
        />
      )}

      {gameStatus === 'paused' && (
        <PauseModal
          lang={lang}
          isMuted={isMuted}
          onResume={handleResume}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
          onToggleSound={handleToggleSound}
        />
      )}

      {gameStatus === 'level_cleared' && (
        <LevelClearedModal
          level={currentLevel}
          money={stats.money}
          lang={lang}
          onNextLevel={handleNextLevel}
          onMainMenu={handleMainMenu}
        />
      )}

      {gameStatus === 'game_over' && (
        <GameOverModal
          reasonBn={gameOverReason.bn}
          reasonEn={gameOverReason.en}
          money={stats.money}
          lang={lang}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}
    </div>
  );
}
