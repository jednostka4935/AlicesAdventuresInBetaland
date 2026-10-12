
import { useCallback, useEffect, useRef } from 'react';
import type { GameStatus } from '../App';
const missileImage = new Image();
missileImage.src =
  `${import.meta.env.BASE_URL}assets/missile.png`;


const enemyImages = [
  new Image(),
  new Image(),
  new Image(),
];

enemyImages[0].src = `${import.meta.env.BASE_URL}assets/enemies/dude.png`;
enemyImages[1].src = `${import.meta.env.BASE_URL}assets/enemies/pepe.png`;
enemyImages[2].src = `${import.meta.env.BASE_URL}assets/enemies/printer.png`;


type Stats = {
  score: number;
  wave: number;
  lives: number;
};

type GameCanvasProps = {
  status: GameStatus;
  onStatsChange: (stats: Stats) => void;
  onGameOver: () => void;
};

type Enemy = {
  x: number;
  y: number;
  speed: number;
  hp: number;
  size: number;
  type: number;
};

type Shot = {
  x: number;
  y: number;
  speed: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

const WIDTH = 960;
const HEIGHT = 540;

export function GameCanvas({
  status,
  onStatsChange,
  onGameOver,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef(status);
  const callbacks = useRef({ onStatsChange, onGameOver });

  statusRef.current = status;
  callbacks.current = { onStatsChange, onGameOver };

  const reset = useCallback(() => {
    const world = worldRef.current;
    world.player = { x: 110, y: HEIGHT / 2, cooldown: 0, invulnerable: 0 };
    world.enemies = [];
    world.shots = [];
    world.particles = [];
    world.score = 0;
    world.lives = 3;
    world.wave = 1;
    world.spawnTimer = 0.5;
    world.elapsed = 0;
    world.statsTimer = 0;
    world.gameOverSent = false;
    callbacks.current.onStatsChange({
      score: 0,
      wave: 1,
      lives: 3,
    });
  }, []);

  const worldRef = useRef({
    player: { x: 110, y: HEIGHT / 2, cooldown: 0, invulnerable: 0 },
    enemies: [] as Enemy[],
    shots: [] as Shot[],
    particles: [] as Particle[],
    score: 0,
    lives: 3,
    wave: 1,
    spawnTimer: 0.5,
    elapsed: 0,
    statsTimer: 0,
    gameOverSent: false,
  });

  const keys = useRef(new Set<string>());
  const previousStatus = useRef(status);

  useEffect(() => {
    if (
      status === 'playing' &&
      (previousStatus.current === 'menu' ||
        previousStatus.current === 'gameover')
    ) {
      reset();
    }
    previousStatus.current = status;
  }, [status, reset]);

  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(
          event.code,
        )
      ) {
        event.preventDefault();
      }
      keys.current.add(event.code);
    }

    function keyUp(event: KeyboardEvent) {
      keys.current.delete(event.code);
    }

    function clearKeys() {
      keys.current.clear();
    }

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', clearKeys);

    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', clearKeys);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let animationId = 0;
    let lastTime = performance.now();

    function drawPlayer(x: number, y: number) {
      if (!ctx) return;

      ctx.save();
      ctx.translate(x, y);

      ctx.fillStyle = '#171b2d';
      ctx.fillRect(-12, 10, 10, 27);
      ctx.fillRect(5, 10, 10, 27);

      ctx.fillStyle = '#b8ff42';
      ctx.beginPath();
      ctx.moveTo(-14, -10);
      ctx.lineTo(12, -10);
      ctx.lineTo(16, 17);
      ctx.lineTo(-14, 17);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#192033';
      ctx.fillRect(-2, -8, 10, 24);

      ctx.strokeStyle = '#b8ff42';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.lineTo(-22, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, -4);
      ctx.lineTo(23, 0);
      ctx.stroke();

      // Face and green hair
      ctx.fillStyle = '#f2c9b4';
      ctx.beginPath();
      ctx.ellipse(0, -22, 10, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#12a66a';
      ctx.beginPath();
      ctx.moveTo(-10, -23);
      ctx.lineTo(-13, -37);
      ctx.lineTo(-4, -32);
      ctx.lineTo(4, -42);
      ctx.lineTo(9, -29);
      ctx.lineTo(14, -24);
      ctx.lineTo(7, -15);
      ctx.lineTo(-7, -17);
      ctx.closePath();
      ctx.fill();

      // Energy orb
      ctx.shadowColor = '#b8ff42';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#d8ff83';
      ctx.beginPath();
      ctx.arc(28, -2, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    
    function drawEnemy(enemy: Enemy) {
      if (!ctx) return;

      const image = enemyImages[enemy.type] ?? enemyImages[0];
      if (!image.complete || image.naturalWidth === 0) {
        ctx.fillStyle = '#ff4f9a';
        ctx.fillRect(
          enemy.x - enemy.size / 2,
          enemy.y - enemy.size / 2,
          enemy.size,
          enemy.size
        );
        return;
      }

      ctx.save();

      ctx.shadowColor = '#ff4f9a';
      ctx.shadowBlur = 14;

      ctx.drawImage(
        image,
        enemy.x - enemy.size / 2,
        enemy.y - enemy.size / 2,
        enemy.size,
        enemy.size
      );

      ctx.restore();
    }


    function drawBackground() {
      if (!ctx) return;

      const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
      gradient.addColorStop(0, '#111a35');
      gradient.addColorStop(0.55, '#151329');
      gradient.addColorStop(1, '#32152e');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.strokeStyle = '#7888bd20';
      ctx.lineWidth = 1;

      for (let x = 0; x < WIDTH; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }

      for (let y = 0; y < HEIGHT; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }

      for (let i = 0; i < 65; i++) {
        const x = (i * 173 - worldRef.current.elapsed * 20 + WIDTH * 10) % WIDTH;
        const y = (i * 97) % HEIGHT;
        ctx.fillStyle = i % 3 === 0 ? '#b8ff42' : '#a4b4ff66';
        ctx.fillRect(x, y, 2, 2);
      }

      ctx.fillStyle = '#ffffff15';
      ctx.fillRect(0, 55, WIDTH, 2);
      ctx.fillRect(0, HEIGHT - 25, WIDTH, 2);
    }

    function update(dt: number) {
      const world = worldRef.current;
      const player = world.player;
      const pressed = keys.current;

      world.elapsed += dt;
      player.cooldown -= dt;
      player.invulnerable -= dt;
      world.spawnTimer -= dt;
      world.statsTimer += dt;

      let dx = 0;
      let dy = 0;

      if (pressed.has('ArrowLeft') || pressed.has('KeyA')) dx--;
      if (pressed.has('ArrowRight') || pressed.has('KeyD')) dx++;
      if (pressed.has('ArrowUp') || pressed.has('KeyW')) dy--;
      if (pressed.has('ArrowDown') || pressed.has('KeyS')) dy++;

      const length = Math.hypot(dx, dy) || 1;
      player.x = Math.max(
        35,
        Math.min(WIDTH * 0.48, player.x + (dx / length) * 260 * dt),
      );
      player.y = Math.max(
        85,
        Math.min(HEIGHT - 45, player.y + (dy / length) * 260 * dt),
      );

      if (pressed.has('Space') && player.cooldown <= 0) {
        world.shots.push({
          x: player.x + 30,
          y: player.y - 2,
          speed: 570,
        });
        player.cooldown = 0.2;
      }

      if (world.spawnTimer <= 0 && world.enemies.length < 7) {
        const size = 28 + Math.random() * 12;

        world.enemies.push({
          x: WIDTH + size,
          y: 80 + Math.random() * (HEIGHT - 130),
          speed: 95 + Math.random() * 65 + world.wave * 5,
          hp: 1,
          size,
          type: Math.floor(Math.random() * enemyImages.length),
        });

        world.spawnTimer = Math.max(0.35, 1.1 - world.wave * 0.04);
      }

      for (const enemy of world.enemies) {
        enemy.x -= enemy.speed * dt;
      }

      for (const shot of world.shots) {
        shot.x += shot.speed * dt;
      }

      const remainingEnemies: Enemy[] = [];

      for (const enemy of world.enemies) {
        let hit = false;

        for (const shot of world.shots) {
          if (
            shot.x >= enemy.x - enemy.size / 2 &&
            shot.x <= enemy.x + enemy.size / 2 &&
            Math.abs(shot.y - enemy.y) <= enemy.size / 2
          ) {
            shot.x = WIDTH + 100;
            hit = true;
            break;
          }
        }

        if (hit) {
          world.score += 10;

          for (let i = 0; i < 7; i++) {
            world.particles.push({
              x: enemy.x,
              y: enemy.y,
              vx: (Math.random() - 0.5) * 180,
              vy: (Math.random() - 0.5) * 180,
              life: 0.4 + Math.random() * 0.3,
            });
          }
        } else if (enemy.x < player.x + 24 && Math.abs(enemy.y - player.y) < 28) {
          if (player.invulnerable <= 0) {
            world.lives--;
            player.invulnerable = 1.2;
          }
        } else if (enemy.x > -50) {
          remainingEnemies.push(enemy);
        }
      }

      world.enemies = remainingEnemies;
      world.shots = world.shots.filter((shot) => shot.x < WIDTH + 20);

      for (const particle of world.particles) {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.life -= dt;
      }
      world.particles = world.particles.filter((p) => p.life > 0);

      world.wave = 1 + Math.floor(world.score / 150);

      if (world.statsTimer >= 0.1) {
        world.statsTimer = 0;
        callbacks.current.onStatsChange({
          score: world.score,
          wave: world.wave,
          lives: world.lives,
        });
      }

      if (world.lives <= 0 && !world.gameOverSent) {
        world.gameOverSent = true;
        callbacks.current.onGameOver();
      }
    }

    function render() {
      if (!ctx) return;

      const world = worldRef.current;

      drawBackground();

      for (const shot of world.shots) {
        if (!missileImage.complete || missileImage.naturalWidth === 0) {
          continue;
        }

        const width = 32;
        const height = 32;

        ctx.save();

        ctx.translate(shot.x, shot.y);

        const angle = world.elapsed * 8;

        ctx.rotate(angle);

        ctx.drawImage(
          missileImage,
          -width / 2,
          -height / 2,
          width,
          height
        );

        ctx.restore();
      }

      world.enemies.forEach(drawEnemy);

      for (const particle of world.particles) {
        ctx.globalAlpha = Math.max(0, particle.life / 0.7);
        ctx.fillStyle = '#b8ff42';
        ctx.fillRect(particle.x, particle.y, 4, 4);
      }
      ctx.globalAlpha = 1;

      const player = world.player;
      if (
        player.invulnerable <= 0 ||
        Math.floor(world.elapsed * 15) % 2 === 0
      ) {
        drawPlayer(player.x, player.y);
      }
    }

    function frame(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      if (statusRef.current === 'playing') {
        update(dt);
      }

      render();
      animationId = requestAnimationFrame(frame);
    }

    render();
    animationId = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      width={WIDTH}
      height={HEIGHT}
      aria-label="Shego shooter game arena"
      role="img"
    />
  );
}
