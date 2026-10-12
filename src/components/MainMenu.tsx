
type MainMenuProps = {
  onStart: () => void;
};

export function MainMenu({ onStart }: MainMenuProps) {
  return (
    <div className="screen-overlay title-overlay">
      <img
        src={`${import.meta.env.BASE_URL}assets/missile.png`}
        alt=""
        className="menu-missile menu-missile-left"
      />

      <img
        src={`${import.meta.env.BASE_URL}assets/missile.png`}
        alt=""
        className="menu-missile menu-missile-right"
      />
      <h2>
        ALICES ADVENTURES IN <br />
       
        <span>BETALAND</span>
      </h2>

      <p className="title-description">
        Tak? A wyjaśnij mi proszę logikę i żelazne zasady rozumu które stoją za 
        błaganiem nieznajomej kobiety żeby wyśmiewała cię za 
        bycie prawiczkiem i rozkazywała wykonywać upokarzające 
        zadania na filmach.                 
      </p>
      <p className="title-description">
        ~ Lady Alice, 2026
      </p>

      <button className="primary-button" onClick={onStart}>
        <span>▶</span> START MISSION
      </button>

      <p className="menu-hint">PRESS START TO DESTROY SOME VIRGIN BETA LOOSERS</p>
    </div>
  );
}
