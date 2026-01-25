<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover" />
<title>Neon Ascent — Prototype</title>
<style>
  :root{
    --bg1:#071428; --bg2:#041e2f; --accent1:#00ffe1; --accent2:#ff4db6; --coin:#ffd740;
    --ui: rgba(255,255,255,0.9);
  }
  html,body{height:100%;margin:0;background:linear-gradient(180deg,var(--bg1),var(--bg2));font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--ui);-webkit-tap-highlight-color:transparent}
  #wrap{height:100%;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}
  canvas{background:transparent;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.6);touch-action:none}
  .uiTop{position:fixed;left:14px;top:14px;display:flex;gap:10px;align-items:center}
  .tag{background:rgba(255,255,255,0.06);padding:8px 12px;border-radius:10px;font-weight:700}
  .center{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none}
  .btn{pointer-events:auto;padding:10px 16px;margin-top:10px;border-radius:10px;border:none;background:linear-gradient(90deg,var(--accent2),var(--accent1));color:#031224;font-weight:800;cursor:pointer}
  .footer{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.55);font-size:13px}
</style>
</head>
<body>
<div id="wrap">
  <canvas id="game"></canvas>
  <div class="uiTop">
    <div class="tag" id="score">Score: 0</div>
    <div class="tag" id="best">Best: 0</div>
  </div>
  <div class="center" id="centerUI">
    <div style="font-size:18px;margin-bottom:6px">Neon Ascent</div>
    <div style="color:rgba(255,255,255,0.8)">Tap/Swipe — move. Tap to shoot.</div>
    <button class="btn" id="start">Start</button>
  </div>
  <div class="footer">Prototype — TG Mini App ready</div>
</div>

