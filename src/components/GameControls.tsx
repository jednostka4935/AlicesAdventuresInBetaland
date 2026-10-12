
import { useEffect } from 'react';
import type { GameStatus } from '../App';

type GameControlsProps = {
  status: GameStatus;
  onStatusChange: (status: GameStatus) => void;
};

export function GameControls({
  status,
  onStatusChange,
}: GameControlsProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (status === 'playing') onStatusChange('paused');
        else if (status === 'paused') onStatusChange('playing');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, onStatusChange]);

  if (status === 'menu' || status === 'gameover') {
    return null;
  }

  return (
    <div className="control-buttons">
      {status === 'playing' ? (
        <button
          className="secondary-button"
          onClick={() => onStatusChange('paused')}
        >
          Ⅱ Pause
        </button>
      ) : (
        <button
          className="secondary-button"
          onClick={() => onStatusChange('playing')}
        >
          ▶ Resume
        </button>
      )}

      <button
        className="secondary-button"
        onClick={() => onStatusChange('menu')}
      >
        ↻ Exit
      </button>
    </div>
  );
}
