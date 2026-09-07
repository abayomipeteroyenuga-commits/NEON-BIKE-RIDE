import { Input } from './controls.js';
import { VEHICLES, getVehicleById, cloneVehicle } from './vehicles.js';
import { ACHIEVEMENT_DEFS } from './achievements.js';
import { levelName, xpProgress } from './progression.js';
import { Settings } from './settings.js';
import { POIS, DISTRICTS, LANDMARKS } from './world.js';
import { makeRoomCode } from './multiplayer.js';
import { DEFAULT_BINDS, codeLabel } from './controls.js';
import { CAMPAIGN_MISSIONS, getCampaignColor } from './missions.js';
import { SHOP_ITEMS } from './shop.js';
import { getLocalRank, getCareerScore, getRankTier, syncGlobalRank } from './ranking.js';

export class UI {
  constructor() {
    this.input = new Input();
    this.input.bindMobile();
    this.toastTimer = null;
    if (!document.getElementById('city-drive-paint-css')) {
      const s = document.createElement('style'); s.id='city-drive-paint-css'; s.textContent = `
        .paint-choice-grid{display:grid;grid-template-columns:repeat(4,minmax(90px,1fr));gap:10px;margin:16px 0}.paint-choice{height:70px;border:2px solid rgba(255,255,255,.16);border-radius:12px;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,.3)}.paint-choice span{position:absolute;left:0;right:0;bottom:0;padding:5px 3px;background:rgba(0,0,0,.6);color:#fff;font-size:9px;font-weight:800;letter-spacing:.04em}.paint-choice.active{border-color:#fff;box-shadow:0 0 0 2px rgba(0,212,255,.35),0 8px 22px rgba(0,0,0,.4)}@media(max-width:600px){.paint-choice-grid{grid-template-columns:repeat(2,1fr)}}`; document.head.appendChild(s);
    }
  }

  $(id) { return document.getElementById(id); }

  _compactMissionText(value, max = 64) {
    let text = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (text.length > max) text = text.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
    return text;
  }

  _setMissionRow(id, value, max = 64) {
    const el = this.$(id);
    if (!el) return;
    const text = this._compactMissionText(value, max);
    el.textContent = text;
    el.classList.toggle('empty-row', !text);
  }

  _collapseMissionRows() {
    ['mission-title','mission-objective','mission-distance','mission-help','mission-reward'].forEach(id => {
      const el = this.$(id);
      if (!el) return;
      const empty = !String(el.textContent || '').trim();
      el.classList.toggle('empty-row', empty);
    });
    const timer = this.$('mission-timer');
    if (timer) {
      const empty = timer.classList.contains('hidden') || !String(timer.textContent || '').trim();
      timer.classList.toggle('empty-row', empty);
    }
  }

  _esc(value) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  setLoading(pct, text) {
    const fill = this.$('progress-fill');
    const t = this.$('loading-text');
    if (fill) fill.style.width = pct + '%';
    if (t && text) t.textContent = text;
  }

  hideLoading() {
    this.$('loading-screen').classList.add('hidden');
    this.$('main-menu').classList.remove('hidden');
  }

  showGame() {
    this.$('main-menu').classList.add('hidden');
    this.$('loading-screen').classList.add('hidden');
    this.$('game-container').classList.remove('hidden');
    if (window.innerWidth <= 600) this.$('mobile-controls').classList.remove('hidden');
  }



  openEmoteWheel(game) {
    if (this.$('emote-wheel')) { this.$('emote-wheel').remove(); return; }
    const root = document.createElement('div');
    root.id = 'emote-wheel';
    root.innerHTML = `<div class="emote-wheel-card">
      <div class="emote-wheel-title">EMOTES <small>Press B anytime</small></div>
      <div class="emote-grid">
        <button data-emote="Wave|👋">👋<span>WAVE</span></button>
        <button data-emote="Thumbs Up|👍">👍<span>GOOD JOB</span></button>
        <button data-emote="Celebrate|🎉">🎉<span>CELEBRATE</span></button>
        <button data-emote="Laugh|😂">😂<span>LAUGH</span></button>
        <button data-emote="Cool|😎">😎<span>COOL</span></button>
        <button data-emote="Love|❤️">❤️<span>LOVE IT</span></button>
      </div>
      <button class="emote-close">CLOSE</button>
    </div>`;
    document.body.appendChild(root);
    const close = () => root.remove();
    root.querySelectorAll('[data-emote]').forEach(btn => btn.addEventListener('click', () => {
      const [name, emoji] = btn.dataset.emote.split('|');
      game.triggerEmote(name, emoji);
      close();
    }));
    root.querySelector('.emote-close').addEventListener('click', close);
  }

  setVehicleSelectionMode(on) {
    document.body.classList.toggle('vehicle-selection-mode', !!on);
    this.$('hud')?.classList.toggle('hidden', !!on);
    this.$('mobile-controls')?.classList.toggle('hidden', true);
  }

  openVehicleSelect(game) {
    const catalog = VEHICLES;
    let selected = catalog.findIndex(v => v.id === game.state.activeVehicleId);
    if (selected < 0) selected = 0;
    let filter = 'ALL';

    const category = v => v.offroad >= 65 ? 'ADVENTURE' : (v.topSpeed >= 285 ? 'HYPER' : 'SPORT');
    const visible = () => catalog.map((v, i) => ({v, i})).filter(x => filter === 'ALL' || category(x.v) === filter);

    const refresh = () => {
      const v = catalog[selected];
      game.previewVehicle(v);
      const root = this.$('ui-panels');
      const ownedIds = new Set((game.state.garage.vehicles || []).filter(x => x?.isOwned !== false).map(x => x.id));
      const owned = ownedIds.has(v.id);
      const items = visible();
      const selectedVisible = items.findIndex(x => x.i === selected);

      root.innerHTML = `<div class="vehicle-select-screen" id="vehicle-select-screen">
        <div class="showroom-glow"></div>
        <header class="showroom-header">
          <div class="showroom-brand"><span class="brand-mark">NB</span><div><b>NEON BIKE RIDE</b><small>POWER BIKE EDITION</small></div></div>
          <div class="showroom-status"><span class="live-dot"></span> NEON ROUTES • ${catalog.length} BIKES</div>
          <div class="modern-cash-display"><span class="cash-icon">$</span><div><small>RIDER CASH</small><strong>${game.economy.format()}</strong></div>${game.isNewGameSession ? `<div class="starting-cash locked"><span>START CASH</span><button class="cash-choice active" data-cash="30000">$30K</button></div>` : ''}</div>
        </header>

        <div class="showroom-hero-copy">
          <span class="hero-kicker">YOUR BIKE. YOUR ROUTE.</span>
          <h1>CHOOSE YOUR<br><em>BIKE.</em></h1>
          <p>Choose a fictional power bike, follow the GPS tracker, and complete each mission.</p>
        </div>

        <div class="showroom-vehicle-name"><div class="selected-ride-flag">NOW RIDING PREVIEW</div><span>${category(v) === 'ADVENTURE' ? 'ADVENTURE BIKE' : category(v) === 'HYPER' ? 'HYPER BIKE' : 'POWER BIKE'}</span><h2>${v.name}</h2><small>${v.manufacturer || 'NEON BIKE RIDE'} · ${v.topSpeed} KM/H</small></div>

        <div class="showroom-bottom">
          <section class="showroom-detail">
            <div class="detail-line"><span>PERFORMANCE</span><b>${v.topSpeed} KM/H</b></div>
            <div class="showroom-bars"><div><span>HANDLING</span><i><b style="width:${Math.min(100, Number(v.handling)||0)}%"></b></i></div><div><span>OFF ROAD</span><i><b style="width:${Math.min(100, Number(v.offroad)||0)}%"></b></i></div></div>
            <p>${v.description || 'Built for the streets of the city.'}</p>
            <button class="menu-btn primary drive-now" id="drive-now"><span>${owned ? '▶' : '◆'}</span> ${owned ? 'RIDE THIS BIKE' : 'BUY & RIDE'}</button>
            <div class="drive-hint">ENTER / SPACE TO LAUNCH <span>•</span> ← → BROWSE</div>
          </section>

          <section class="showroom-picker">
            <nav class="showroom-tabs">${['ALL','SPORT','HYPER','ADVENTURE'].map(c => `<button class="showroom-tab ${filter===c?'active':''}" data-filter="${c}">${c}</button>`).join('')}</nav>
            <div class="clean-browse"><button class="browse-arrow" data-browse="prev" aria-label="Previous ride">‹</button><div><span>SELECTED RIDE</span><strong>${Math.max(0, selectedVisible + 1)} / ${items.length}</strong><small>Use A / D or the arrows to browse</small></div><button class="browse-arrow" data-browse="next" aria-label="Next ride">›</button></div>
          </section>
        </div>
      </div>`;

      this.$('drive-now').onclick = () => { if (game.driveSelectedVehicle(v)) this.closePanel(); };
      this.$('vehicle-select-screen').querySelectorAll('[data-filter]').forEach(btn => btn.onclick = () => {
        filter = btn.dataset.filter;
        const first = visible()[0];
        if (first) selected = first.i;
        refresh();
      });
      this.$('vehicle-select-screen').querySelectorAll('[data-browse]').forEach(btn => btn.onclick = () => {
        const itemsNow = visible();
        let pos = itemsNow.findIndex(x => x.i === selected);
        pos += btn.dataset.browse === 'next' ? 1 : -1;
        pos = Math.max(0, Math.min(itemsNow.length - 1, pos));
        selected = itemsNow[pos]?.i ?? selected;
        refresh();
      });
      this.$('vehicle-select-screen').querySelectorAll('[data-cash]').forEach(btn => btn.onclick = () => {
        if (game.setStartingCash(Number(btn.dataset.cash))) refresh();
      });
      this.input.onMenuKey = (e) => {
        const itemsNow = visible();
        let pos = itemsNow.findIndex(x => x.i === selected);
        if (e.code === 'ArrowRight' || e.code === 'KeyD') { pos = Math.min(itemsNow.length - 1, pos + 1); selected = itemsNow[pos]?.i ?? selected; refresh(); e.preventDefault(); }
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') { pos = Math.max(0, pos - 1); selected = itemsNow[pos]?.i ?? selected; refresh(); e.preventDefault(); }
        if (e.code === 'Enter' || e.code === 'Space') { this.$('drive-now')?.click(); e.preventDefault(); }
        if (e.code === 'Escape') e.preventDefault();
      };
    };
    refresh();
  }

