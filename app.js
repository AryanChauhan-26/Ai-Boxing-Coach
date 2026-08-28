/**
 * Main Application Orchestrator
 * Sport discipline state management, Athlete Authentication Portal,
 * Video Academy, Rules & Regulations Guide, and Tab Navigation.
 */
class ApexApp {
  constructor() {
    this.currentSport = 'archery'; // 'archery' or 'boxing'
    this.currentTab = 'vision'; // active tab identifier
    this.userProfile = {
      level: 'intermediate',
      stance: 'right'
    };

    // Current Logged-in Athlete State
    this.currentAthlete = this.loadSavedAthlete() || {
      isLoggedIn: true,
      name: 'Aryan Chauhan',
      email: 'aryan@forgefitness.app',
      role: 'Elite Combat & Precision Athlete',
      avatar: '⚡',
      badge: 'PRO TIER',
      xp: 3450,
      sessions: 38,
      streakDays: 14,
      accuracyRate: '94.2%'
    };

    this.tabsBySport = {
      archery: [
        { id: 'vision', label: '🎯 Vision Form AI', paneId: 'archery-tab-vision' },
        { id: 'videos', label: '🎥 Video Academy', paneId: 'archery-tab-videos' },
        { id: 'rules', label: '📜 Rules & Guide', paneId: 'archery-tab-rules' },
        { id: 'target', label: '⭕ Target & Sight AI', paneId: 'archery-tab-target' },
        { id: 'coach', label: '🧠 Coach Artemis', paneId: 'archery-tab-coach' },
        { id: 'spt', label: '⏱️ SPT & Breathing', paneId: 'archery-tab-spt' },
        { id: 'analytics', label: '📊 Scorecard & Stats', paneId: 'archery-tab-analytics' }
      ],
      boxing: [
        { id: 'vision', label: '🥊 Biometric Tracker AI', paneId: 'boxing-tab-vision' },
        { id: 'videos', label: '🎥 Video Academy', paneId: 'boxing-tab-videos' },
        { id: 'rules', label: '📜 Rules & Guide', paneId: 'boxing-tab-rules' },
        { id: 'timer', label: '⏱️ Round Timer & Combos', paneId: 'boxing-tab-timer' },
        { id: 'coach', label: '🧠 Coach Titan', paneId: 'boxing-tab-coach' },
        { id: 'reflex', label: '⚡ Reflex & Reaction', paneId: 'boxing-tab-reflex' },
        { id: 'analytics', label: '📊 Fight Analytics', paneId: 'boxing-tab-analytics' }
      ]
    };

    this.init();
  }

  init() {
    this.initSportSelection();
    this.initHeaderControls();
    this.initAuth();
    this.initRulesQuizzes();
    this.renderNavTabs();
    this.switchSport('archery', false); // default to Archery behind modal
  }

