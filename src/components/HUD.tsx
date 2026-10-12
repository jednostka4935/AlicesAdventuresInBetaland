
type HUDProps = {
  score: number;
  wave: number;
  lives: number;
};

export function HUD({ score, wave, lives }: HUDProps) {
  return (
    <section className="hud" aria-label="Game statistics">
      <div className="hud-stat">
        <span className="hud-label">SCORE</span>
        <strong>{String(score).padStart(6, '0')}</strong>
      </div>

      <div className="hud-stat">
        <span className="hud-label">CURRENT WAVE</span>
        <strong className="lime-text">{String(wave).padStart(2, '0')}</strong>
      </div>

      <div className="hud-stat">
        <span className="hud-label">LIVES</span>
        <strong className="lives">
          {'♠ '.repeat(Math.max(0, lives)).trim() || '—'}
        </strong>
      </div>
    </section>
  );
}