  _updateMissionTimer(game) {
    const el = this.$('mission-timer');
    if (!el) return;
    const m = game.activeMission;
    if (!m?.campaign || !m.deadline) { this._hideMissionTimer(); return; }
    const seconds = Math.max(0, Math.ceil((m.deadline - performance.now()) / 1000));
    const mins = Math.floor(seconds / 60);
    const secs = String(seconds % 60).padStart(2, '0');
    el.textContent = `TIME ${mins}:${secs}`;
    el.classList.toggle('urgent', seconds <= 30);
    el.classList.remove('hidden');
    el.classList.remove('empty-row');
  }

  _hideMissionTimer() {
    const el = this.$('mission-timer');
    if (!el) return;
    el.classList.add('hidden', 'empty-row');
  }

  toast(msg) {
    const el = this.$('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.add('hidden'), 2800);
  }

  prompt(text) {
    const el = this.$('prompt');
    if (!text) { el.classList.add('hidden'); return; }
    el.textContent = text;
    el.classList.remove('hidden');
  }

  updateHUD(game) {
    // DOM-heavy HUD work is capped near 30 FPS. Physics/rendering remain full-rate,
    // but avoiding dozens of text/style writes at 60-120 FPS reduces mobile lag.
    const hudNow = performance.now();
    if (this._lastHudDraw && hudNow - this._lastHudDraw < 33) return;
    this._lastHudDraw = hudNow;
    const v = game.controller?.def;
    const kmh = game.controller ? Math.abs(game.controller.speed) * 3.6 : 0;
    const vehicleLabel = this.$('vehicle-name-display');
    if (vehicleLabel) vehicleLabel.textContent = v?.name || 'ON FOOT';
    this.$('speed-num').textContent = String(Math.round(kmh)).padStart(3, '0');
    this.$('gear-display').textContent = game.controller?.gear || 'P';
    this.$('rpm-fill').style.width = ((game.controller?.rpm || 0) * 100) + '%';
    const fuelPct = v ? Math.round(((v.currentFuel || 0) / v.fuelCapacity) * 100) : 0;
    const cond = v ? Math.round(v.currentCondition ?? 100) : 100;
    this.$('fuel-bar').style.width = fuelPct + '%';
    this.$('fuel-pct').textContent = fuelPct + '%';
    this.$('cond-bar').style.width = cond + '%';
    this.$('cond-pct').textContent = cond + '%';
    const nitro = game.controller ? (game.controller.nitroAmount / Math.max(1, v.nitroCapacity || 1)) * 100 : 0;
    this.$('nitro-bar').style.width = Math.max(0, nitro) + '%';
    this.$('money-display').textContent = game.economy.format();
    const stars = Math.round(game.npc.wanted);
    this.$('wanted-stars').textContent = stars ? '★'.repeat(stars) : '';
    this.$('level-display').textContent = 'LVL ' + game.state.player.level;

    const mp = this.$('mission-panel');
    const setRow = (id, text, max) => this._setMissionRow(id, text, max);
    const currentCampaign = game.getCampaignMission?.();
    const nextCampaign = CAMPAIGN_MISSIONS.find(m => m.level === Math.min(CAMPAIGN_MISSIONS.length, Math.max(1, Number(game.state?.player?.campaignLevel)||1)));
    const active = game.activeMission;
    if (active || currentCampaign || nextCampaign) { if (mp) mp.classList.remove('hidden'); } else { if (mp) mp.classList.add('hidden'); }
    if (active) {
      const cm = active.campaign;
      setRow('mission-title', cm ? `L${cm.level} • ${cm.title}` : (active.name || 'ACTIVE RIDER MISSION'), 44);
      if (cm) {
        const stage = Number(active.stage || 0);
        const isStagedJob = active.campaignType === 'job' && active.stages;
        const objective = isStagedJob
          ? (stage === 0 ? `PICKUP • LEVEL ${cm.level}` : `DELIVER • LEVEL ${cm.level}`)
          : String(cm.objective || 'FOLLOW GPS').toUpperCase();
        setRow('mission-objective', objective, 56);
        if (active.dest) {
          const p = game.controller?.mesh.position || game.playerMesh.position;
          const d = Math.hypot(p.x - Number(active.dest.x), p.z - Number(active.dest.z));
          setRow('mission-distance', `${(d / 100).toFixed(1)} KM • PAY ${game.economy.format(cm.reward)}`, 42);
        } else {
          setRow('mission-distance', `PAY ${game.economy.format(cm.reward)} • ${cm.xp} XP`, 36);
        }
        const next = CAMPAIGN_MISSIONS.find(x => x.level === cm.level + 1);
        setRow('mission-help', isStagedJob ? (stage === 0 ? 'STEP 1/2 • PICKUP' : 'STEP 2/2 • DELIVER') : (next ? `NEXT L${next.level}: ${next.title}` : 'FINAL MISSION'), 48);
        this._updateMissionTimer(game);
        const currentBikeName = game.controller?.def?.name || game.activeActor?.def?.name || 'CURRENT BIKE';
        const rivals = game._campaignRivals || [];
        if (cm.type === 'buy') {
          setRow('mission-reward', `CURRENT BIKE: ${currentBikeName}`, 34);
        } else if (cm.type === 'upgrade') {
          setRow('mission-reward', `UPGRADE: ${currentBikeName}`, 34);
        } else if (rivals.length) {
          const order = [...rivals].sort((a,b) => (b.progress || 0) - (a.progress || 0));
          const lead = order[0];
          setRow('mission-reward', `LEADER ${lead?.name || 'AI'} ${Math.round(lead?.progress || 0)}%`, 32);
        } else {
          setRow('mission-reward', `${cm.xp} XP`, 18);
        }
      } else if (active.kind === 'job' && active.dest) {
        this._hideMissionTimer();
        const p = game.controller?.mesh.position || game.playerMesh.position;
        const d = Math.hypot(p.x - Number(active.dest.x), p.z - Number(active.dest.z));
        setRow('mission-objective', `RIDE TO: ${active.dest.name}`, 52);
        setRow('mission-distance', `${(d / 100).toFixed(1)} KM`, 18);
        setRow('mission-help', 'FOLLOW GOLD MARKER', 28);
        setRow('mission-reward', '', 1);
      } else {
        this._hideMissionTimer();
        const total = active.checkpoints?.length || 0;
        const current = total ? Math.min(active.index + 1, total) : 0;
        setRow('mission-objective', `CHECKPOINT ${current}/${total}`, 28);
        setRow('mission-distance', 'FOLLOW COLORED CP', 28);
        setRow('mission-help', 'RACE • PASS ALL CP', 28);
        setRow('mission-reward', '', 1);
      }
    } else {
      const next = currentCampaign || nextCampaign;
      this._hideMissionTimer();
      setRow('mission-title', 'MISSION CONTROL', 26);
      setRow('mission-objective', next ? `NEXT L${next.level}: ${next.title}` : 'CAMPAIGN COMPLETE', 48);
      setRow('mission-distance', next ? String(next.objective || 'FOLLOW GPS').toUpperCase() : 'ALL MISSIONS COMPLETE', 52);
      setRow('mission-help', next ? 'FOLLOW GPS' : 'FREE RIDE', 18);
      setRow('mission-reward', next ? `PAY ${game.economy.format(next.reward)} • ${next.xp} XP` : '', 32);
    }
    this._collapseMissionRows();

    // Live destination tracker: always tells the rider exactly where to go.
    const tracker = this.$('destination-tracker');
    if (tracker) {
      const mission = game.activeMission;
      const dest = mission?.dest;
      if (mission && dest) {
        const p = game.controller?.mesh.position || game.playerMesh.position;
        const d = Math.hypot(p.x - Number(dest.x), p.z - Number(dest.z));
        const level = mission.campaign?.level;
        const colorNum = level ? getCampaignColor(level) : (mission.kind === 'race' ? 0x00ff9d : 0x00d4ff);
        const color = '#' + colorNum.toString(16).padStart(6,'0');
        tracker.classList.remove('hidden');
        tracker.style.setProperty('--tracker-color', color);
        this.$('tracker-label').textContent = level ? `LEVEL ${level} DESTINATION` : 'DESTINATION';
        this.$('tracker-name').textContent = `${dest.name || mission.name || 'DESTINATION'}`;
        this.$('tracker-distance').textContent = `${(d / 100).toFixed(1)} KM AWAY`;
        const heading = game.controller?.mesh?.rotation?.y || 0;
        const targetAngle = Math.atan2(Number(dest.x)-p.x, Number(dest.z)-p.z);
        let relative = (targetAngle - heading) * 180 / Math.PI;
        while (relative > 180) relative -= 360;
        while (relative < -180) relative += 360;
        this.$('tracker-arrow').style.transform = `rotate(${relative}deg)`;
      } else {
        tracker.classList.add('hidden');
      }
    }

    const board = this.$('mp-board');
    if (board) {
      if (game.mp?.active) {
        // Standings do not need to rebuild the entire DOM every render/update.
        // Refresh at most 4 times per second while the race remains live.
        const now = performance.now();
        if (now - _lastMpUiUpdate > 250) {
          _lastMpUiUpdate = now;
          const rows = game.mp.standings();
          board.classList.remove('hidden');
          board.innerHTML = `<strong>RACE ${game.mp.room ? '· ' + game.mp.room : 'LOCAL'}</strong>` +
            rows.map((r, i) => `<div class="${r.you ? 'you' : ''}">${i + 1}. ${r.name}  CP ${r.cp}</div>`).join('');
        } else {
          board.classList.remove('hidden');
        }
      } else {
        board.classList.add('hidden');
      }
    }
  }

  drawMinimap(game) {
    const now = performance.now();
    if (this._lastMinimapDraw && now - this._lastMinimapDraw < 50) return;
    this._lastMinimapDraw = now;
    const c = this.$('minimap');
    if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;
    const pos = game.mode === 'driving' && game.controller ? game.controller.mesh.position : game.playerMesh.position;
    ctx.clearRect(0,0,w,h);
    const grd = ctx.createRadialGradient(w/2,h/2,10,w/2,h/2,w*.65);
    grd.addColorStop(0,'#0d2533'); grd.addColorStop(1,'#03070d');
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(0,212,255,.13)'; ctx.lineWidth=1;
    for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(w/2,h/2,(i+1)*w/14,0,Math.PI*2);ctx.stroke();}
    ctx.strokeStyle='rgba(255,255,255,.08)';
    for(let a=0;a<Math.PI*2;a+=Math.PI/8){ctx.beginPath();ctx.moveTo(w/2,h/2);ctx.lineTo(w/2+Math.sin(a)*w/2,h/2+Math.cos(a)*h/2);ctx.stroke();}
    const scale = 0.34;
    const sx = (x) => w / 2 + (x - pos.x) * scale;
    const sy = (z) => h / 2 + (z - pos.z) * scale;
    // visible roads from the CITY DRIVE engine, redrawn as neon bike routes
    ctx.strokeStyle = 'rgba(120,150,180,.42)'; ctx.lineWidth = 5; ctx.lineCap='round';
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath(); ctx.moveTo(sx(i * 80), sy(-390)); ctx.lineTo(sx(i * 80), sy(390)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx(-390), sy(i * 80)); ctx.lineTo(sx(390), sy(i * 80)); ctx.stroke();
    }
    if (game.activeRoute?.length > 1) {
      const level = game.activeMission?.campaign?.level;
      const colorNum = level ? getCampaignColor(level) : (game.activeMission?.kind === 'race' ? 0x00ff9d : 0x00d4ff);
      const routeColor = '#' + colorNum.toString(16).padStart(6,'0');
      ctx.save(); ctx.shadowColor=routeColor; ctx.shadowBlur=12; ctx.strokeStyle=routeColor; ctx.lineWidth=6; ctx.beginPath();
      game.activeRoute.forEach((p, i) => i ? ctx.lineTo(sx(p.x), sy(p.z)) : ctx.moveTo(sx(p.x), sy(p.z))); ctx.stroke();
      ctx.shadowBlur=0; ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
    }
    // POI dots
    ctx.fillStyle = '#00d4ff'; ctx.fillRect(sx(POIS.garage.x)-3, sy(POIS.garage.z)-3, 6, 6);
    ctx.fillStyle = '#ffcc33'; POIS.fuel.forEach(p => ctx.fillRect(sx(p.x)-2, sy(p.z)-2, 4, 4));
    if (game.activeMission?.dest) {
      const level = game.activeMission.campaign?.level; const colorNum = level ? getCampaignColor(level) : 0x00ff9d; const missionColor = '#' + colorNum.toString(16).padStart(6,'0');
      const x=sx(game.activeMission.dest.x), y=sy(game.activeMission.dest.z);
      ctx.save(); ctx.shadowColor=missionColor; ctx.shadowBlur=16; ctx.fillStyle=missionColor;
      ctx.beginPath(); ctx.moveTo(x,y-10); ctx.lineTo(x+9,y); ctx.lineTo(x,y+10); ctx.lineTo(x-9,y); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    // player arrow
    const heading = game.controller?.heading || 0;
    ctx.save(); ctx.translate(w/2,h/2); ctx.rotate(-heading); ctx.fillStyle='#00ff9d'; ctx.shadowColor='#00ff9d'; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.moveTo(0,-12); ctx.lineTo(8,8); ctx.lineTo(0,4); ctx.lineTo(-8,8); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle='rgba(255,255,255,.76)'; ctx.font='bold 9px system-ui'; ctx.fillText('LIVE GPS',8,14);
  }