  // ================= ATHLETE AUTH & PROFILE =================
  loadSavedAthlete() {
    try {
      const saved = localStorage.getItem('apex_athlete_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  saveAthlete(athlete) {
    this.currentAthlete = athlete;
    try {
      localStorage.setItem('apex_athlete_profile', JSON.stringify(athlete));
    } catch (e) {}
    this.updateAuthHeaderUI();
  }

  initAuth() {
    const authBtn = document.getElementById('btn-athlete-login');
    const authModal = document.getElementById('athlete-auth-modal');
    const closeAuthBtn = document.getElementById('btn-close-auth-modal');

    if (authBtn && authModal) {
      authBtn.addEventListener('click', () => {
        this.renderProfileModalView();
        authModal.classList.add('active');
      });
    }

    if (closeAuthBtn && authModal) {
      closeAuthBtn.addEventListener('click', () => {
        authModal.classList.remove('active');
      });
    }

    // Modal Tabs Navigation (Sign In, Sign Up, Profile)
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.auth-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const pane = document.getElementById(btn.dataset.pane);
        if (pane) pane.classList.add('active');
      });
    });

    // 1-Click Demo Athlete Logins
    document.querySelectorAll('.demo-athlete-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const demoType = pill.dataset.demo;
        if (demoType === 'artemis') {
          this.saveAthlete({
            isLoggedIn: true,
            name: 'Artemis Vance',
            email: 'artemis@olympic-archery.org',
            role: 'Olympic Recurve Athlete',
            avatar: '🏹',
            badge: 'OLYMPIAN',
            xp: 4890,
            sessions: 52,
            streakDays: 24,
            accuracyRate: '98.1%'
          });
          this.switchSport('archery', true);
        } else if (demoType === 'titan') {
          this.saveAthlete({
            isLoggedIn: true,
            name: 'Titan Briggs',
            email: 'titan@proboxing-gym.com',
            role: 'Pro Cruiserweight Contender',
            avatar: '🥊',
            badge: 'CHAMPION',
            xp: 5120,
            sessions: 64,
            streakDays: 31,
            accuracyRate: '95.4%'
          });
          this.switchSport('boxing', true);
        } else {
          this.saveAthlete({
            isLoggedIn: true,
            name: 'Rookie Athlete',
            email: 'rookie@forgefitness.app',
            role: 'Beginner Athlete',
            avatar: '⚡',
            badge: 'ROOKIE',
            xp: 350,
            sessions: 4,
            streakDays: 3,
            accuracyRate: '78.5%'
          });
        }

        if (authModal) authModal.classList.remove('active');
        window.speechCoach.speak(`Authenticated as ${this.currentAthlete.name}. Training metrics synced.`);
      });
    });

    // Form Submissions
    const signinForm = document.getElementById('athlete-signin-form');
    if (signinForm) {
      signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email')?.value || 'athlete@apex.ai';
        const name = email.split('@')[0];
        this.saveAthlete({
          isLoggedIn: true,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email: email,
          role: 'Registered Apex Athlete',
          avatar: '👤',
          badge: 'VERIFIED',
          xp: 1200,
          sessions: 12,
          streakDays: 5,
          accuracyRate: '89.0%'
        });
        if (authModal) authModal.classList.remove('active');
        window.speechCoach.speak(`Welcome back, ${this.currentAthlete.name}!`);
      });
    }

    // Sign out button
    const signoutBtn = document.getElementById('btn-athlete-signout');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', () => {
        this.saveAthlete({
          isLoggedIn: false,
          name: 'Guest Athlete',
          email: '',
          role: 'Guest Mode',
          avatar: '👤',
          badge: 'GUEST',
          xp: 0,
          sessions: 0,
          streakDays: 0,
          accuracyRate: '--'
        });
        if (authModal) authModal.classList.remove('active');
        window.speechCoach.speak('Signed out. Continuing in guest mode.');
      });
    }

    this.updateAuthHeaderUI();
  }

  updateAuthHeaderUI() {
    const authBtn = document.getElementById('btn-athlete-login');
    if (!authBtn) return;

    if (this.currentAthlete && this.currentAthlete.isLoggedIn) {
      authBtn.innerHTML = `
        <span class="athlete-avatar-dot">${this.currentAthlete.avatar || '⚡'}</span>
        <span>${this.currentAthlete.name}</span>
        <span class="badge ${this.currentSport === 'archery' ? 'badge-accent' : 'badge-crimson'}" style="font-size: 9.5px; padding: 2px 6px;">${this.currentAthlete.badge || 'PRO'}</span>
      `;
    } else {
      authBtn.innerHTML = `
        <span class="athlete-avatar-dot">👤</span>
        <span>Athlete Login</span>
      `;
    }
  }

  renderProfileModalView() {
    const nameEl = document.getElementById('profile-view-name');
    const emailEl = document.getElementById('profile-view-email');
    const roleEl = document.getElementById('profile-view-role');
    const avatarEl = document.getElementById('profile-view-avatar');
    const xpEl = document.getElementById('profile-stat-xp');
    const sessionsEl = document.getElementById('profile-stat-sessions');
    const streakEl = document.getElementById('profile-stat-streak');

    if (nameEl) nameEl.innerText = this.currentAthlete.name || 'Guest Athlete';
    if (emailEl) emailEl.innerText = this.currentAthlete.email || 'Not Logged In';
    if (roleEl) roleEl.innerText = this.currentAthlete.role || 'Guest Mode';
    if (avatarEl) avatarEl.innerText = this.currentAthlete.avatar || '👤';
    if (xpEl) xpEl.innerText = this.currentAthlete.xp || 0;
    if (sessionsEl) sessionsEl.innerText = this.currentAthlete.sessions || 0;
    if (streakEl) streakEl.innerText = `${this.currentAthlete.streakDays || 0} Days`;
  }

  // ================= SPORT SELECTION & SWITCHING =================
  initSportSelection() {
    const modal = document.getElementById('sport-selector-modal');
    const archeryCard = document.getElementById('select-archery-card');
    const boxingCard = document.getElementById('select-boxing-card');
    const archeryBtn = document.getElementById('btn-choose-archery');
    const boxingBtn = document.getElementById('btn-choose-boxing');

    const selectSport = (sport) => {
      this.currentSport = sport;
      this.userProfile.level = document.getElementById('user-level')?.value || 'intermediate';
      this.userProfile.stance = document.getElementById('user-stance')?.value || 'right';

      this.switchSport(sport, true);
      if (modal) modal.classList.remove('active');

      const welcomeMsg = sport === 'archery'
        ? 'Welcome to the Archery Precision Lab! Coach Artemis is active.'
        : 'Welcome to the Boxing High-Performance Gym! Coach Titan is active.';
      window.speechCoach.speak(welcomeMsg);
    };

    if (archeryCard) archeryCard.addEventListener('click', () => selectSport('archery'));
    if (archeryBtn) archeryBtn.addEventListener('click', (e) => { e.stopPropagation(); selectSport('archery'); });

    if (boxingCard) boxingCard.addEventListener('click', () => selectSport('boxing'));
    if (boxingBtn) boxingBtn.addEventListener('click', (e) => { e.stopPropagation(); selectSport('boxing'); });
  }

  switchSport(sport, updateTheme = true) {
    this.currentSport = sport;

    // Body Theme Class
    const body = document.getElementById('app-body');
    if (body && updateTheme) {
      body.className = sport === 'archery' ? 'theme-archery' : 'theme-boxing';
    }

    // Header updates
    const logoIcon = document.getElementById('header-logo-icon');
    const sportBadge = document.getElementById('current-sport-badge');

    if (logoIcon) logoIcon.innerText = sport === 'archery' ? '🎯' : '🥊';
    if (sportBadge) sportBadge.innerText = sport === 'archery' ? 'ARCHERY PRECISION LAB' : 'BOXING PERFORMANCE GYM';

    // View Container Display
    const archeryContainer = document.getElementById('archery-container');
    const boxingContainer = document.getElementById('boxing-container');

    if (archeryContainer) archeryContainer.classList.toggle('active-view', sport === 'archery');
    if (boxingContainer) boxingContainer.classList.toggle('active-view', sport === 'boxing');

    // Notify modules
    if (window.visionAnalyzer) window.visionAnalyzer.setSport(sport);
    if (window.aiCoach) window.aiCoach.setSport(sport);

    this.updateAuthHeaderUI();

    // Render navigation tabs for active sport
    this.renderNavTabs();
    this.switchTab(this.tabsBySport[sport][0].id);
  }

  // ================= TAB NAVIGATION =================
  renderNavTabs() {
    const nav = document.getElementById('main-nav-tabs');
    if (!nav) return;

    const tabs = this.tabsBySport[this.currentSport];
    nav.innerHTML = tabs.map((tab, idx) => `
      <button class="nav-tab-btn ${idx === 0 ? 'active' : ''}" data-tab="${tab.id}" data-pane="${tab.paneId}">
        <span>${tab.label}</span>
      </button>
    `).join('');

    nav.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        this.switchTab(tabId);
      });
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    const tabs = this.tabsBySport[this.currentSport];
    const activeTab = tabs.find(t => t.id === tabId) || tabs[0];

    // Update Tab Buttons
    document.querySelectorAll('#main-nav-tabs .nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === activeTab.id);
    });

    // Update Panes in active sport view
    const container = document.getElementById(`${this.currentSport}-container`);
    if (container) {
      container.querySelectorAll('.app-tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === activeTab.paneId);
      });
    }

    // Play subtle chime on tab change
    if (window.audioSynth) window.audioSynth.playBeep(1200, 0.03);
  }

  // ================= RULES & QUIZZES =================
  initRulesQuizzes() {
    // Archery Quiz
    document.querySelectorAll('.archery-quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.correct === 'true';
        const feedbackEl = document.getElementById('archery-quiz-feedback');
        
        btn.parentElement.querySelectorAll('.archery-quiz-opt').forEach(b => {
          b.classList.remove('correct', 'wrong');
        });

        if (isCorrect) {
          btn.classList.add('correct');
          if (feedbackEl) {
            feedbackEl.innerHTML = '✅ <span class="text-green">Correct! According to World Archery rules, if the arrow shaft touches any dividing line, the higher value is awarded!</span>';
          }
          if (window.audioSynth) window.audioSynth.playBeep(1400, 0.1);
        } else {
          btn.classList.add('wrong');
          if (feedbackEl) {
            feedbackEl.innerHTML = '❌ <span class="text-crimson">Not quite. World Archery awards the higher ring score if the shaft touches the line.</span>';
          }
        }
      });
    });

    // Boxing Quiz
    document.querySelectorAll('.boxing-quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.correct === 'true';
        const feedbackEl = document.getElementById('boxing-quiz-feedback');
        
        btn.parentElement.querySelectorAll('.boxing-quiz-opt').forEach(b => {
          b.classList.remove('correct', 'wrong');
        });

        if (isCorrect) {
          btn.classList.add('correct');
          if (feedbackEl) {
            feedbackEl.innerHTML = '✅ <span class="text-green">Correct! Under the 10-Point Must System, a round with a clean knockdown is scored 10-8 for the puncher!</span>';
          }
          if (window.audioSynth) window.audioSynth.playBoxingBell();
        } else {
          btn.classList.add('wrong');
          if (feedbackEl) {
            feedbackEl.innerHTML = '❌ <span class="text-crimson">Incorrect. Standard scoring gives 10-8 when a knockdown occurs.</span>';
          }
        }
      });
    });
  }

  // ================= HEADER & UTILITIES =================
  initHeaderControls() {
    // Logo opens selector modal
    const brandLogo = document.querySelector('.brand-logo');
    if (brandLogo) {
      brandLogo.addEventListener('click', () => {
        const modal = document.getElementById('sport-selector-modal');
        if (modal) modal.classList.add('active');
      });
    }

    // Voice Coach Toggle
    const voiceBtn = document.getElementById('btn-toggle-voice');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        const isEnabled = window.speechCoach.toggleVoice();
        voiceBtn.classList.toggle('active', isEnabled);
        const label = voiceBtn.querySelector('.voice-status-label');
        if (label) label.innerText = `Voice: ${isEnabled ? 'ON' : 'OFF'}`;
        if (isEnabled) window.speechCoach.speak('Voice coaching enabled.');
      });
    }

    // SFX Toggle
    const sfxBtn = document.getElementById('btn-toggle-sfx');
    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => {
        const isEnabled = window.audioSynth.toggleSFX();
        sfxBtn.classList.toggle('active', isEnabled);
        if (isEnabled) window.audioSynth.playBoxingBell();
      });
    }

    // Vision Webcams & Simulation Buttons
    const archWebcam = document.getElementById('archery-webcam-btn');
    if (archWebcam) archWebcam.addEventListener('click', () => window.visionAnalyzer.toggleWebcam('archery'));

    const boxWebcam = document.getElementById('boxing-webcam-btn');
    if (boxWebcam) boxWebcam.addEventListener('click', () => window.visionAnalyzer.toggleWebcam('boxing'));

    const archDemo = document.getElementById('archery-demo-btn');
    if (archDemo) {
      archDemo.addEventListener('click', () => {
        window.speechCoach.speak('Running Olympian draw biomechanics cycle with 174.5 degree elbow angle.');
      });
    }

    const boxDemo = document.getElementById('boxing-demo-btn');
    if (boxDemo) {
      boxDemo.addEventListener('click', () => {
        window.speechCoach.speak('Simulating 1-2 Combination with explosive right cross power transfer.');
      });
    }

    // Quick links from Video Cards to Tracker
    document.addEventListener('click', (e) => {
      const practiceBtn = e.target.closest('.btn-practice-in-tracker');
      if (practiceBtn) {
        this.switchTab('vision');
        window.speechCoach.speak('Opening Biometric Tracker for form practice.');
      }
    });

    // Export Reports
    const expArch = document.getElementById('btn-export-archery-stats');
    if (expArch) {
      expArch.addEventListener('click', () => {
        alert('Archery Performance Report generated! Saved to training log with 92.0% accuracy index.');
      });
    }

    const expBox = document.getElementById('btn-export-boxing-stats');
    if (expBox) {
      expBox.addEventListener('click', () => {
        alert('Boxing Fight Camp Log exported! Total 482 punches across 6 rounds with 8.6 m/s avg velocity.');
      });
    }
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.apexApp = new ApexApp();
});

