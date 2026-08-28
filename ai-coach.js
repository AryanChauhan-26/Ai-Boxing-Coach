/**
 * Conversational AI Performance Coach
 * Dedicated Artemis (Archery) and Titan (Boxing) intelligence engines.
 */
class AICoach {
  constructor() {
    this.currentSport = 'archery';

    this.archeryInput = document.getElementById('archery-chat-input');
    this.boxingInput = document.getElementById('boxing-chat-input');

    this.archeryMessages = document.getElementById('archery-chat-messages');
    this.boxingMessages = document.getElementById('boxing-chat-messages');

    this.initEventListeners();
  }

  setSport(sport) {
    this.currentSport = sport;
  }

  initEventListeners() {
    // Archery Send
    const archerySendBtn = document.getElementById('archery-chat-send-btn');
    if (archerySendBtn) {
      archerySendBtn.addEventListener('click', () => this.handleSendMessage('archery'));
    }
    if (this.archeryInput) {
      this.archeryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSendMessage('archery');
      });
    }

    // Boxing Send
    const boxingSendBtn = document.getElementById('boxing-chat-send-btn');
    if (boxingSendBtn) {
      boxingSendBtn.addEventListener('click', () => this.handleSendMessage('boxing'));
    }
    if (this.boxingInput) {
      this.boxingInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSendMessage('boxing');
      });
    }

    // Quick Prompt Pills for Archery
    document.querySelectorAll('#archery-quick-prompts .prompt-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const text = pill.dataset.prompt;
        if (this.archeryInput) this.archeryInput.value = text;
        this.handleSendMessage('archery');
      });
    });

    // Quick Prompt Pills for Boxing
    document.querySelectorAll('#boxing-quick-prompts .prompt-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const text = pill.dataset.prompt;
        if (this.boxingInput) this.boxingInput.value = text;
        this.handleSendMessage('boxing');
      });
    });

    // Clear Chats
    const archClear = document.getElementById('archery-clear-chat-btn');
    if (archClear) archClear.addEventListener('click', () => this.clearChat('archery'));

    const boxClear = document.getElementById('boxing-clear-chat-btn');
    if (boxClear) boxClear.addEventListener('click', () => this.clearChat('boxing'));
  }

  handleSendMessage(sport) {
    const input = sport === 'archery' ? this.archeryInput : this.boxingInput;
    if (!input || !input.value.trim()) return;

    const userText = input.value.trim();
    input.value = '';

    // Append User Message Bubble
    this.appendMessage(sport, 'user', userText);

    // Show Typing Indicator & Generate Coach Response
    this.generateResponse(sport, userText);
  }

  appendMessage(sport, sender, text) {
    const container = sport === 'archery' ? this.archeryMessages : this.boxingMessages;
    if (!container) return;

    const isUser = sender === 'user';
    const isArchery = sport === 'archery';

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${isUser ? 'user-msg' : isArchery ? 'coach-msg' : 'coach-msg coach-msg-boxing'}`;

    bubble.innerHTML = `
      <div class="msg-avatar">${isUser ? '👤' : isArchery ? '🏹' : '🥊'}</div>
      <div class="msg-content">
        <p>${text.replace(/\n/g, '<br>')}</p>
      </div>
    `;

    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;

    // Vocalize coach response if voice enabled
    if (!isUser) {
      window.speechCoach.speak(text.replace(/<[^>]*>?/gm, ''));
    }
  }

  clearChat(sport) {
    const container = sport === 'archery' ? this.archeryMessages : this.boxingMessages;
    if (!container) return;

    const intro = sport === 'archery'
      ? `Greetings, Archer! I'm <strong>Artemis</strong>, your Olympic & World-Archery AI Performance Coach. Ready for your next session.`
      : `Welcome back to the gym, champ! I'm <strong>Titan</strong>, your AI Head Corner Coach. Ready for round strategy.`;

    container.innerHTML = `
      <div class="message-bubble ${sport === 'archery' ? 'coach-msg' : 'coach-msg coach-msg-boxing'}">
        <div class="msg-avatar">${sport === 'archery' ? '🏹' : '🥊'}</div>
        <div class="msg-content"><p>${intro}</p></div>
      </div>
    `;
  }

  generateResponse(sport, userPrompt) {
    const query = userPrompt.toLowerCase();
    let reply = '';

    if (sport === 'archery') {
      reply = this.getArcheryResponse(query);
    } else {
      reply = this.getBoxingResponse(query);
    }

    setTimeout(() => {
      this.appendMessage(sport, 'coach', reply);
    }, 450);
  }

  // ================= ARCHERY AI KNOWLEDGE BASE =================
  getArcheryResponse(q) {
    if (q.includes('target panic') || q.includes('flinch') || q.includes('anticipat') || q.includes('freeze')) {
      return `Target panic is an involuntary neurological disconnect between aiming and releasing. Here is our 3-phase cure protocol:\n\n` +
        `1. **Blind Bale / 3-Meter Eyes-Closed Drills:** Stand 3 meters from a blank target boss. Draw, anchor, close your eyes, and focus purely on smooth rhomboid expansion and subconscious release. Do 30 arrows daily.\n` +
        `2. **Aim Without Releasing:** Draw at full distance, settle your sight pin dead-center on the 10-ring for 7 seconds, then let down safely without shooting. This breaks the subconscious urgency trigger.\n` +
        `3. **Surprise Clicker / Resistance Release:** Switch to a hinge or tension-activated release so the shot breaks unexpectedly without conscious finger triggering.`;
    }

    if (q.includes('elbow') || q.includes('alignment') || q.includes('rhomboid') || q.includes('back tension')) {
      return `For optimal Olympic Recurve and Compound geometry, your **draw elbow must sit in-line or slightly higher** (172°–178°) relative to the arrow shaft axis.\n\n` +
        `• **Common Error:** Low draw elbow forces your biceps and forearm to hold draw weight rather than your skeletal frame, leading to vertical grouping stringing.\n` +
        `• **Fix:** During the setup phase, rotate your draw elbow up and back using your latissimus dorsi and middle trapezius muscles. Keep your bow shoulder seated down and locked.`;
    }

    if (q.includes('plunger') || q.includes('spine') || q.includes('tune') || q.includes('left') || q.includes('right')) {
      return `Here is the Olympic Bare-Shaft Tuning diagnosis (for Right-Handed archer):\n\n` +
        `• **Bare shaft hitting LEFT of fletched group:** Your dynamic arrow spine is too STIFF. Adjust by:\n` +
        `  - Softening the plunger button spring tension (counter-clockwise 1/2 turn).\n` +
        `  - Increasing limb poundage (tiller bolts 1/4 turn in).\n` +
        `  - Increasing arrow point tip weight (e.g. 100gr to 120gr).\n\n` +
        `• **Bare shaft hitting RIGHT:** Arrow spine is too WEAK. Stiffen plunger or reduce draw poundage.`;
    }

    if (q.includes('spt') || q.includes('workout') || q.includes('routine') || q.includes('hold') || q.includes('strength')) {
      return `Here is your **15-Minute Olympic SPT (Specific Physical Training)** regimen:\n\n` +
        `• **SPT 1: Endurance Holds (6 sets):** Hold full draw at anchor for 30 seconds, rest 30 seconds. (Use our SPT timer in the lab!)\n` +
        `• **SPT 2: Power Pulls (4 sets of 8 reps):** Pull from setup to full draw in 1.5s, hold for 2s, slowly lower over 3s without releasing.\n` +
        `• **SPT 3: Core Stability Anti-Rotation:** Planks with band holds (3 sets of 45s).\n\n` +
        `Perform this 3 times per week to build rock-solid sight pin steadiness.`;
    }

    if (q.includes('wind') || q.includes('breath') || q.includes('weather') || q.includes('heart rate')) {
      return `In windy outdoor conditions (WA 70m/50m), master the **Quick-Shot Cadence & Low Anchor**:\n\n` +
        `1. **Shorten Shot Window:** Drop your hold time from 4.5s down to 2.5s—do not over-aim in gusts.\n` +
        `2. **Aim Off (Kentucky Windage):** Aim against the flag direction; if wind is left-to-right at 15 km/h, place sight pin on the left 8-ring.\n` +
        `3. **Diaphragmatic Breathing:** Inhale 50% on draw, exhale 20% into anchor, hold breath during clicker expansion to lock your thoracic cavity.`;
    }

    // Default Archery Advice
    return `Excellent question. In competitive archery, consistency is 90% skeletal alignment and 10% mental release. To dial this in:\n\n` +
      `• Use our **Vision Form Analyzer** to ensure your draw elbow maintains 174° alignment with your bow hand.\n` +
      `• Plot 6 arrows on the **Interactive Target** to calculate your true group dispersion and sight pin click corrections.\n` +
      `• Practice with the **Bio-Breathing Sync** before every high-pressure end.`;
  }

  // ================= BOXING AI KNOWLEDGE BASE =================
  getBoxingResponse(q) {
    if (q.includes('southpaw') || q.includes('lefty') || q.includes('tall') || q.includes('reach')) {
      return `When fighting a Southpaw as an Orthodox boxer, the golden rule is **Lead Foot Dominance (Outside Foot Position)**:\n\n` +
        `1. **Step Outside Their Lead Foot:** Always step your left foot outside their right foot. This gives you a clear line for your straight Right Cross (2) straight down the pipe while putting you out of their power left hand.\n` +
        `2. **Throw the Straight Right to the Body:** Southpaws tend to lean back from orthodox jabs. Feint high, then drive the 2 hard into their solar plexus.\n` +
        `3. **Lead Hook Over Their Guard (3):** Use the check hook when they attempt to step inside.`;
    }

    if (q.includes('power') || q.includes('cross') || q.includes('knockout') || q.includes('kinetic') || q.includes('right hand')) {
      return `Knockout power on the Right Cross (2) comes from the **Kinetic Chain**, not arm muscle:\n\n` +
        `1. **Pivot Rear Foot 45°-90°:** Crush the cigarette under the ball of your rear foot. This engages your calf and quad.\n` +
        `2. **Full Hip Rotation:** Snap your right hip forward so your shoulders become perpendicular to the target.\n` +
        `3. **Corkscrew the Fist:** Rotate your fist palm-down at the final 2 inches of impact to lock your wrist, radius, and ulna bones.\n` +
        `4. **Glue Lead Glove to Cheek:** Never drop your left hand when firing the cross!`;
    }

    if (q.includes('philly shell') || q.includes('mayweather') || q.includes('shoulder roll') || q.includes('defense')) {
      return `The **Philly Shell / Shoulder Roll Defense** Breakdown:\n\n` +
        `• **Stance:** Side-on bladed stance. Lead shoulder tucked high against chin.\n` +
        `• **Arm Placement:** Lead arm rests across solar plexus/liver; rear glove rests cupping right cheek.\n` +
        `• **Mechanics:** When the opponent throws a right cross, rotate your upper torso slightly to the right so their punch glances off your left shoulder cap, then spring back with a counter Right Cross (2) or Lead Uppercut (5).`;
    }

    if (q.includes('heavy bag') || q.includes('workout') || q.includes('rounds') || q.includes('drill')) {
      return `Here is your **6-Round Championship Heavy Bag Protocol**:\n\n` +
        `• **Round 1 (Range & Jab):** 1s, double-jabs, step-off pivots. Focus on crisp range finders.\n` +
        `• **Round 2 (Power 1-2 & Slips):** 1-2-Slip-2 and 1-2-3 combinations with full hip rotation.\n` +
        `• **Round 3 (Inside Phone Booth Fight):** Hooks to the body (7, 8), uppercuts (5, 6), forehead resting against bag.\n` +
        `• **Round 4 (High Output Volume):** Constant 4-punch combinations at 80% power. Minimum 90 punches.\n` +
        `• **Round 5 (Counter-Punch Simulation):** Feint, slip bag imaginary punches, counter with 3-punch combos.\n` +
        `• **Round 6 (Burnout Blitz):** 30s power hooks, 30s straight speed punches, 30s sprint intervals.`;
    }

    if (q.includes('recovery') || q.includes('rest') || q.includes('corner') || q.includes('breath') || q.includes('heart')) {
      return `During your **60-Second Corner Rest**, execute the championship recovery routine:\n\n` +
        `1. **Posture:** Sit tall with elbows rested on ropes to open chest cavity and expand lung volume.\n` +
        `2. **Box Breathing:** 3 deep nasal inhalations, slow oral exhalations to drop heart rate by 15–20 BPM.\n` +
        `3. **Mental Reset:** Erase the previous round; listen to tactical adjustments for round ${window.boxingTools ? window.boxingTools.currentRound + 1 : 2}.`;
    }

    // Default Boxing Advice
    return `Solid technical question, champ. In high-level boxing, precision and timing beat pure speed:\n\n` +
      `• Turn on our **Real-Time Voice Combo Caller** to drill dynamic combinations at fight pace.\n` +
      `• Test your counter-punch trigger speed in our **Reflex & Reaction Speed Lab** (< 190ms is champion tier).\n` +
      `• Check your **Vision Strike Biomechanics** to ensure your hands stay glued to your chin after every strike.`;
  }
}

window.aiCoach = new AICoach();