  openPanel(title, html) {
    const root = this.$('ui-panels');
    root.innerHTML = `
      <div class="panel" id="active-panel">
        <div class="panel-header">
          <h2>${title}</h2>
          <button class="panel-close" id="panel-close">✕</button>
        </div>
        <div class="panel-body">${html}</div>
      </div>`;
    this.$('panel-close').onclick = () => this.closePanel();
    this._focusMenuItems();
  }

  closePanel() {
    this.$('ui-panels').innerHTML = '';
    this.input.gameplayEnabled = true;
    this.input.clearGameplay();
  }

  offerTestDriveReturn(game, catalogId) {
    const v = getVehicleById(catalogId);
    if (!v) return;
    this.openPanel('TEST DRIVE COMPLETE', `
      <h3>${v.name}</h3>
      <p class="price">${game.economy.format(v.price)}</p>
      <button class="menu-btn primary" id="td-buy">BUY BIKE</button>
      <button class="menu-btn" id="td-back">RETURN</button>
    `);
    this.$('td-buy').onclick = () => { if (game.buyVehicle(catalogId)) this.closePanel(); };
    this.$('td-back').onclick = () => this.openDealership(game, { name: 'Dealership', stock: null });
  }

  togglePause(game) {
    if (document.getElementById('active-panel')) {
      this.closePanel();
      return;
    }
    const nextPaused = !(game.paused);
    if (typeof game.setPaused === 'function') game.setPaused(nextPaused);
    else game.paused = nextPaused;
    this.$('pause-menu').classList.toggle('hidden', !game.paused);
    if (game.paused) this.input.clearGameplay();
  }

