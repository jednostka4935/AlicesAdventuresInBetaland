
import { useState, useCallback } from 'react';
import { GameCanvas } from './game/GameCanvas';
import { MainMenu } from './components/MainMenu';
import { HUD } from './components/HUD';
import { GameControls } from './components/GameControls';
import './styles/game.css';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('menu');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);

  const handleStatsChange = useCallback(
    (stats: { score: number; wave: number; lives: number }) => {
      setScore(stats.score);
      setWave(stats.wave);
      setLives(stats.lives);
    },
    [],
  );

  const handleGameOver = useCallback(() => {
    setStatus('gameover');
  }, []);

  function startGame() {
    setScore(0);
    setWave(1);
    setLives(3);
    setStatus('playing');
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">A</span>
          <div>
            <p className="eyebrow">ARCADE PROJECT / 001</p>
            <h1>LADY ALICE <span>VELVET UNDERDOG</span></h1>
          </div>
        </div>

        <div className="topbar-right">
          <span className="status-dot" />
          <span>{status === 'playing' ? 'IN COMBAT' : status.toUpperCase()}</span>
        </div>
      </header>

      <section className="game-layout">
        <div className="game-heading">
          <GameControls status={status} onStatusChange={setStatus} />
        </div>

        <div className="game-stage">
          <GameCanvas 
            status={status} 
            onStatsChange={handleStatsChange}
            onGameOver={handleGameOver}
          />

          {status === 'menu' && (
            <MainMenu onStart={startGame} />
          )}

          {status === 'paused' && (
            <div className="screen-overlay">
              <p className="eyebrow">SYSTEM PAUSED</p>
              <h2>Take a breather.</h2>
              <p>Your next wave is waiting.</p>
              <button className="primary-button" onClick={() => setStatus('playing')}>
                Resume mission
              </button>
            </div>
          )}

          {status === 'gameover' && (
            <div className="screen-overlay">
              <p className="eyebrow">MISSION FAILED</p>
              <h2>Try again?</h2>
              <p>You scored {score} points.</p>
              <button className="primary-button" onClick={startGame}>
                Play again
              </button>
            </div>
          )}
        </div>

        <HUD score={score} wave={wave} lives={lives} />

        <footer className="game-footer">
          <span>WASD / ARROWS <span className="muted">MOVE</span></span>
          <span>SPACE <span className="muted">FIRE</span></span>
          <span>ESC <span className="muted">PAUSE</span></span>
        </footer>
      </section>

      <p className="disclaimer">
        Fan-made prototype. Kim Possible and Shego belong to their respective rights holders.
      </p>
    </main>
  );
}
