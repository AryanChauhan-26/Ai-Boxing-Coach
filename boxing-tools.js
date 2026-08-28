/**
 * Boxing Performance Suite
 * Championship Round Timer, AI Voice Combo Caller, Reflex & Reaction Lab
 */
class BoxingTools {
  constructor() {
    // Round Timer State
    this.roundDuration = 180; // 3 min
    this.restDuration = 60;   // 1 min
    this.totalRounds = 12;
    this.currentRound = 1;
    this.timerState = 'idle'; // 'round', 'rest', 'paused', 'idle'
    this.timeRemaining = 180;
    this.roundInterval = null;

    // Combo Caller State
    this.comboInterval = null;
    this.isComboCallerActive = false;

    // Reaction Reflex Minigame State
    this.reflexState = 'idle'; // 'idle', 'waiting', 'active', 'early'
    this.reflexStartTime = 0;
    this.reflexTimeout = null;
    this.reflexHistory = [];

    this.initEventListeners();
    this.initReflexPad();
  }

  // ================= CHAMPIONSHIP ROUND TIMER =================
  startRoundTimer() {
    if (this.timerState === 'round' || this.timerState === 'rest') {
      this.pauseRoundTimer();
      return;
    }

    if (this.timerState === 'idle') {
      this.currentRound = 1;
      this.timeRemaining = this.roundDuration;
    }

    this.timerState = 'round';
    this.updateTimerUI();

    // Play Bell & AI Announcement
    window.audioSynth.playBoxingBell();
    window.speechCoach.speak(`Round ${this.currentRound}... Box!`, true);

    const btnText = document.getElementById('round-timer-btn-text');
    if (btnText) btnText.innerText = 'Pause Round';

    this.roundInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerUI();

      // 10-Second Warning Clapper
      if (this.timerState === 'round' && this.timeRemaining === 10) {
        window.audioSynth.playWoodClapper();
        window.speechCoach.speak('Ten seconds left! Work the body!', false);
      }

      // 3-2-1 Metronome countdown
      if (this.timeRemaining <= 3 && this.timeRemaining > 0) {
        window.audioSynth.playBeep(700, 0.07);
      }

      // Phase Transition
      if (this.timeRemaining <= 0) {
        if (this.timerState === 'round') {
          // Transition to Rest
          window.audioSynth.playBoxingBell();
          if (this.currentRound >= this.totalRounds) {
            this.finishBout();
            return;
          }
          this.timerState = 'rest';
          this.timeRemaining = this.restDuration;
          window.speechCoach.speak(`Round ${this.currentRound} complete. Rest and recover your breathing.`, true);
        } else if (this.timerState === 'rest') {
          // Transition to Next Round
          this.currentRound++;
          this.timerState = 'round';
          this.timeRemaining = this.roundDuration;
          window.audioSynth.playBoxingBell();
          window.speechCoach.speak(`Round ${this.currentRound}... Fight!`, true);
        }
        this.updateTimerUI();
      }
    }, 1000);
  }

  pauseRoundTimer() {
    if (this.roundInterval) {
      clearInterval(this.roundInterval);
      this.roundInterval = null;
    }
    this.timerState = 'paused';
    this.updateTimerUI();

    const btnText = document.getElementById('round-timer-btn-text');
    if (btnText) btnText.innerText = 'Resume Round';
  }

  resetRoundTimer() {
    if (this.roundInterval) {
      clearInterval(this.roundInterval);
      this.roundInterval = null;
    }
    this.timerState = 'idle';
    this.currentRound = 1;
    this.timeRemaining = this.roundDuration;
    this.updateTimerUI();

    const btnText = document.getElementById('round-timer-btn-text');
    if (btnText) btnText.innerText = 'Start Round';
  }

  finishBout() {
    if (this.roundInterval) clearInterval(this.roundInterval);
    this.roundInterval = null;
    this.timerState = 'idle';
    this.updateTimerUI();

    const stateText = document.getElementById('round-state-text');
    if (stateText) stateText.innerText = 'BOUT COMPLETED';

    window.speechCoach.speak('Final bell! Outstanding ring stamina and output, Champ!');
  }

  updateTimerUI() {
    const clock = document.getElementById('round-clock-digits');
    const curRound = document.getElementById('current-round-num');
    const totRound = document.getElementById('total-rounds-num');
    const stateText = document.getElementById('round-state-text');
    const subInfo = document.getElementById('round-sub-info');
    const pill = document.getElementById('round-status-pill');

    const mm = String(Math.floor(this.timeRemaining / 60)).padStart(2, '0');
    const ss = String(this.timeRemaining % 60).padStart(2, '0');

    if (clock) clock.innerText = `${mm}:${ss}`;
    if (curRound) curRound.innerText = this.currentRound;
    if (totRound) totRound.innerText = `/ ${this.totalRounds}`;

    if (this.timerState === 'round') {
      if (stateText) stateText.innerText = '🥊 FIGHT IN PROGRESS';
      if (subInfo) subInfo.innerText = `Next: ${this.restDuration}s Rest Interval`;
      if (pill) pill.className = 'round-status-pill';
    } else if (this.timerState === 'rest') {
      if (stateText) stateText.innerText = '💧 REST & CORNER ADVICE';
      if (subInfo) subInfo.innerText = `Next: Round ${this.currentRound + 1} of ${this.totalRounds}`;
      if (pill) pill.className = 'round-status-pill badge-cyan';
    } else if (this.timerState === 'paused') {
      if (stateText) stateText.innerText = '⏸️ ROUND PAUSED';
      if (subInfo) subInfo.innerText = 'Click Resume to continue';
    } else {
      if (stateText) stateText.innerText = 'READY FOR BOUT';
      if (subInfo) subInfo.innerText = `Standard ${Math.floor(this.roundDuration / 60)} min rounds`;
    }
  }

  setPreset(roundSec, restSec, totalRds) {
    this.roundDuration = roundSec;
    this.restDuration = restSec;
    this.totalRounds = totalRds;
    this.resetRoundTimer();
  }

  // ================= AI VOICE COMBO CALLER =================
  toggleComboCaller() {
    const btnText = document.getElementById('combo-caller-btn-text');

    if (this.isComboCallerActive) {
      clearInterval(this.comboInterval);
      this.comboInterval = null;
      this.isComboCallerActive = false;
      if (btnText) btnText.innerText = '🔊 Start Live Voice Calling';
      return;
    }

    this.isComboCallerActive = true;
    if (btnText) btnText.innerText = '⏹️ Stop Voice Calling';

    const pacing = parseInt(document.getElementById('combo-pacing').value) || 2800;
    this.callNextCombo();

    this.comboInterval = setInterval(() => {
      this.callNextCombo();
    }, pacing);
  }

  callNextCombo() {
    const complexity = document.getElementById('combo-complexity').value || 'intermediate';

    const basicCombos = [
      { seq: '1 - 2', chips: ['Jab', 'Cross'] },
      { seq: '1 - 1 - 2', chips: ['Jab', 'Jab', 'Cross'] },
      { seq: '1 - 2 - 3', chips: ['Jab', 'Cross', 'Lead Hook'] },
      { seq: '1 - 6 - 3', chips: ['Jab', 'Rear Uppercut', 'Lead Hook'] },
      { seq: '2 - 3 - 2', chips: ['Cross', 'Lead Hook', 'Cross'] }
    ];

    const interCombos = [
      { seq: '1 - 2 - SLIP RIGHT - 2', chips: ['Jab', 'Cross', 'Slip Right', 'Cross'], def: [2] },
      { seq: '1 - SLIP LEFT - 3 - 2', chips: ['Jab', 'Slip Left', 'Lead Hook', 'Cross'], def: [1] },
      { seq: '1 - 2 - 3 - ROLL RIGHT - 2', chips: ['Jab', 'Cross', 'Hook', 'Roll Right', 'Cross'], def: [3] },
      { seq: '1 - 2 - 5 - 2', chips: ['Jab', 'Cross', 'Lead Uppercut', 'Cross'], def: [] },
      { seq: '3 - 2 - 3 - SLIP', chips: ['Lead Hook', 'Cross', 'Lead Hook', 'Slip'], def: [3] }
    ];

    const advCombos = [
      { seq: '1 - 2 - PIVOT - 3 - 8 - 2', chips: ['Jab', 'Cross', 'Angle Pivot', 'Lead Hook', 'Rear Body Hook', 'Cross'], def: [2] },
      { seq: '1 - 1 - 2 - SLIP - 5 - 3 - ROLL - 2', chips: ['Jab', 'Jab', 'Cross', 'Slip', 'Uppercut', 'Hook', 'Roll', 'Cross'], def: [3, 6] },
      { seq: '7 - 3 - 2 - PULL BACK - 2', chips: ['Lead Body Hook', 'Lead Hook', 'Cross', 'Pull Back', 'Cross'], def: [3] },
      { seq: '1 - 6 - 3 - 2 - SLIP - 2', chips: ['Jab', 'Uppercut', 'Hook', 'Cross', 'Slip Right', 'Cross'], def: [4] }
    ];

    let pool = basicCombos;
    if (complexity === 'intermediate') pool = interCombos;
    else if (complexity === 'advanced') pool = advCombos;

    const chosen = pool[Math.floor(Math.random() * pool.length)];

    // Render on UI
    const seqEl = document.getElementById('combo-sequence-text');
    const breakdownEl = document.getElementById('combo-breakdown');

    if (seqEl) seqEl.innerText = chosen.seq;
    if (breakdownEl) {
      breakdownEl.innerHTML = chosen.chips.map((chip, idx) => {
        const isDef = chosen.def && chosen.def.includes(idx);
        return `<span class="p-chip ${isDef ? 'p-def' : ''}">${chip}</span>`;
      }).join('');
    }

    // Audio Swoosh + Voice
    window.audioSynth.playPunchImpact();
    window.speechCoach.speakCombo(chosen.seq);
  }

  // ================= REFLEX & REACTION SPEED LAB =================
  initReflexPad() {
    const pad = document.getElementById('reaction-target-pad');
    if (!pad) return;

    const handleAction = () => {
      this.handleReflexPadClick();
    };

    pad.addEventListener('click', handleAction);
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && document.getElementById('boxing-tab-reflex').classList.contains('active')) {
        e.preventDefault();
        this.handleReflexPadClick();
      }
    });
  }

  handleReflexPadClick() {
    const pad = document.getElementById('reaction-target-pad');
    const title = document.getElementById('pad-status-title');
    const sub = document.getElementById('pad-status-sub');
    const resultDisplay = document.getElementById('reaction-result-display');
    const msNum = document.getElementById('reaction-ms-number');
    const icon = document.getElementById('pad-icon');

    if (this.reflexState === 'idle' || this.reflexState === 'early') {
      // Arm sensors -> waiting
      this.reflexState = 'waiting';
      pad.className = 'reaction-target-pad state-waiting';
      if (title) title.innerText = 'WAIT FOR GREEN...';
      if (sub) sub.innerText = 'Get ready to strike immediately!';
      if (icon) icon.innerText = '🔴';
      if (resultDisplay) resultDisplay.style.display = 'none';

      // Random delay between 1.5s and 4.0s
      const delay = Math.random() * 2500 + 1500;
      this.reflexTimeout = setTimeout(() => {
        if (this.reflexState === 'waiting') {
          this.reflexState = 'active';
          this.reflexStartTime = performance.now();
          pad.className = 'reaction-target-pad state-active';
          if (title) title.innerText = '⚡ STRIKE NOW! ⚡';
          if (sub) sub.innerText = 'CLICK OR PRESS SPACE!';
          if (icon) icon.innerText = '🟢';
          window.audioSynth.playBeep(980, 0.05);
        }
      }, delay);

    } else if (this.reflexState === 'waiting') {
      // Too early!
      if (this.reflexTimeout) clearTimeout(this.reflexTimeout);
      this.reflexState = 'early';
      pad.className = 'reaction-target-pad state-early';
      if (title) title.innerText = '⚠️ TOO EARLY! FALSE START';
      if (sub) sub.innerText = 'Click to try again and wait for GREEN.';
      if (icon) icon.innerText = '❌';
      window.audioSynth.playBeep(240, 0.2);

    } else if (this.reflexState === 'active') {
      // Success! Calculate ms
      const reactionTime = Math.round(performance.now() - this.reflexStartTime);
      this.reflexState = 'idle';
      this.reflexHistory.push(reactionTime);

      pad.className = 'reaction-target-pad state-idle';
      if (title) title.innerText = 'PUNCH REGISTERED!';
      if (sub) sub.innerText = 'Click pad to arm next trial';
      if (icon) icon.innerText = '🥊';

      if (resultDisplay) resultDisplay.style.display = 'block';
      if (msNum) msNum.innerText = reactionTime;

      window.audioSynth.playPunchImpact();
      this.updateReflexStats(reactionTime);
    }
  }

  updateReflexStats(lastTime) {
    const bestEl = document.getElementById('r-stat-best');
    const avgEl = document.getElementById('r-stat-avg');
    const trialsEl = document.getElementById('r-stat-trials');
    const gradeBadge = document.getElementById('reflex-grade-badge');

    const best = Math.min(...this.reflexHistory);
    const last5 = this.reflexHistory.slice(-5);
    const avg = Math.round(last5.reduce((a, b) => a + b, 0) / last5.length);

    if (bestEl) bestEl.innerText = `${best} ms`;
    if (avgEl) avgEl.innerText = `${avg} ms`;
    if (trialsEl) trialsEl.innerText = this.reflexHistory.length;

    // Grade classification
    let grade = 'AMATEUR';
    if (lastTime < 190) {
      grade = '🏆 WORLD CHAMPION ELITE (<190ms)';
      if (gradeBadge) gradeBadge.className = 'badge badge-success';
    } else if (lastTime < 240) {
      grade = '⚡ SHARP COMPETITOR (190-240ms)';
      if (gradeBadge) gradeBadge.className = 'badge badge-amber';
    } else if (lastTime < 310) {
      grade = '🥊 AVERAGE CLUB FIGHTER (240-310ms)';
      if (gradeBadge) gradeBadge.className = 'badge badge-cyan';
    } else {
      grade = '⚠️ VULNERABLE TO COUNTERS (>310ms)';
      if (gradeBadge) gradeBadge.className = 'badge badge-warning';
    }

    if (gradeBadge) gradeBadge.innerText = grade;
  }

  initEventListeners() {
    const startRoundBtn = document.getElementById('btn-start-round-timer');
    if (startRoundBtn) startRoundBtn.addEventListener('click', () => this.startRoundTimer());

    const pauseRoundBtn = document.getElementById('btn-pause-round-timer');
    if (pauseRoundBtn) pauseRoundBtn.addEventListener('click', () => this.pauseRoundTimer());

    const resetRoundBtn = document.getElementById('btn-reset-round-timer');
    if (resetRoundBtn) resetRoundBtn.addEventListener('click', () => this.resetRoundTimer());

    // Presets
    document.querySelectorAll('.preset-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const rd = parseInt(btn.dataset.round);
        const rest = parseInt(btn.dataset.rest);
        const rds = parseInt(btn.dataset.rounds);
        this.setPreset(rd, rest, rds);
      });
    });

    const comboBtn = document.getElementById('btn-toggle-combo-caller');
    if (comboBtn) comboBtn.addEventListener('click', () => this.toggleComboCaller());

    const resetCntBtn = document.getElementById('boxing-reset-counters-btn');
    if (resetCntBtn) resetCntBtn.addEventListener('click', () => window.visionAnalyzer.resetCounters());

    // Deep Strike Capture Modal Handlers
    const saveBoxingBtn = document.getElementById('btn-save-boxing-sample');
    const strikeModal = document.getElementById('deep-strike-analysis-modal');
    const closeStrikeModal = document.getElementById('btn-close-strike-modal');

    const openStrikeModal = () => {
      if (window.audioSynth) window.audioSynth.playBoxingBell();
      const viewport = document.getElementById('boxing-viewport');
      if (viewport) {
        const flash = document.createElement('div');
        flash.className = 'scanning-flash';
        flash.style.background = 'rgba(255, 42, 95, 0.25)';
        viewport.appendChild(flash);
        setTimeout(() => flash.remove(), 700);
      }
      setTimeout(() => {
        if (strikeModal) strikeModal.classList.add('active');
        const verdict = "Vicious strike execution! Cross velocity reached 9.1 m/s with 1,540 Newtons of kinetic power. Guard uptime was elite at 98%.";
        window.speechCoach.speak(verdict);
      }, 450);
    };

    if (saveBoxingBtn) saveBoxingBtn.addEventListener('click', openStrikeModal);
    if (closeStrikeModal && strikeModal) {
      closeStrikeModal.addEventListener('click', () => strikeModal.classList.remove('active'));
    }

    const hearStrikeCoach = document.getElementById('btn-deep-strike-hear-coach');
    if (hearStrikeCoach) {
      hearStrikeCoach.addEventListener('click', () => {
        const text = document.getElementById('deep-strike-verdict-text')?.innerText;
        if (text) window.speechCoach.speak(text, true);
      });
    }

    const saveCampLog = document.getElementById('btn-deep-strike-save');
    if (saveCampLog) {
      saveCampLog.addEventListener('click', () => {
        if (strikeModal) strikeModal.classList.remove('active');
        alert('Strike snapshot successfully logged to your Fight Camp Passport (+150 XP)!');
      });
    }
  }
}

window.boxingTools = new BoxingTools();