  _focusMenuItems() {
    const items = [...document.querySelectorAll('#active-panel .menu-btn, #active-panel .vehicle-card, #main-menu .menu-btn')];
    if (!items.length) return;
    let i = 0;
    const apply = () => {
      items.forEach((el, n) => el.classList.toggle('selected', n === i));
      items[i].scrollIntoView({ block: 'nearest' });
    };
    apply();
    this.input.onMenuKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) return;
      if (e.code === 'Escape') { this.closePanel(); e.preventDefault(); return; }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') { i = (i + 1) % items.length; apply(); e.preventDefault(); }
      if (e.code === 'ArrowUp' || e.code === 'KeyW') { i = (i - 1 + items.length) % items.length; apply(); e.preventDefault(); }
      if (e.code === 'Tab') { i = (i + (e.shiftKey ? -1 : 1) + items.length) % items.length; apply(); e.preventDefault(); }
      if (e.code === 'Enter') {
        const el = items[i];
        const btn = el.matches('button') ? el : el.querySelector('button');
        if (btn) btn.click();
        else el.click();
        e.preventDefault();
      }
    };
  }

  openGarage(game) {
    const g = game.state.garage;
    const owned = (g.vehicles || []).filter(v => v && v.isOwned !== false && !v.isTestDrive);
    const cards = owned.map((v, i) => `
      <div class="vehicle-card ${v.vehicleUid === game.state.activeVehicleUid ? 'active-bike-card' : ''}" data-i="${i}" data-uid="${v.vehicleUid}">
        <h3>${v.name} <span style="color:#8ab;font-size:.8rem">${v.manufacturer}</span>${v.vehicleUid === game.state.activeVehicleUid ? '<em class="active-bike-pill">CURRENT MISSION BIKE</em>' : ''}</h3>
        <div class="price">Condition ${Math.round(v.currentCondition || 100)}% · Fuel ${Math.round((v.currentFuel / v.fuelCapacity) * 100)}% · ${Math.round(v.currentMileage || 0)} km</div>
        <div class="stats">
          <div>Top ${v.topSpeed} km/h</div><div>Accel ${v.acceleration}s</div>
          <div>Handling ${v.handling}</div><div>Off-road ${v.offroad}</div>
        </div>
        <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
          <button class="menu-btn" data-act="drive" data-i="${i}" data-uid="${v.vehicleUid}">RIDE</button>
          <button class="menu-btn" data-act="upgrade" data-i="${i}" data-uid="${v.vehicleUid}">UPGRADE</button>
          <button class="menu-btn" data-act="paint" data-i="${i}" data-uid="${v.vehicleUid}">PAINT</button>
          <button class="menu-btn" data-act="sell" data-i="${i}" data-uid="${v.vehicleUid}">SELL</button>
        </div>
      </div>`).join('');
    this._garageIndex = 0;
    this.openPanel(`MY GARAGE  ${owned.length}/${g.capacity}`, `
      <p style="margin-bottom:12px">${game.economy.format()} · Level ${game.state.player.level} ${levelName(game.state.player.level)}</p>
      <p style="color:#8aa;font-size:.8rem;margin-bottom:8px">↑↓ select · E drive · C paint · U upgrade · R repair · F refuel · S sell · Esc close</p>
      <button class="menu-btn primary" id="btn-expand">EXPAND GARAGE</button>
      ${cards || '<p>No bikes</p>'}
    `);
    this.$('btn-expand').onclick = () => { game.expandGarage(); this.openGarage(game); };
    const prevMenu = this.input.onMenuKey;
    this.input.onMenuKey = (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;
      const n = owned.length;
      if (e.code === 'ArrowRight' || e.code === 'ArrowDown') this._garageIndex = Math.min(n - 1, (this._garageIndex || 0) + 1);
      if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') this._garageIndex = Math.max(0, (this._garageIndex || 0) - 1);
      const v = owned[this._garageIndex || 0];
      if (!v) { if (prevMenu) prevMenu(e); return; }
      if (e.code === 'KeyE' || e.code === 'Enter') {
        const actor = game.findActorByUid(v.vehicleUid);
        this.closePanel();
        if (actor) game.enterVehicle(actor);
        return;
      }
      if (e.code === 'KeyC') {
        this.openPaint(game, v);
        return;
      }
      if (e.code === 'KeyU') this.openUpgrades(game, v);
      if (e.code === 'KeyR') {
        game.repairVehicle(v); this.openGarage(game);
      }
      if (e.code === 'KeyF') {
        game.refuelVehicle(v);
        this.openGarage(game);
      }
      if (e.code === 'KeyS') {
        if (confirm('Sell this bike?')) { game.sellVehicleByUid(v.vehicleUid); this.openGarage(game); }
      }
      if (prevMenu) prevMenu(e);
    };
    this.$('ui-panels').querySelectorAll('[data-act]').forEach(btn => {
      btn.onclick = () => {
        const uid = btn.dataset.uid || owned[+btn.dataset.i]?.vehicleUid;
        const v = owned.find(x => x.vehicleUid === uid) || owned[+btn.dataset.i];
        const act = btn.dataset.act;
        if (act === 'drive') {
          this.closePanel();
          if (v) game._switchToOwnedBike?.(v, { keepPose: true }) || (game.findActorByUid(v.vehicleUid) && game.enterVehicle(game.findActorByUid(v.vehicleUid)));
        } else if (act === 'sell') {
          if (v && confirm('Sell this bike?')) { game.sellVehicleByUid(v.vehicleUid); this.openGarage(game); }
        } else if (act === 'upgrade') { if (v) this.openUpgrades(game, v); }
        else if (act === 'paint') {
          if (v) this.openPaint(game, v);
        }
      };
    });
  }

  openPaint(game, v) {
    const colors = [
      ['Emerald Green',0x1f5b3a], ['Pearl White',0xf2f4f5], ['Obsidian Black',0x111318],
      ['Crimson Red',0xc51f32], ['Electric Blue',0x1f6fff], ['Champagne Gold',0xd4a72c],
      ['Royal Purple',0x6d3fd1], ['Sunset Orange',0xf27a21]
    ];
    const current = Number(v.customization?.primaryColor ?? v.color ?? 0x1f5b3a) >>> 0;
    const swatches = colors.map(([name,hex]) => `<button type="button" class="paint-choice" data-color="${hex}" title="${name}" style="background:#${hex.toString(16).padStart(6,'0')}"><span>${name}</span></button>`).join('');
    this.openPanel('PAINT SHOP — ' + v.name, `
      <p style="color:#8aa;font-size:.82rem">Choose a finish for your bike. Paint costs ${game.economy.format(250)}.</p>
      <div class="paint-choice-grid">${swatches}</div>
      <button class="menu-btn" id="paint-back">BACK</button>
    `);
    this.$('ui-panels').querySelectorAll('.paint-choice').forEach(b => {
      const hex = Number(b.dataset.color) >>> 0;
      b.classList.toggle('active', hex === current);
      b.onclick = () => { if (game.paintVehicle(v, hex)) { this.openPaint(game, v); } };
    });
    this.$('paint-back').onclick = () => this.openGarage(game);
  }

  openUpgrades(game, v) {
    if (game.activeMission?.kind === 'campaign' && game.activeMission.campaignType === 'upgrade') {
      const current = (game.state.garage.vehicles || []).find(x => x.vehicleUid === game.state.activeVehicleUid);
      if (current) v = current;
    }
    const parts = ['engine', 'transmission', 'tires', 'brakes', 'suspension', 'nitro', 'fuelSystem'];
    const rows = parts.map(p => {
      const lvl = v.upgrades?.[p] || 0;
      return `<div class="vehicle-card"><strong>${p}</strong> Lv ${lvl}/5
        <button class="menu-btn" data-part="${p}">UPGRADE</button></div>`;
    }).join('');
    const missionNote = game.activeMission?.kind === 'campaign' && game.activeMission.campaignType === 'upgrade'
      ? '<p style="color:#00d4ff;font-size:.82rem;margin:0 0 10px">MISSION UPGRADE: this upgrades the current visible bike only.</p>'
      : '';
    this.openPanel('UPGRADES — ' + v.name, missionNote + rows + '<button class="menu-btn" id="back-g">BACK</button>');
    this.$('ui-panels').querySelectorAll('[data-part]').forEach(b => {
      b.onclick = () => { game.upgradeVehicle(v, b.dataset.part); this.openUpgrades(game, v); };
    });
    this.$('back-g').onclick = () => this.openGarage(game);
  }

  openDealership(game, dealer) {
    const ids = dealer.stock || VEHICLES.map(v => v.id);
    const stock = ids.map(id => getVehicleById(id)).filter(Boolean);
    const cards = stock.map(v => `
      <div class="vehicle-card">
        <h3>${v.name}</h3>
        <div class="price">${game.economy.format(v.price)} · Lvl ${v.requiredLevel} · ${v.tier}</div>
        <p style="font-size:.85rem;color:#9aa;margin:6px 0">${v.description}</p>
        <div class="stats">
          <div>Speed ${v.topSpeed}<div class="stat-bar"><div style="width:${v.topSpeed/3.3}%"></div></div></div>
          <div>Handling ${v.handling}<div class="stat-bar"><div style="width:${v.handling}%"></div></div></div>
          <div>Accel ${v.acceleration}s</div>
          <div>Off-road ${v.offroad}</div>
        </div>
        <button class="menu-btn primary" data-buy="${v.id}">BUY BIKE</button>
      </div>`).join('');
    this._dealIndex = 0;
    this.openPanel(dealer.name || 'BIKE DEALER', `<div class="dealer-hero"><strong>CHOOSE YOUR RIDE</strong><span>15 fictional power bikes • Sport • Hyper • Adventure</span></div><p style="color:#8aa;font-size:.8rem;margin-bottom:8px">← → browse · Enter select · B buy · T test drive · Esc exit</p>` + cards);
    this.$('ui-panels').querySelectorAll('[data-buy]').forEach(b => {
      b.onclick = () => {
        if (game.buyVehicle(b.dataset.buy)) this.closePanel();
      };
    });
    const prev = this.input.onMenuKey;
    this.input.onMenuKey = (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (e.code === 'ArrowRight' || e.code === 'ArrowDown') this._dealIndex = Math.min(stock.length - 1, (this._dealIndex || 0) + 1);
      if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') this._dealIndex = Math.max(0, (this._dealIndex || 0) - 1);
      const v = stock[this._dealIndex || 0];
      if (e.code === 'KeyB' || e.code === 'Enter') {
        if (v && game.buyVehicle(v.id)) this.closePanel();
        return;
      }
      if (e.code === 'KeyT' && v) {
        this.closePanel();
        this.toast('Test drive: ' + v.name + ' — 45s');
        game.startTestDrive(v);
      }
      if (prev) prev(e);
    };
  }

  openMarketplace(game) {
    const used = VEHICLES.slice(0, 8).map((v, i) => {
      const cond = 50 + ((i * 17) % 45);
      const miles = 8000 + i * 4300;
      const price = Math.round(v.price * 0.55 * (cond / 100));
      return { ...v, cond, miles, usedPrice: price };
    });
    const cards = used.map(v => `
      <div class="vehicle-card">
        <h3>${v.name} <em style="color:#c84">USED</em></h3>
        <div class="price">${game.economy.format(v.usedPrice)} · Cond ${v.cond}% · ${v.miles} km</div>
        <button class="menu-btn primary" data-used="${v.id}" data-price="${v.usedPrice}" data-cond="${v.cond}" data-miles="${v.miles}">BUY USED</button>
      </div>`).join('');
    this.openPanel('BIKE MARKETPLACE', cards);
    this.$('ui-panels').querySelectorAll('[data-used]').forEach(b => {
      b.onclick = () => {
        // Campaign Level 8 is specifically a marketplace objective. Keep the
        // same physical-location rule as normal vehicle purchases so opening
        // the pause/menu marketplace cannot bypass the mission.
        if (game.activeMission?.kind === 'campaign' && game.activeMission.campaignType === 'buy') {
          const p = game.controller?.mesh?.position;
          const market = LANDMARKS.find(x => x.id === 'market');
          if (!p || !market || Math.hypot(p.x - market.x, p.z - market.z) > 18) {
            this.toast('DRIVE TO THE BIKE MARKETPLACE FIRST');
            return;
          }
        }
        const base = getVehicleById(b.dataset.used);
        const price = +b.dataset.price;
        if (!base) { this.toast('Bike unavailable'); return; }
        if (game.state.player.level < base.requiredLevel) { this.toast(`Requires level ${base.requiredLevel}`); return; }
        if (game.state.garage.vehicles.length >= game.state.garage.capacity) { this.toast('Garage full — expand first'); return; }
        if (!game.economy.canAfford(price)) { this.toast('INSUFFICIENT FUNDS'); return; }
        game.economy.spend(price);
        const owned = cloneVehicle(base, {
          currentCondition: +b.dataset.cond,
          currentMileage: +b.dataset.miles,
          currentFuel: base.fuelCapacity * 0.6
        });
        game.state.garage.vehicles.push(owned);
        game.flags.purchased = true;
        game._spawnOwnedVehicles();
        if (game.activeMission?.kind === 'campaign' && game.activeMission.campaignType === 'buy') game._completeCampaignMission();
        else game.persist();
        this.toast('Purchased used ' + base.name);
        this.closePanel();
      };
    });
  }

  openJobs(game) {
    const current = game.getCampaignMission?.();
    const completed = new Set(game.state.player.campaignCompleted || []);
    const campaign = CAMPAIGN_MISSIONS.map(m => {
      const done = completed.has(m.level);
      const active = current?.level === m.level;
      const locked = !done && !active && m.level > (game.state.player.campaignLevel || 1);
      return `<div class="mission-card ${active?'campaign-active':''} ${done?'campaign-done':''}">
        <div class="mission-number">LEVEL ${m.level} ${done?'✓':locked?'🔒':''}</div>
        <h3>${m.title}</h3>
        <p><strong>DO THIS:</strong> ${m.objective}</p>
        <p class="mission-reward">🏆 REWARD: <b>${game.economy.format(m.reward)}</b> + <b>${m.xp} XP</b></p>
        ${active ? '<span class="mission-status">CURRENT MISSION</span>' : done ? '<span class="mission-status">COMPLETED</span>' : locked ? '<span class="mission-status">LOCKED — COMPLETE PREVIOUS LEVEL</span>' : ''}
      </div>`;
    }).join('');
    // The campaign level is the authoritative unlock pointer. A completed
    // level always exposes the next level instead of leaving the player stuck.
    const unlockedLevel = Math.min(CAMPAIGN_MISSIONS.length, Math.max(1, Number(game.state.player.campaignLevel) || 1));
    const campaignFinished = completed.has(CAMPAIGN_MISSIONS.length);
    const action = !game.activeMission && !campaignFinished
      ? `<button class="menu-btn primary" id="start-campaign-now">START LEVEL ${unlockedLevel}</button>`
      : (campaignFinished ? `<div class="mission-status">🏆 CAMPAIGN COMPLETE — ALL 20 LEVELS FINISHED</div>` : '');
    const jobs = POIS.jobs.map(j => `<div class="vehicle-card mission-card"><div class="mission-number">SIDE JOB</div><h3>${j.name}</h3><p>Ride to the gold marker and complete the job.</p><button class="menu-btn" data-job="${j.type}">START SIDE JOB</button></div>`).join('');
    const dc = game.getDailyChallengeStatus?.();
    const daily = dc ? `<div class="daily-challenge-card ${dc.completed?'daily-done':''}"><div class="daily-badge">DAILY LIVE</div><h2>🔥 ${dc.title}</h2><p><strong>DO THIS:</strong> ${dc.text}</p><div class="daily-progress">${dc.completed ? '✓ COMPLETE' : `${Math.min(dc.value, dc.target).toFixed(dc.id==='distance'||dc.id==='speed'?1:0)} / ${dc.target}`}</div><p class="mission-reward">REWARD: <b>${game.economy.format(dc.reward)}</b> + <b>${dc.xp} XP</b> • STREAK: <b>${dc.streak} DAYS</b></p></div>` : '';
    this.openPanel('RIDER MISSIONS', `${daily}<div class="mission-brief campaign-brief"><strong>RIDER CAREER — 20 LEVELS</strong><span>Complete the levels in order. Every level gives CASH + XP and unlocks the next one.</span>${action}</div><div class="campaign-list">${campaign}</div><h3 style="margin:20px 0 10px;color:#00d4ff">SIDE JOBS</h3>${jobs}`);
    this.$('start-campaign-now')?.addEventListener('click', () => {
      this.closePanel();
      if (!game.controller || game.mode !== 'driving') game.enterWorld(true, { startGrid: true });
      const started = game.startCampaignMission();
      if (!started) this.toast('Unable to start this campaign level. Make sure you are in a vehicle.');
    });
    this.$('ui-panels').querySelectorAll('[data-job]').forEach(b => {
      b.onclick = () => {
        const j = POIS.jobs.find(x => x.type === b.dataset.job);
        this.closePanel();
        if (!game.controller || game.mode !== 'driving') game.enterWorld(true, { startGrid: true });
        if (!game.startJob(j)) this.toast('Unable to start this job. Make sure you are in a vehicle.');
      };
    });
  }

  openRaces(game) {
    const cards = POIS.races.map(r => `
      <div class="vehicle-card">
        <h3>${r.name}</h3>
        <button class="menu-btn primary" data-race="${r.id}">START RACE</button>
      </div>`).join('');
    this.openPanel('RACES', cards);
    this.$('ui-panels').querySelectorAll('[data-race]').forEach(b => {
      b.onclick = () => {
        const r = POIS.races.find(x => x.id === b.dataset.race);
        this.closePanel();
        if (!game.controller || game.mode !== 'driving') game.enterWorld(true, { startGrid: true });
        if (!game.startRace(r)) this.toast('Unable to start this race. Make sure you are in a vehicle.');
      };
    });
  }

  openMap(game) {
    this._mapZoom = this._mapZoom || 0.72;
    const pos = game.mode === 'driving' && game.controller ? game.controller.mesh.position : game.playerMesh.position;
    const mission = game.activeMission;
    const route = game.activeRoute || [];
    const currentName = game.world.getDistrict(pos.x, pos.z).name;
    const mapColorNum = mission?.campaign?.level ? getCampaignColor(mission.campaign.level) : (mission?.kind === 'race' ? 0x00ff9d : mission?.kind === 'gps' ? 0x00d4ff : 0xffd34d);
    const missionColor = '#' + mapColorNum.toString(16).padStart(6,'0');
    const html = `
      <div class="city-map-wrap">
        <div class="city-map-info">
          <strong>YOU ARE HERE</strong><span>${currentName}</span>
          ${mission ? `<strong class="map-dest-label" style="color:${mission.campaign?.level ? missionColor : (mission.kind === 'race' ? '#00ff9d' : mission.kind === 'gps' ? '#00d4ff' : '#ffd34d')}">ACTIVE MISSION</strong><span>${mission.name || mission.dest?.name || 'Mission'}</span>` : '<span class="map-no-route">Choose a destination to reveal your route.</span>'}
        </div>
        <canvas id="city-map-canvas" width="900" height="650"></canvas>
        <div class="city-map-legend"><span>● YOU</span><span style="color:${missionColor}">◆ ACTIVE DESTINATION</span><span style="color:#00ff9d">━ RACE</span><span style="color:#00d4ff">━ GPS</span><span>□ LANDMARK</span></div>
        <div class="map-actions"><button class="menu-btn primary" id="map-set-dest">SET DESTINATION</button></div>
        <div id="map-destination-list" class="map-destination-list hidden">${LANDMARKS.map(l=>`<button class="menu-btn" data-map-dest="${l.id}">${l.name}</button>`).join('')}</div>
      </div>`;
    this.openPanel('NEON BIKE RIDE — LIVE GPS MAP', html);
    const canvas = this.$('city-map-canvas');
    const ctx = canvas.getContext('2d');
    const draw = () => {
      const w=canvas.width,h=canvas.height, zoom=this._mapZoom;
      ctx.clearRect(0,0,w,h); ctx.fillStyle='#08111a'; ctx.fillRect(0,0,w,h);
      const range=520/zoom; const sx=x=>w/2+(x-pos.x)*(w/(range*2)); const sy=z=>h/2+(z-pos.z)*(h/(range*2));
      ctx.strokeStyle='#253746'; ctx.lineWidth=8;
      for(let v=-400;v<=400;v+=80){ ctx.beginPath();ctx.moveTo(sx(v),sy(-420));ctx.lineTo(sx(v),sy(420));ctx.stroke(); ctx.beginPath();ctx.moveTo(sx(-420),sy(v));ctx.lineTo(sx(420),sy(v));ctx.stroke(); }
      ctx.strokeStyle='#52606d'; ctx.lineWidth=2;
      if(route.length>1){ ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.shadowColor=missionColor; ctx.shadowBlur=14; ctx.strokeStyle=missionColor; ctx.lineWidth=10; ctx.beginPath();route.forEach((p,i)=>i?ctx.lineTo(sx(p.x),sy(p.z)):ctx.moveTo(sx(p.x),sy(p.z)));ctx.stroke(); ctx.shadowBlur=0; ctx.strokeStyle='#ffffff';ctx.globalAlpha=.78;ctx.lineWidth=2;ctx.beginPath();route.forEach((p,i)=>i?ctx.lineTo(sx(p.x),sy(p.z)):ctx.moveTo(sx(p.x),sy(p.z)));ctx.stroke(); ctx.restore(); }
      LANDMARKS.forEach(l=>{ const x=sx(l.x),y=sy(l.z); if(x<-20||x>w+20||y<-20||y>h+20)return; ctx.fillStyle='#ffd34d';ctx.fillRect(x-4,y-4,8,8); ctx.font='12px sans-serif';ctx.fillStyle='#dce8f2';ctx.fillText(l.name,x+7,y-7); });
      ctx.fillStyle='#00ff9d';ctx.beginPath();ctx.arc(w/2,h/2,9,0,Math.PI*2);ctx.fill();
      if(mission?.dest){ const x=sx(mission.dest.x),y=sy(mission.dest.z); ctx.save();ctx.shadowColor=missionColor;ctx.shadowBlur=20;ctx.fillStyle=missionColor;ctx.beginPath();ctx.moveTo(x,y-15);ctx.lineTo(x+14,y);ctx.lineTo(x,y+15);ctx.lineTo(x-14,y);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.font='bold 14px sans-serif';ctx.fillStyle='#fff';ctx.fillText('MISSION: '+(mission.dest.name||mission.name||'DESTINATION'),x+18,y+5);ctx.restore(); }
    };
    draw();
    this.$('map-set-dest').onclick=()=>this.$('map-destination-list').classList.toggle('hidden');
    this.$('map-destination-list').querySelectorAll('[data-map-dest]').forEach(b=>b.onclick=()=>{ const l=LANDMARKS.find(x=>x.id===b.dataset.mapDest); if(l){ game.setGPSDestination(l); this.closePanel(); } });
    const prev=this.input.onMenuKey;
    this.input.onMenuKey=(e)=>{ if(e.code==='Equal'||e.code==='NumpadAdd'){this._mapZoom=Math.min(1.8,this._mapZoom+.1);draw();e.preventDefault();} if(e.code==='Minus'||e.code==='NumpadSubtract'){this._mapZoom=Math.max(.45,this._mapZoom-.1);draw();e.preventDefault();} if(e.code==='KeyM'){this.closePanel();e.preventDefault();return;} if(prev)prev(e); };
  }

  openMultiplayer(game) {
    const room = game.mp.room || '';
    this.openPanel('MULTIPLAYER RACE', `
      <p style="margin-bottom:12px;color:#9aa">Same keyboard, two browser tabs, or another device on PeerJS.</p>
      <button class="menu-btn primary" id="mp-local">LOCAL 2 PLAYER</button>
      <button class="menu-btn" id="mp-host">HOST ROOM</button>
      <div class="vehicle-card">
        <label>Join code
          <input id="mp-code" value="${room}" maxlength="8" style="margin:8px;padding:8px;background:#111;color:#fff;border:1px solid #456;letter-spacing:.2em;text-transform:uppercase;width:140px"/>
        </label>
        <button class="menu-btn primary" id="mp-join">JOIN ROOM</button>
      </div>
      <button class="menu-btn" id="mp-start">START MP RACE</button>
      <button class="menu-btn" id="mp-leave">LEAVE SESSION</button>
      <p id="mp-status" style="margin-top:12px;color:#00d4ff">${game.mp.active ? (game.mp.mode === 'local' ? 'Local 2P active' : 'Room ' + game.mp.room + ' · ' + game.mp.role) : 'Not connected'}</p>
      <p style="color:#8aa;font-size:.85rem;margin-top:8px">P1: WASD · P2: IJKL · U nitro · O handbrake<br/>Online: open two windows, Host in one, Join with the code in the other.</p>
    `);
    this.$('mp-local').onclick = () => {
      game.mp.startLocal();
      if (game.mode !== 'driving' && game.vehicleActors[0]) game.enterVehicle(game.vehicleActors[0]);
      this.toast('Player 2 spawned');
      this.closePanel();
    };
    this.$('mp-host').onclick = async () => {
      const code = await game.mp.hostRoom(this.$('mp-code').value || makeRoomCode());
      this.$('mp-code').value = code;
      this.$('mp-status').textContent = 'Hosting room ' + code + ' — share this code';
      this.toast('Room ' + code);
    };
    this.$('mp-join').onclick = async () => {
      try {
        await game.mp.joinRoom(this.$('mp-code').value);
        this.$('mp-status').textContent = 'Joined ' + game.mp.room;
        this.toast('Joined ' + game.mp.room);
      } catch (e) {
        this.toast(e.message || 'Join failed');
      }
    };
    this.$('mp-start').onclick = () => {
      if (game.mode !== 'driving' && game.vehicleActors[0]) game.enterVehicle(game.vehicleActors[0]);
      game.startRace({ id: 'multiplayer', name: 'Multiplayer Race', x: 10, z: 60 }, { multiplayer: true });
      this.closePanel();
    };
    this.$('mp-leave').onclick = () => {
      game.mp.end();
      this.toast('Left multiplayer');
      this.closePanel();
    };
  }

  openShop(game) {
    const shop = game.state.player.shop || { owned: [], equipped: {} };
    const owned = new Set(shop.owned || []);
    const cards = SHOP_ITEMS.map(item => {
      const isOwned = owned.has(item.id);
      const equipped = shop.equipped?.[item.slot] === item.id;
      return `<div class="vehicle-card shop-card"><div class="mission-number">${item.category}</div><h3>${item.name}</h3><div class="price">${item.price ? game.economy.format(item.price) : 'FREE'} · ${item.slot.toUpperCase()}</div><p style="color:#9aa;font-size:.82rem">Cosmetic item for David's on-foot appearance.</p><button class="menu-btn ${equipped?'primary':''}" data-shop="${item.id}">${equipped?'EQUIPPED':isOwned?'EQUIP':`BUY ${item.price ? game.economy.format(item.price) : 'FREE'}`}</button></div>`;
    }).join('');
    this.openPanel('RIDER SHOP', `<div class="dealer-hero"><strong>RIDER STYLE SHOP</strong><span>Outfits • Shoes • Hair • Accessories</span></div><p style="color:#8aa;font-size:.82rem;margin-bottom:10px">Buy once, keep forever. Cosmetic purchases never change race balance.</p><div class="shop-grid">${cards}</div>`);
    this.$('ui-panels').querySelectorAll('[data-shop]').forEach(b => b.onclick = () => { game.buyShopItem(b.dataset.shop); this.openShop(game); });
  }

  openRankings(game) {
    const r = getLocalRank(game); const score = getCareerScore(game);
    const render = (data) => {
      const rows = (data.drivers || []).map((x,i)=>`<div class="rank-row ${x.id===game._rankId?'rank-you':''}"><b>#${i+1}</b><span>${String(x.name).replace(/[<>&]/g,'')}</span><span>${Number(x.score||0).toLocaleString()} pts</span><small>LVL ${x.level||1}</small></div>`).join('');
      const title = data.online ? '🌍 GLOBAL LEADERBOARD' : '📱 LOCAL OFFLINE RANKING';
      this.openPanel('GLOBAL RANKINGS', `<div class="rank-hero"><strong>${data.tier || getRankTier(score)}</strong><span>Career Score ${score.toLocaleString()} · Your position #${data.position || r.position}</span></div><div class="rank-note">${title} · ${data.online ? 'Your score is synced to the published NEON BIKE RIDE leaderboard.' : 'Internet is unavailable, so your career remains fully playable and your ranking is stored privately on this device.'}</div><h3 style="margin:16px 0 8px;color:#00d4ff">TOP RIDERS</h3><div class="rank-list">${rows || '<p>No rankings yet.</p>'}</div>`);
    };
    // Show instantly, then replace with the live global board when online.
    render({ ...r, online:false });
    syncGlobalRank(game).then(render).catch(()=>{});
  }

  openAchievements(game) {
    const u = game.state.achievements || {};
    const html = ACHIEVEMENT_DEFS.map(a => `
      <div class="vehicle-card" style="opacity:${u[a.id] ? 1 : 0.45}">
        <h3>${u[a.id] ? '✓ ' : ''}${a.name}</h3>
        <p style="color:#9aa;font-size:.85rem">${a.desc}</p>
      </div>`).join('');
    this.openPanel('ACHIEVEMENTS', html);
  }

  openProfile(game) {
    const p = game.state.player;
    const prog = xpProgress(p.xp);
    this.openPanel('PROFILE', `
      <h3>${this._esc(p.name)}</h3>
      <p>Level ${p.level} — ${levelName(p.level)}</p>
      <p>XP ${p.xp} (${prog.toNext} to next)</p>
      <p>Money ${game.economy.format()}</p>
      <p>Bikes ${game.state.garage.vehicles.length}/${game.state.garage.capacity}</p>
      <p>Jobs ${p.jobsCompleted} · Races won ${p.racesWon}</p>
      <p>Distance ${p.distanceDriven.toFixed(1)} km</p>
      <label>Change name <input id="rename" value="${this._esc(p.name)}" style="margin:8px;padding:6px;background:#111;color:#fff;border:1px solid #456"/></label>
      <button class="menu-btn" id="save-name">SAVE NAME</button>
    `);
    this.$('save-name').onclick = () => {
      p.name = this.$('rename').value || p.name;
      game.persist();
      this.toast('Name saved');
    };
  }

  openSettings(game) {
    const s = Settings.data;
    this.openPanel('SETTINGS', `
      <div class="vehicle-card">Graphics
        <select id="set-gfx">${['low','medium','high','ultra'].map(q => `<option ${s.graphics===q?'selected':''}>${q}</option>`).join('')}</select>
      </div>
      <div class="vehicle-card">Sound <input type="range" id="set-sfx" min="0" max="1" step="0.05" value="${s.soundVolume}"></div>
      <div class="vehicle-card">Music <input type="range" id="set-mus" min="0" max="1" step="0.05" value="${s.musicVolume}">
        <label><input type="checkbox" id="set-muson" ${s.musicOn?'checked':''}> On</label>
      </div>
      <div class="vehicle-card">Weather
        <button class="menu-btn" data-w="clear">CLEAR</button>
        <button class="menu-btn" data-w="cloudy">CLOUDY</button>
        <button class="menu-btn" data-w="rain">RAIN</button>
      </div>
      <h3 style="margin:16px 0 8px;color:#00d4ff">CONTROLS</h3>
      <p style="color:#8aa;font-size:.8rem">Click a bind, then press a key. Saved in LocalStorage.</p>
      <div id="bind-list"></div>
      <button class="menu-btn" id="reset-binds">RESET DEFAULT BINDS</button>
    `);
    const renderBinds = () => {
      const box = this.$('bind-list');
      const actions = Object.keys(DEFAULT_BINDS);
      box.innerHTML = actions.map(a => `
        <div class="vehicle-card" style="display:flex;justify-content:space-between;align-items:center">
          <span>${a.toUpperCase()}</span>
          <button class="menu-btn" data-bind="${a}">${(this.input.binds[a] || []).map(codeLabel).join(' / ')}</button>
        </div>`).join('');
      box.querySelectorAll('[data-bind]').forEach(b => {
        b.onclick = () => {
          b.textContent = 'Press a key…';
          this.input.onRemap = () => { this.input.onRemap = null; renderBinds(); };
          this.input.beginRemap(b.dataset.bind);
        };
      });
    };
    renderBinds();
    this.$('reset-binds').onclick = () => { this.input.resetBinds(); renderBinds(); this.toast('Binds reset'); };
    this.$('set-gfx').onchange = (e) => { Settings.set('graphics', e.target.value); if (game) Settings.applyGraphics(game.renderer, game.scene); };
    this.$('set-sfx').oninput = (e) => { Settings.set('soundVolume', +e.target.value); game?.audio.setVolumes(Settings.get('soundVolume'), Settings.get('musicVolume'), Settings.get('musicOn')); };
    this.$('set-mus').oninput = (e) => { Settings.set('musicVolume', +e.target.value); game?.audio.setVolumes(Settings.get('soundVolume'), Settings.get('musicVolume'), Settings.get('musicOn')); };
    this.$('set-muson').onchange = (e) => { Settings.set('musicOn', e.target.checked); game?.audio.setVolumes(Settings.get('soundVolume'), Settings.get('musicVolume'), Settings.get('musicOn')); };
    this.$('ui-panels').querySelectorAll('[data-w]').forEach(b => b.onclick = () => {
      if (!game) { this.toast('Start a game before changing weather'); return; }
      game.setWeather(b.dataset.w);
    });
  }

  openHowTo() {
    this.openPanel('HOW TO PLAY', `
      <p><strong>Start cash:</strong> every new rider begins with <b>$30,000</b>.</p>
      <p><strong>Ride:</strong> W/↑ accelerate, S/↓ brake, A/D or ←/→ steer, Shift = Nitro, C = camera, M = map, G = garage, P/Esc = pause.</p>
      <p><strong>Mission box:</strong> the square mission panel tells you the current mission, what to do, reward, distance and next mission.</p>
      <p><strong>Tracker:</strong> follow the neon arrow and the large GPS minimap to reach checkpoints and destinations.</p>
      <p><strong>Progress:</strong> finish the current mission to unlock the next mission. Missions pay cash and XP.</p>
      <p><strong>Garage:</strong> buy, ride, paint and upgrade fictional power bikes only.</p>
      <p><strong>Mobile:</strong> use the on-screen accelerate, brake, steer, nitro, camera and pause buttons.</p>
    `);
  }

  openCredits() {
    this.openPanel('CREDITS', `
      <p><strong>NEON BIKE RIDE</strong></p>
      <p>Original open-world superbike mission game.</p>
      <p>Built with Three.js, WebGL, Web Audio and LocalStorage.</p>
      <p>Fictional bikes, riders and neon route regions.</p>
      <p>No copyrighted brands or music.</p>
    `);
  }
}





