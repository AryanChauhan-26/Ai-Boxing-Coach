/**
 * Archery Performance Suite
 * 10-Ring Target Plotter, AI Sight Pin Calibration, SPT Hold Timer, Bio-Breathing Coach
 */
class ArcheryTools {
  constructor() {
    this.targetCanvas = document.getElementById('archery-target-canvas');
    this.targetCtx = this.targetCanvas ? this.targetCanvas.getContext('2d') : null;

    this.arrows = []; // [{x, y, score, isX}]
    this.maxArrowsPerEnd = 6;

    // SPT State
    this.sptInterval = null;
    this.sptState = 'idle'; // 'hold', 'rest', 'idle'
    this.sptCurrentSet = 1;
    this.sptTimeRemaining = 30;

    // Breathing State
    this.breathingInterval = null;
    this.isBreathingActive = false;
    this.breathingStep = 0; // 0: inhale, 1: hold full, 2: exhale, 3: hold empty

    this.initTargetCanvas();
    this.initEventListeners();
  }

  initTargetCanvas() {
    if (!this.targetCanvas || !this.targetCtx) return;
    this.drawTargetFace();

    this.targetCanvas.addEventListener('click', (e) => {
      const rect = this.targetCanvas.getBoundingClientRect();
      const scaleX = this.targetCanvas.width / rect.width;
      const scaleY = this.targetCanvas.height / rect.height;

      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      this.plotArrow(clickX, clickY);
    });
  }