<script>
(() => {
  // Canvas setup
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W_INTERNAL = 540;   // internal resolution (portrait)
  const H_INTERNAL = 960;
  let scale = 1;
  function resize(){
    // keep ~9:16 ratio, fit to viewport
    const maxW = Math.min(window.innerWidth - 24, 540);
    const maxH = Math.min(window.innerHeight - 48, 960);
    let w = maxW;
    let h = Math.round(w * (H_INTERNAL / W_INTERNAL));
    if(h > maxH){ h = maxH; w = Math.round(h * (W_INTERNAL / H_INTERNAL)); }
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = W_INTERNAL;
    canvas.height = H_INTERNAL;
    scale = w / W_INTERNAL;
  }
  window.addEventListener('resize', resize);
  resize();

  // UI refs
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const centerUI = document.getElementById('centerUI');
  const startBtn = document.getElementById('start');

  // Game state
  let running = false;
  let score = 0;
  let best = parseInt(localStorage.getItem('neon_best') || '0', 10);
  bestEl.textContent = 'Best: ' + best;

  // Player (drone)
  const lanes = 3; // optional lane mode (for easier controls)
  // We'll support both smooth x movement and lane snaps via swipe
  const player = {
    x: W_INTERNAL/2, y: H_INTERNAL - 180, r: 28,
    vx: 0, speedHoriz: 10, lane: 1
  };

  // World (we move entities downward to simulate upward movement)
  let speed = 140; // pixels per second downward (world)
  const speedRamp = 0.005; // per sec increase
  let entities = []; // obstacles, enemies, crystals, bullets
  let spawnAcc = 0;
  const spawnInterval = 700; // ms base

  // Input vars
  let touchStart = null;
  let lastTap = 0;

  // Helpers
  const rnd = (a,b) => a + Math.random()*(b-a);
  const randInt = (a,b) => Math.floor(a + Math.random()*(b-a+1));

  // Entity factory
  function spawn(type, opts = {}){
    const e = { type, x: opts.x ?? randInt(120, W_INTERNAL-120), y: opts.y ?? -60, w: opts.w ?? 40, h: opts.h ?? 40, r: opts.r ?? 18, hp: opts.hp ?? 1 };
    // fill specific props
    if(type === 'crystal'){ e.color = '#ffd740'; e.vy = 0; e.score = 10; }
    if(type === 'enemy'){ e.color = '#ff6aa3'; e.vx = opts.vx ?? 0; e.vy = 0; e.hp = 1; e.score = 25; e.shootTimer = rnd(800,1600); }
    if(type === 'barrier'){ e.color = '#243447'; e.w = opts.w ?? 120; e.h = opts.h ?? 40; e.hp = opts.hp ?? 2; }
    if(type === 'turret'){ e.color = '#8ad1ff'; e.shootTimer = rnd(600,1200); e.hp = 2; }
    if(type === 'bullet'){ e.color = opts.color || '#00ffe1'; e.vy = opts.vy || 220; e.r = opts.r || 6; e.owner = opts.owner || 'player'; }
    entities.push(e);
    return e;
  }

  // Patterns
  const patterns = [
    () => { spawn('crystal',{x:120}); spawn('enemy',{x:420, vx:-30}); },
    () => { spawn('barrier',{x:270}); spawn('crystal',{x:180}); spawn('crystal',{x:360}); },
    () => { spawn('turret',{x:140}); spawn('turret',{x:400}); },
    () => { for(let i=0;i<3;i++) spawn('crystal',{x:120 + i*180, y:-40 - i*60}); }
  ];

  // Start / End
  function startGame(){
    entities = [];
    score = 0;
    speed = 140;
    player.x = W_INTERNAL/2;
    player.lane = 1;
    running = true;
    centerUI.style.display = 'none';
    lastTime = performance.now();
  }
  function endGame(){
    running = false;
    if(score > best){ best = score; localStorage.setItem('neon_best', best); bestEl.textContent = 'Best: ' + best; }
    centerUI.style.display = 'block';
    centerUI.querySelector('div').textContent = 'Game Over — Score: ' + score;
    startBtn.textContent = 'Restart';
  }

  // Shooting
  function playerShoot(){
    // spawn a bullet from player upwards (owner = player, vy negative)
    spawn('bullet',{x:player.x, y:player.y - player.r - 8, vy: -420, color: '#00ffe1', owner: 'player', r:6});
  }

  // Collision helpers
  function circleRectColl(cx,cy,cr, rx,ry,rw,rh){
    // rx,ry - center of rect
    const hw = rw/2, hh = rh/2;
    const dx = Math.abs(cx - rx);
    const dy = Math.abs(cy - ry);
    if(dx > hw + cr) return false;
    if(dy > hh + cr) return false;
    if(dx <= hw) return true;
    if(dy <= hh) return true;
    const dx2 = dx - hw, dy2 = dy - hh;
    return dx2*dx2 + dy2*dy2 <= cr*cr;
  }

  // Update loop
  let lastTime = 0;
  function update(dt){
    // dt in seconds
    // speed increases slowly
    speed += speedRamp * dt * 1000;

    // spawn patterns occasionally
    spawnAcc += dt*1000;
    if(spawnAcc > spawnInterval){
      spawnAcc = 0;
      // choose random pattern
      (rnd(0,1) > 0.15) ? patterns[randInt(0,patterns.length-1)]() : spawn('enemy',{x:randInt(120,420)});
    }

    // update entities
    for(let i = entities.length-1; i>=0; --i){
      const e = entities[i];
      // common vertical motion = world moving down relative to player
      e.y += (speed * dt) + (e.vy || 0) * dt;
      if(e.vx) e.x += e.vx * dt;
      // turret/enemy shooting
      if(e.type === 'enemy' || e.type === 'turret'){
        e.shootTimer -= dt*1000;
        if(e.shootTimer <= 0){
          e.shootTimer = rnd(700,1400);
          // enemy shoots downward
          spawn('bullet',{x:e.x, y:e.y + (e.h||24)/2 + 10, vy: 240, color: '#ff9d66', owner: 'enemy', r:6});
        }
      }
      // remove offscreen entities
      if(e.y > H_INTERNAL + 120 || e.x < -120 || e.x > W_INTERNAL + 120) entities.splice(i,1);
    }

    // player smoothing (move toward lane or free x)
    // simple lane snap when using swipe controls (we support swipe to change lane)
    const targetX = 120 + player.lane * 150; // lanes at 120,270,420
    // smooth approach
    player.x += (targetX - player.x) * Math.min(1, 8 * dt);

    // bullets collisions
    for(let i = entities.length-1; i>=0; --i){
      const e = entities[i];
      if(e.type === 'bullet' && e.owner === 'player'){
        // hit enemies / turrets / barriers
        for(let j = entities.length-1; j>=0; --j){
          const t = entities[j];
          if(t === e) continue;
          if(t.type === 'enemy' || t.type === 'turret' || t.type === 'barrier'){
            if(circleRectColl(e.x, e.y, e.r, t.x, t.y, t.w || t.r*2, t.h || t.r*2)){
              t.hp -= 1;
              // remove bullet
              entities.splice(i,1);
              if(t.hp <= 0){
                // reward
                score += t.score || 20;
                // spawn crystals small
                for(let k=0;k<randInt(1,3);k++) spawn('crystal',{x: t.x + randInt(-30,30), y: t.y + randInt(-10,10)});
              }
              break;
            }
          }
        }
      }
    }

    // enemy bullets hitting player and crystals collection
    for(let i = entities.length-1; i>=0; --i){
      const e = entities[i];
      if(e.type === 'bullet' && e.owner === 'enemy'){
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        if(dist < e.r + player.r - 8){
          // hit player -> end
          endGame();
          return;
        }
      }
      if(e.type === 'crystal'){
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        if(dist < e.r + player.r - 6){
          // collect
          score += e.score;
          entities.splice(i,1);
          continue;
        }
      }
      if((e.type === 'enemy' || e.type === 'turret' || e.type === 'barrier')){
        // enemy collides with player (touch)
        if(circleRectColl(player.x, player.y, player.r - 4, e.x, e.y, e.w || e.r*2, e.h || e.r*2)){
          endGame(); return;
        }
      }
    }

    // score by distance
    score += Math.floor(speed * dt * 0.02);
    scoreEl.textContent = 'Score: ' + score;
  }

  // Render
  function draw(){
    // clear
    ctx.clearRect(0,0,W_INTERNAL,H_INTERNAL);

    // background gradient
    const g = ctx.createLinearGradient(0,0,0,H_INTERNAL);
    g.addColorStop(0,'#071428');
    g.addColorStop(1,'#041e2f');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W_INTERNAL,H_INTERNAL);

    // subtle vertical lines (tunnel)
    ctx.save();
    ctx.globalAlpha = 0.06;
    for(let x=60;x<W_INTERNAL;x+=60){
      ctx.fillStyle = (x%120===0) ? '#00ffe1' : '#ff4db6';
      ctx.fillRect(x,0,2,H_INTERNAL);
    }
    ctx.restore();

    // entities (draw in order: crystals, enemies, barriers, bullets)
    // crystals
    for(const e of entities){
      if(e.type === 'crystal'){
        // glow
        const rg = ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,e.r*3);
        rg.addColorStop(0,'rgba(255,215,64,0.9)');
        rg.addColorStop(1,'rgba(255,215,64,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(e.x - e.r*3, e.y - e.r*3, e.r*6, e.r*6);
        // coin
        ctx.beginPath();
        ctx.fillStyle = e.color;
        ctx.arc(e.x,e.y,e.r,0,Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#e6b200';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // barriers and enemies/turrets
    for(const e of entities){
      if(e.type === 'barrier'){
        ctx.fillStyle = e.color;
        roundRect(ctx, e.x - e.w/2, e.y - e.h/2, e.w, e.h, 10);
        ctx.fill();
        // hp hint
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(e.x - e.w/2, e.y - e.h/2 - 8, e.w * (e.hp/2), 4);
      } else if(e.type === 'enemy'){
        // enemy body
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.ellipse(e.x, e.y, 22, 18, 0, 0, Math.PI*2);
        ctx.fill();
        // eye
        ctx.fillStyle = '#001a2b';
        ctx.beginPath();
        ctx.arc(e.x+4, e.y-2, 5, 0, Math.PI*2);
        ctx.fill();
      } else if(e.type === 'turret'){
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.rect(e.x-18, e.y-10, 36, 22);
        ctx.fill();
        ctx.fillStyle = '#001a2b';
        ctx.fillRect(e.x-6, e.y-6, 12, 12);
      }
    }

    // bullets
    for(const e of entities){
      if(e.type === 'bullet'){
        ctx.beginPath();
        ctx.fillStyle = e.color;
        ctx.arc(e.x, e.y, e.r, 0, Math.PI*2);
        ctx.fill();
      }
    }

    // player
    // shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(player.x, player.y + player.r*0.9, player.r*1.3, player.r*0.55, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
    // body
    ctx.beginPath();
    const pg = ctx.createLinearGradient(player.x - player.r, player.y - player.r, player.x + player.r, player.y + player.r);
    pg.addColorStop(0, '#00ffe1'); pg.addColorStop(1, '#7bffcd');
    ctx.fillStyle = pg;
    ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
    ctx.fill();
    // stripe
    ctx.fillStyle = '#ff4db6';
    ctx.fillRect(player.x - player.r, player.y + 8, player.r*2, 10);
    // cockpit
    ctx.fillStyle = '#021428';
    ctx.beginPath();
    ctx.arc(player.x, player.y - 6, player.r*0.45, 0, Math.PI*2);
    ctx.fill();
  }

  // utilities
  function roundRect(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  // Main loop
  let raf = null;
  function loop(ts){
    raf = requestAnimationFrame(loop);
    if(!lastTime) lastTime = ts;
    const dt = Math.min(40, ts - lastTime) / 1000; // cap delta ~40ms
    lastTime = ts;
    if(running){
      update(dt);
    }
    draw();
  }
  raf = requestAnimationFrame(loop);

  // Input handling
  function clientToCanvas(clientX, clientY){
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / (rect.width) * W_INTERNAL;
    const y = (clientY - rect.top) / (rect.height) * H_INTERNAL;
    return {x,y};
  }

  canvas.addEventListener('touchstart', (ev) => {
    ev.preventDefault();
    const t = ev.changedTouches[0];
    touchStart = {x: t.clientX, y: t.clientY, time: Date.now()};
  }, {passive:false});

  canvas.addEventListener('touchend', (ev) => {
    ev.preventDefault();
    const t = ev.changedTouches[0];
    const dt = Date.now() - (touchStart?.time || 0);
    const dx = t.clientX - (touchStart?.x||0);
    const dy = t.clientY - (touchStart?.y||0);
    const absx = Math.abs(dx), absy = Math.abs(dy);
    if(absx > 40 && absx > absy){
      // horizontal swipe -> change lane
      if(dx < 0) player.lane = Math.max(0, player.lane - 1);
      else player.lane = Math.min(lanes-1, player.lane + 1);
    } else {
      // tap: if quick tap -> shoot; if long -> we could charge (not implemented)
      const pt = clientToCanvas(t.clientX, t.clientY);
      if(Date.now() - lastTap < 300){
        // double tap - small boost (implemented as lane center quickly)
        player.x = player.x; // placeholder, not needed now
      } else {
        playerShoot();
      }
      lastTap = Date.now();
    }
    touchStart = null;
  }, {passive:false});

  // Mouse fallback
  canvas.addEventListener('mousedown', (e) => {
    touchStart = {x:e.clientX,y:e.clientY,time:Date.now()};
  });
  canvas.addEventListener('mouseup', (e) => {
    const dx = e.clientX - (touchStart?.x||0);
    const dy = e.clientY - (touchStart?.y||0);
    const absx = Math.abs(dx), absy = Math.abs(dy);
    if(absx > 40 && absx > absy){
      if(dx < 0) player.lane = Math.max(0, player.lane - 1);
      else player.lane = Math.min(lanes-1, player.lane + 1);
    } else {
      playerShoot();
    }
    touchStart = null;
  });

  // Keyboard (desktop)
  window.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') player.lane = Math.max(0, player.lane - 1);
    if(e.key === 'ArrowRight') player.lane = Math.min(lanes-1, player.lane + 1);
    if(e.key === ' ' || e.key === 'Enter') {
      if(!running) startGame();
      else playerShoot();
    }
  });

  // Start button
  startBtn.addEventListener('click', () => {
    startGame();
  });

  // attempt Telegram WebApp ready
  try{
    if(window.Telegram && window.Telegram.WebApp){
      window.Telegram.WebApp.ready();
      try{ window.Telegram.WebApp.expand(); } catch(e){}
    }
  }catch(e){/* ignore */}

  // expose for debug
  window.NEON = { start: startGame, end: endGame, spawn, entities };

})();
</script>
</body>
  </html>