/* ============================================================
   NEON BIKE RIDE - HOW TO PLAY MENU
   ============================================================ */
(function(){
  "use strict";
  function install(){
    if(document.getElementById("cityDriveHowToPlay")) return;

    const style=document.createElement("style");
    style.id="cityDriveHowToPlayStyle";
    style.textContent=`
      #cityDriveHowToPlay{position:fixed;inset:0;z-index:99999;display:none;
        align-items:center;justify-content:center;background:rgba(0,0,0,.78);
        font-family:Arial,sans-serif;padding:20px;box-sizing:border-box}
      #cityDriveHowToPlay .cdhtp-box{width:min(680px,96vw);max-height:88vh;overflow:auto;
        background:#111923;border:2px solid rgba(255,255,255,.2);border-radius:18px;
        padding:28px;color:#fff;box-shadow:0 20px 60px rgba(0,0,0,.55)}
      #cityDriveHowToPlay h2{margin:0 0 18px;font-size:30px}
      #cityDriveHowToPlay .cdhtp-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      #cityDriveHowToPlay .cdhtp-item{padding:12px 14px;background:rgba(255,255,255,.08);
        border-radius:10px}
      #cityDriveHowToPlay kbd{display:inline-block;padding:3px 8px;border-radius:6px;
        background:#fff;color:#111;font-weight:700;margin-right:5px}
      #cityDriveHowToPlay .cdhtp-close{margin-top:20px;width:100%;padding:13px;border:0;
        border-radius:10px;font-size:16px;font-weight:700;cursor:pointer}
      @media(max-width:560px){#cityDriveHowToPlay .cdhtp-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);

    const modal=document.createElement("div");
    modal.id="cityDriveHowToPlay";
    modal.innerHTML=`
      <div class="cdhtp-box" role="dialog" aria-modal="true" aria-label="How to Play">
        <h2>🏁 How to Play</h2>
        <div class="cdhtp-grid">
          <div class="cdhtp-item"><kbd>W</kbd><kbd>↑</kbd> Accelerate</div>
          <div class="cdhtp-item"><kbd>S</kbd><kbd>↓</kbd> Brake / Reverse</div>
          <div class="cdhtp-item"><kbd>A</kbd><kbd>←</kbd> Turn Left</div>
          <div class="cdhtp-item"><kbd>D</kbd><kbd>→</kbd> Turn Right</div>
          <div class="cdhtp-item"><kbd>SPACE</kbd> Handbrake / Drift</div>
          <div class="cdhtp-item"><kbd>SPACE</kbd> + <kbd>A/D</kbd> Sharp 360° Spin</div>
        </div>
        <div class="cdhtp-item" style="margin-top:10px">
          <strong>🎮 Goal:</strong> Drive through the city, complete missions and checkpoints,
          earn rewards, unlock bikes and improve your riding skills.
        </div>
        <div class="cdhtp-item" style="margin-top:10px">
          <strong>💡 Tip:</strong> Start on the open road, build speed, then use the handbrake
          with left or right steering for sharp turns and spins.
        </div>
        <button class="cdhtp-close" type="button">BACK TO MENU</button>
      </div>`;
    document.body.appendChild(modal);

    const close=()=>modal.style.display="none";
    modal.querySelector(".cdhtp-close").addEventListener("click",close);
    modal.addEventListener("click",e=>{if(e.target===modal)close();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});

    // Add a How To Play button to common menu containers.
    const candidates=[
      "#mainMenu",".main-menu","#menu",".menu",".menu-buttons",
      "#startMenu",".start-menu",".menu-container"
    ];
    let container=null;
    for(const s of candidates){
      container=document.querySelector(s);
      if(container) break;
    }
    if(!container) return;

    const btn=document.createElement("button");
    btn.type="button";
    btn.id="cityDriveHowToPlayBtn";
    btn.textContent="HOW TO PLAY";
    btn.style.cssText="margin:8px;padding:12px 22px;border-radius:10px;border:0;cursor:pointer;font-weight:700;font-size:15px;";
    btn.addEventListener("click",()=>modal.style.display="flex");
    container.appendChild(btn);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(install,300));
  else setTimeout(install,300);
})();


/* Street-car UI data source */
window.CityDriveStreetCarOptions=function(){
 const C=window.CityDriveRealStreetCars;
 return C?Object.entries(C.catalog).map(([id,s])=>({id,...s})):[]; 
};