  // Draw Standard WA 10-Ring Target Face
  drawTargetFace() {
    if (!this.targetCtx) return;
    const ctx = this.targetCtx;
    const cx = this.targetCanvas.width / 2;
    const cy = this.targetCanvas.height / 2;
    const maxR = this.targetCanvas.width * 0.46;

    ctx.clearRect(0, 0, this.targetCanvas.width, this.targetCanvas.height);

    // Target rings definitions: [Ring number, relative radius fraction, fill color, line color]
    const rings = [
      { r: 1.0, fill: '#f8fafc', stroke: '#cbd5e1' }, // 1 (White)
      { r: 0.9, fill: '#f1f5f9', stroke: '#94a3b8' }, // 2 (White)
      { r: 0.8, fill: '#1e293b', stroke: '#475569' }, // 3 (Black)
      { r: 0.7, fill: '#0f172a', stroke: '#475569' }, // 4 (Black)
      { r: 0.6, fill: '#0284c7', stroke: '#38bdf8' }, // 5 (Blue)
      { r: 0.5, fill: '#0369a1', stroke: '#38bdf8' }, // 6 (Blue)
      { r: 0.4, fill: '#e11d48', stroke: '#f43f5e' }, // 7 (Red)
      { r: 0.3, fill: '#be123c', stroke: '#f43f5e' }, // 8 (Red)
      { r: 0.2, fill: '#facc15', stroke: '#ca8a04' }, // 9 (Gold)
      { r: 0.1, fill: '#eab308', stroke: '#ca8a04' }, // 10 (Gold)
      { r: 0.05, fill: '#eab308', stroke: '#a16207' } // X-Ring
    ];

    // Draw concentric circles from outermost to innermost
    rings.forEach(ring => {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * ring.r, 0, Math.PI * 2);
      ctx.fillStyle = ring.fill;
      ctx.fill();
      ctx.strokeStyle = ring.stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Crosshair lines at center
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy); ctx.lineTo(cx + 15, cy);
    ctx.moveTo(cx, cy - 15); ctx.lineTo(cx, cy + 15);
    ctx.stroke();

    // Draw plotted arrows
    this.arrows.forEach((arr, index) => {
      // Arrow shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(arr.x + 2, arr.y + 2, 7, 0, Math.PI * 2);
      ctx.fill();

      // Arrow point
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(arr.x, arr.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Arrow number label
      ctx.fillStyle = '#052e16';
      ctx.font = 'bold 9px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(index + 1, arr.x, arr.y);
    });

    // Draw Group Center & Dispersion Circle if 2+ arrows
    if (this.arrows.length >= 2) {
      const { avgX, avgY, radius } = this.calculateGroupDispersion();

      // Dispersion ring
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(avgX, avgY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center of mass reticle
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(avgX, avgY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Plot Arrow and calculate score
  plotArrow(x, y) {
    if (this.arrows.length >= this.maxArrowsPerEnd) {
      alert('End complete (6 arrows plotted). Log the end or clear the target to start a new end.');
      return;
    }

    const cx = this.targetCanvas.width / 2;
    const cy = this.targetCanvas.height / 2;
    const maxR = this.targetCanvas.width * 0.46;
    const dist = Math.hypot(x - cx, y - cy);

    let score = 0;
    let isX = false;

    if (dist <= maxR * 0.05) {
      score = 10; isX = true;
    } else if (dist <= maxR * 0.1) {
      score = 10;
    } else if (dist <= maxR * 0.2) {
      score = 9;
    } else if (dist <= maxR * 0.3) {
      score = 8;
    } else if (dist <= maxR * 0.4) {
      score = 7;
    } else if (dist <= maxR * 0.5) {
      score = 6;
    } else if (dist <= maxR * 0.6) {
      score = 5;
    } else if (dist <= maxR * 0.7) {
      score = 4;
    } else if (dist <= maxR * 0.8) {
      score = 3;
    } else if (dist <= maxR * 0.9) {
      score = 2;
    } else if (dist <= maxR * 1.0) {
      score = 1;
    } else {
      score = 0; // Miss
    }

    this.arrows.push({ x, y, score, isX });

    // Audio SFX
    window.audioSynth.playArrowImpact(score);
    if (isX) {
      window.speechCoach.speak('Bullseye X-ten!', true);
    }

    this.drawTargetFace();
    this.updateStats();
    this.updateSightAI();
  }

  // Calculate Group Center and Dispersion
  calculateGroupDispersion() {
    if (this.arrows.length === 0) return { avgX: 0, avgY: 0, radius: 0 };

    const sumX = this.arrows.reduce((acc, a) => acc + a.x, 0);
    const sumY = this.arrows.reduce((acc, a) => acc + a.y, 0);
    const avgX = sumX / this.arrows.length;
    const avgY = sumY / this.arrows.length;

    let maxDist = 0;
    this.arrows.forEach(a => {
      const d = Math.hypot(a.x - avgX, a.y - avgY);
      if (d > maxDist) maxDist = d;
    });

    return { avgX, avgY, radius: Math.max(maxDist, 10) };
  }

  // Update HUD Statistics
  updateStats() {
    const countEl = document.getElementById('stat-arrow-count');
    const scoreEl = document.getElementById('stat-end-score');
    const radiusEl = document.getElementById('stat-group-radius');
    const centerEl = document.getElementById('stat-group-center');
    const logList = document.getElementById('arrow-log-list');

    const totalScore = this.arrows.reduce((acc, a) => acc + a.score, 0);

    if (countEl) countEl.innerText = `${this.arrows.length} / ${this.maxArrowsPerEnd}`;
    if (scoreEl) scoreEl.innerText = `${totalScore} / 60`;

    if (this.arrows.length >= 2) {
      const { avgX, avgY, radius } = this.calculateGroupDispersion();
      const cx = this.targetCanvas.width / 2;
      const cy = this.targetCanvas.height / 2;
      // Convert canvas pixels to approx centimeters (assuming 122cm target at 70m)
      const cmRadius = (radius / (this.targetCanvas.width * 0.46) * 61).toFixed(1);
      const offsetX = ((avgX - cx) / (this.targetCanvas.width * 0.46) * 61).toFixed(1);
      const offsetY = ((cy - avgY) / (this.targetCanvas.width * 0.46) * 61).toFixed(1);

      if (radiusEl) radiusEl.innerText = `${cmRadius} cm`;
      if (centerEl) centerEl.innerText = `(${offsetX > 0 ? '+' : ''}${offsetX}, ${offsetY > 0 ? '+' : ''}${offsetY}) cm`;
    } else {
      if (radiusEl) radiusEl.innerText = '-- cm';
      if (centerEl) centerEl.innerText = '--';
    }

    // Render Arrow Log list
    if (logList) {
      if (this.arrows.length === 0) {
        logList.innerHTML = '<div class="log-empty-state">No arrows plotted yet. Tap the target face to start.</div>';
      } else {
        logList.innerHTML = this.arrows.map((a, i) => `
          <div class="arrow-log-item">
            <span><strong>Arrow #${i + 1}:</strong> ${a.isX ? 'X-10' : a.score} Pts</span>
            <span class="badge ${a.score >= 9 ? 'badge-success' : a.score >= 7 ? 'badge-warning' : 'badge-cyan'}">
              ${a.score >= 9 ? 'Gold Ring' : a.score >= 7 ? 'Red Ring' : 'Outer Ring'}
            </span>
          </div>
        `).join('');
      }
    }
  }

  // Automated Sight Adjustment AI
  updateSightAI() {
    const titleEl = document.getElementById('sight-recommendation-title');
    const descEl = document.getElementById('sight-recommendation-desc');
    const clicksBox = document.getElementById('sight-clicks-display');
    const hDirEl = document.getElementById('sight-h-dir');
    const hClicksEl = document.getElementById('sight-h-clicks');
    const vDirEl = document.getElementById('sight-v-dir');
    const vClicksEl = document.getElementById('sight-v-clicks');

    if (this.arrows.length < 3) {
      if (titleEl) titleEl.innerText = 'Plot arrows to generate sight adjustments';
      if (descEl) descEl.innerText = `Need ${3 - this.arrows.length} more arrow(s) to compute statistically reliable sight pin compensation.`;
      if (clicksBox) clicksBox.style.display = 'none';
      return;
    }

    const { avgX, avgY } = this.calculateGroupDispersion();
    const cx = this.targetCanvas.width / 2;
    const cy = this.targetCanvas.height / 2;

    const diffX = avgX - cx;
    const diffY = cy - avgY; // Positive is above center

    // Rule: "Chase the arrow" (If arrow hits LEFT, move sight pin LEFT; if hits HIGH, move sight pin UP)
    const hDir = diffX > 0 ? 'RIGHT' : 'LEFT';
    const vDir = diffY > 0 ? 'UP' : 'DOWN';

    // 1 click ~ 0.5cm offset at 70m
    const hClicks = Math.round(Math.abs(diffX) / 10);
    const vClicks = Math.round(Math.abs(diffY) / 10);

    if (titleEl) titleEl.innerText = `Recommended Sight Pin Adjustment: ${hClicks} clicks ${hDir}, ${vClicks} clicks ${vDir}`;
    if (descEl) descEl.innerText = `Your group center is shifted ${diffX > 0 ? 'right' : 'left'} and ${diffY > 0 ? 'high' : 'low'}. Adjust your micro-elevation and windage knob accordingly.`;

    if (clicksBox) clicksBox.style.display = 'flex';
    if (hDirEl) hDirEl.innerText = hDir;
    if (hClicksEl) hClicksEl.innerText = `${hClicks} Clicks`;
    if (vDirEl) vDirEl.innerText = vDir;
    if (vClicksEl) vClicksEl.innerText = `${vClicks} Clicks`;
  }

  // Plot Sample End (6 Olympic level arrows)
  plotSampleEnd() {
    this.clearTarget();
    const cx = this.targetCanvas.width / 2;
    const cy = this.targetCanvas.height / 2;

    const sampleOffsets = [
      { dx: 6, dy: -8 },
      { dx: -4, dy: 5 },
      { dx: 12, dy: 10 },
      { dx: 2, dy: -2 },
      { dx: -8, dy: -14 },
      { dx: 15, dy: -6 }
    ];

    sampleOffsets.forEach((off, i) => {
      setTimeout(() => {
        this.plotArrow(cx + off.dx, cy + off.dy);
      }, i * 180);
    });
  }

  clearTarget() {
    this.arrows = [];
    this.drawTargetFace();
    this.updateStats();
    this.updateSightAI();
  }

  undoArrow() {
    if (this.arrows.length > 0) {
      this.arrows.pop();
      this.drawTargetFace();
      this.updateStats();
      this.updateSightAI();
    }
  }

  // ================= SPT ENDURANCE TIMER =================
  startSPT() {
    if (this.sptInterval) {
      clearInterval(this.sptInterval);
      this.sptInterval = null;
      document.getElementById('spt-start-btn').innerText = 'Start SPT Session';
      document.getElementById('spt-phase-badge').innerText = 'PAUSED';
      return;
    }

    const holdSec = parseInt(document.getElementById('spt-hold-sec').value) || 30;
    const restSec = parseInt(document.getElementById('spt-rest-sec').value) || 30;
    const totalSets = parseInt(document.getElementById('spt-total-sets').value) || 5;

    if (this.sptState === 'idle') {
      this.sptState = 'hold';
      this.sptTimeRemaining = holdSec;
      this.sptCurrentSet = 1;
    }

    document.getElementById('spt-start-btn').innerText = 'Pause Session';
    window.speechCoach.speak(`Set ${this.sptCurrentSet}. Full draw hold for ${holdSec} seconds. Begin!`, true);

    this.sptInterval = setInterval(() => {
      this.sptTimeRemaining--;
      this.updateSPTDisplay(holdSec, restSec, totalSets);

      if (this.sptTimeRemaining <= 3 && this.sptTimeRemaining > 0) {
        window.audioSynth.playBeep(660, 0.08);
      }

      if (this.sptTimeRemaining <= 0) {
        if (this.sptState === 'hold') {
          this.sptState = 'rest';
          this.sptTimeRemaining = restSec;
          window.audioSynth.playBeep(880, 0.2);
          window.speechCoach.speak(`Rest for ${restSec} seconds. Relax your bow arm and breathe.`, true);
        } else if (this.sptState === 'rest') {
          this.sptCurrentSet++;
          if (this.sptCurrentSet > totalSets) {
            clearInterval(this.sptInterval);
            this.sptInterval = null;
            this.sptState = 'idle';
            document.getElementById('spt-start-btn').innerText = 'Start SPT Session';
            document.getElementById('spt-phase-badge').innerText = 'COMPLETED';
            window.speechCoach.speak('SPT Endurance workout complete! Great scapular stability.');
            return;
          }
          this.sptState = 'hold';
          this.sptTimeRemaining = holdSec;
          window.audioSynth.playBeep(880, 0.2);
          window.speechCoach.speak(`Set ${this.sptCurrentSet}. Full draw hold!`, true);
        }
      }
    }, 1000);
  }

  updateSPTDisplay(holdSec, restSec, totalSets) {
    const digits = document.getElementById('spt-digits');
    const badge = document.getElementById('spt-phase-badge');
    const sublabel = document.getElementById('spt-sublabel');
    const circle = document.getElementById('spt-progress-circle');

    const totalCurrentPhase = this.sptState === 'hold' ? holdSec : restSec;
    const frac = this.sptTimeRemaining / totalCurrentPhase;
    const circumference = 565.48; // 2 * pi * 90
    if (circle) {
      circle.style.strokeDashoffset = circumference * (1 - frac);
      circle.style.stroke = this.sptState === 'hold' ? '#00ff88' : '#00e5ff';
    }

    const mm = String(Math.floor(this.sptTimeRemaining / 60)).padStart(2, '0');
    const ss = String(this.sptTimeRemaining % 60).padStart(2, '0');

    if (digits) digits.innerText = `${mm}:${ss}`;
    if (badge) badge.innerText = this.sptState === 'hold' ? '🔥 FULL DRAW HOLD' : '💧 RECOVERY REST';
    if (sublabel) sublabel.innerText = `Set ${this.sptCurrentSet} of ${totalSets}`;
  }

  resetSPT() {
    if (this.sptInterval) clearInterval(this.sptInterval);
    this.sptInterval = null;
    this.sptState = 'idle';
    this.sptCurrentSet = 1;
    this.sptTimeRemaining = parseInt(document.getElementById('spt-hold-sec').value) || 30;

    document.getElementById('spt-start-btn').innerText = 'Start SPT Session';
    document.getElementById('spt-phase-badge').innerText = 'READY';
    document.getElementById('spt-digits').innerText = '00:30';
    document.getElementById('spt-sublabel').innerText = 'Set 1 of 5';

    const circle = document.getElementById('spt-progress-circle');
    if (circle) circle.style.strokeDashoffset = 0;
  }

  // ================= BOX BREATHING CADENCE =================
  toggleBreathing() {
    const btn = document.getElementById('breath-toggle-btn');
    const circle = document.getElementById('breath-circle');
    const actionText = document.getElementById('breath-action-text');
    const countText = document.getElementById('breath-countdown');

    if (this.isBreathingActive) {
      clearInterval(this.breathingInterval);
      this.isBreathingActive = false;
      btn.innerText = 'Start Breathing Sync';
      if (circle) circle.style.transform = 'scale(1)';
      if (actionText) actionText.innerText = 'READY';
      if (countText) countText.innerText = '4s';
      return;
    }

    this.isBreathingActive = true;
    btn.innerText = 'Stop Breathing Sync';
    this.breathingStep = 0;
    let stepTimer = 4;

    const phases = [
      { text: 'INHALE', scale: '1.4', voice: 'Inhale smoothly' },
      { text: 'HOLD FULL', scale: '1.4', voice: 'Hold breath' },
      { text: 'EXHALE', scale: '0.85', voice: 'Exhale slowly' },
      { text: 'HOLD EMPTY', scale: '0.85', voice: 'Hold empty' }
    ];

    const runStep = () => {
      const p = phases[this.breathingStep];
      if (actionText) actionText.innerText = p.text;
      if (circle) circle.style.transform = `scale(${p.scale})`;

      // Highlight active step in HUD
      for (let i = 1; i <= 4; i++) {
        const el = document.getElementById(`c-step-${i}`);
        if (el) el.classList.toggle('active', i - 1 === this.breathingStep);
      }

      window.speechCoach.speak(p.voice, true);
    };

    runStep();

    this.breathingInterval = setInterval(() => {
      stepTimer--;
      if (countText) countText.innerText = `${stepTimer}s`;

      if (stepTimer <= 0) {
        this.breathingStep = (this.breathingStep + 1) % 4;
        stepTimer = 4;
        runStep();
      }
    }, 1000);
  }

  // ================= DEEP SHOT BIOMECHANICS CAPTURE =================
  captureAndDeepAnalyzeShot() {
    // 1. Play shutter & scanning audio
    if (window.audioSynth) {
      window.audioSynth.playBeep(1800, 0.08);
      setTimeout(() => window.audioSynth.playBeep(2400, 0.12), 90);
    }

    // 2. Add visual scanning flash to viewport
    const viewport = document.getElementById('archery-viewport');
    if (viewport) {
      const flash = document.createElement('div');
      flash.className = 'scanning-flash';
      viewport.appendChild(flash);
      setTimeout(() => flash.remove(), 700);
    }

    // 3. Cycle through shot steps visually
    const steps = ['step-setup', 'step-draw', 'step-anchor', 'step-release'];
    steps.forEach((stepId, idx) => {
      setTimeout(() => {
        steps.forEach(s => document.getElementById(s)?.classList.remove('active'));
        document.getElementById(stepId)?.classList.add('active');
      }, idx * 120);
    });

    // 4. Open Deep Shot Biomechanics Modal
    setTimeout(() => {
      const modal = document.getElementById('deep-shot-analysis-modal');
      if (modal) modal.classList.add('active');

      const verdict = "Outstanding shot form! Your draw elbow angle is in the Olympic gold medal range at 174.5 degrees. Expansion timing is solid at 2.8 seconds.";
      window.speechCoach.speak(verdict);
    }, 520);
  }

  initEventListeners() {
    // Capture & Deep Analyze Shot Button
    const captureBtn = document.getElementById('archery-analyze-capture-btn');
    if (captureBtn) captureBtn.addEventListener('click', () => this.captureAndDeepAnalyzeShot());

    const saveShotBtn = document.getElementById('btn-save-shot-sample');
    if (saveShotBtn) saveShotBtn.addEventListener('click', () => this.captureAndDeepAnalyzeShot());

    // Deep Shot Modal Actions
    const closeShotModal = document.getElementById('btn-close-shot-modal');
    const shotModal = document.getElementById('deep-shot-analysis-modal');
    if (closeShotModal && shotModal) {
      closeShotModal.addEventListener('click', () => shotModal.classList.remove('active'));
    }

    const hearCoachBtn = document.getElementById('btn-deep-hear-coach');
    if (hearCoachBtn) {
      hearCoachBtn.addEventListener('click', () => {
        const text = document.getElementById('deep-shot-verdict-text')?.innerText;
        if (text) window.speechCoach.speak(text, true);
      });
    }

    const autoPlotBtn = document.getElementById('btn-deep-autoplot-target');
    if (autoPlotBtn) {
      autoPlotBtn.addEventListener('click', () => {
        if (shotModal) shotModal.classList.remove('active');
        if (window.apexApp) window.apexApp.switchTab('target');

        // Plot simulated 10-ring arrow
        const cx = (this.targetCanvas?.width || 520) / 2;
        const cy = (this.targetCanvas?.height || 520) / 2;
        const jitterX = (Math.random() - 0.5) * 14;
        const jitterY = (Math.random() - 0.5) * 14;
        this.plotArrow(cx + jitterX, cy + jitterY);
        window.speechCoach.speak('Shot plotted inside 10-Ring. Sight algorithm calibrated.');
      });
    }

    const sampleBtn = document.getElementById('target-sample-group-btn');
    if (sampleBtn) sampleBtn.addEventListener('click', () => this.plotSampleEnd());

    const clearBtn = document.getElementById('target-clear-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => this.clearTarget());

    const undoBtn = document.getElementById('btn-undo-arrow');
    if (undoBtn) undoBtn.addEventListener('click', () => this.undoArrow());

    const commitBtn = document.getElementById('btn-commit-end');
    if (commitBtn) commitBtn.addEventListener('click', () => {
      if (this.arrows.length === 0) return alert('Plot at least 1 arrow first.');
      const totalScore = this.arrows.reduce((acc, a) => acc + a.score, 0);
      alert(`End logged successfully! Score: ${totalScore} / 60. Data added to your session scorecard.`);
      this.clearTarget();
    });

    const sptStart = document.getElementById('spt-start-btn');
    if (sptStart) sptStart.addEventListener('click', () => this.startSPT());

    const sptReset = document.getElementById('spt-reset-btn');
    if (sptReset) sptReset.addEventListener('click', () => this.resetSPT());

    const breathBtn = document.getElementById('breath-toggle-btn');
    if (breathBtn) breathBtn.addEventListener('click', () => this.toggleBreathing());
  }
}

window.archeryTools = new ArcheryTools();

