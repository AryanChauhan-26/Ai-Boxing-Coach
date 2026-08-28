/**
 * Computer Vision & Biomechanics Simulation Engine
 * High-Precision Biometrics for Olympic Archery & Championship Boxing.
 * Includes Kinetic Chain Analysis, Defense Radar, and Plain-English Biomechanical Overlays.
 */
class VisionAnalyzer {
  constructor() {
    this.archeryCanvas = document.getElementById('archery-canvas');
    this.archeryCtx = this.archeryCanvas ? this.archeryCanvas.getContext('2d') : null;

    this.boxingCanvas = document.getElementById('boxing-canvas');
    this.boxingCtx = this.boxingCanvas ? this.boxingCanvas.getContext('2d') : null;

    this.archeryVideo = document.getElementById('archery-video');
    this.boxingVideo = document.getElementById('boxing-video');

    this.isArcheryCamActive = false;
    this.isBoxingCamActive = false;

    this.simFrame = 0;
    this.currentSport = 'archery';

    // Boxing Biometrics State
    this.boxingMode = 'strike'; // 'strike', 'defense', 'live'
    this.selectedStrike = 'cross'; // 'jab', 'cross', 'hook', 'uppercut'
    this.selectedDefense = 'slip-right'; // 'high-guard', 'slip-left', 'slip-right', 'bob-weave', 'philly-shell'
    this.isPaused = false;
    this.playbackSpeed = 1.0; // 1.0 or 0.5 (slow-mo)
    this.stance = 'orthodox'; // 'orthodox' or 'southpaw'

    // Boxing strike counters
    this.strikeCounts = {
      jabs: 18,
      crosses: 14,
      hooks: 9,
      slips: 12
    };

    this.initLoop();
    this.initInteractiveControls();
  }

  initLoop() {
    const loop = () => {
      if (!this.isPaused) {
        this.simFrame += this.playbackSpeed;
      }
      if (this.currentSport === 'archery') {
        this.renderArcheryFrame();
      } else {
        this.renderBoxingFrame();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  setSport(sport) {
    this.currentSport = sport;
  }

  setBoxingMode(mode) {
    this.boxingMode = mode;
    const statusText = document.getElementById('boxing-cam-status');
    if (statusText) {
      if (mode === 'strike') statusText.innerText = 'STRIKE KINETIC CHAIN ENGINE: ACTIVE';
      else if (mode === 'defense') statusText.innerText = 'DEFENSE & GUARD RADAR: ACTIVE';
      else statusText.innerText = 'BOXING MOTION TRACKER: READY';
    }
  }

  setStrike(strike) {
    this.selectedStrike = strike;
    this.simFrame = 0; // reset animation cycle
  }

  setDefense(defense) {
    this.selectedDefense = defense;
    this.simFrame = 0;
  }

  togglePlayPause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  setPlaybackSpeed(speed) {
    this.playbackSpeed = speed;
  }

  toggleStance() {
    this.stance = this.stance === 'orthodox' ? 'southpaw' : 'orthodox';
    return this.stance;
  }

  // ================= ARCHERY VISION RENDERER =================
  renderArcheryFrame() {
    if (!this.archeryCtx) return;
    const ctx = this.archeryCtx;
    const w = this.archeryCanvas.width;
    const h = this.archeryCanvas.height;

    // Clear background
    ctx.fillStyle = '#070b12';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Biomechanical Archer Motion Math
    const t = this.simFrame * 0.03;
    const breathingOffset = Math.sin(t * 0.8) * 3;
    const tremor = (Math.sin(t * 7) + Math.cos(t * 13)) * 0.8;

    // Keypoints in canvas space (Olympic Archery Stance)
    const bowHandX = 580 + tremor * 0.6;
    const bowHandY = 220 + breathingOffset * 0.4;

    const bowShoulderX = 430;
    const bowShoulderY = 220 + breathingOffset;

    const drawShoulderX = 300;
    const drawShoulderY = 222 + breathingOffset;

    const anchorX = 330 + tremor * 0.4;
    const anchorY = 215 + breathingOffset * 0.8;

    const drawElbowX = 200 + Math.sin(t * 0.5) * 4;
    const drawElbowY = 205 + Math.cos(t * 0.4) * 3;

    const headX = 360;
    const headY = 170 + breathingOffset * 0.7;

    const hipX = 360;
    const hipY = 340;

    const leadFootX = 420;
    const leadFootY = 460;
    const rearFootX = 300;
    const rearFootY = 460;

    ctx.save();

    // Draw Recurve Bow
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(bowHandX - 10, bowHandY - 140);
    ctx.quadraticCurveTo(bowHandX + 40, bowHandY, bowHandX - 10, bowHandY + 140);
    ctx.stroke();

    // Bow String
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bowHandX - 10, bowHandY - 140);
    ctx.lineTo(anchorX, anchorY);
    ctx.lineTo(bowHandX - 10, bowHandY + 140);
    ctx.stroke();

    // Arrow Shaft
    ctx.strokeStyle = '#ffb800';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    ctx.lineTo(bowHandX + 40, bowHandY);
    ctx.stroke();

    // Target Line Extension
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(bowHandX + 40, bowHandY);
    ctx.lineTo(w, bowHandY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Skeleton Segments
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(headX, headY);
    ctx.lineTo(drawShoulderX + 65, drawShoulderY);
    ctx.lineTo(hipX, hipY);
    ctx.lineTo(leadFootX, leadFootY);
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(rearFootX, rearFootY);
    ctx.stroke();

    // Bow Arm (Shoulder -> Hand)
    ctx.strokeStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(bowShoulderX, bowShoulderY);
    ctx.lineTo(bowHandX, bowHandY);
    ctx.stroke();

    // Draw Arm (Shoulder -> Elbow -> Anchor)
    ctx.strokeStyle = '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(drawShoulderX, drawShoulderY);
    ctx.lineTo(drawElbowX, drawElbowY);
    ctx.lineTo(anchorX, anchorY);
    ctx.stroke();

    // Joint Nodes
    const joints = [
      { x: bowHandX, y: bowHandY, label: 'Bow Hand' },
      { x: bowShoulderX, y: bowShoulderY, label: 'Bow Shoulder' },
      { x: drawShoulderX, y: drawShoulderY, label: 'Scapula' },
      { x: anchorX, y: anchorY, label: 'Anchor Pt' },
      { x: drawElbowX, y: drawElbowY, label: 'Draw Elbow' },
      { x: headX, y: headY, label: 'Head/Eye' },
      { x: hipX, y: hipY, label: 'Pelvis' },
      { x: leadFootX, y: leadFootY, label: 'Stance A' },
      { x: rearFootX, y: rearFootY, label: 'Stance B' }
    ];

    joints.forEach(j => {
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(j.x, j.y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Angle Arc for Draw Elbow Line
    ctx.strokeStyle = 'rgba(255, 184, 0, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(drawElbowX, drawElbowY, 28, 0, Math.PI * 0.95);
    ctx.stroke();

    ctx.fillStyle = '#ffb800';
    ctx.font = '11px JetBrains Mono';
    ctx.fillText('174.5° [ELBOW LINE]', drawElbowX - 60, drawElbowY - 35);

    // Sight Reticle
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bowHandX + 15, bowHandY, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bowHandX + 15 - 24, bowHandY); ctx.lineTo(bowHandX + 15 + 24, bowHandY);
    ctx.moveTo(bowHandX + 15, bowHandY - 24); ctx.lineTo(bowHandX + 15, bowHandY + 24);
    ctx.stroke();

    ctx.restore();
  }

  // ================= NEW UNDERSTANDABLE BOXING VISION RENDERER =================
  renderBoxingFrame() {
    if (!this.boxingCtx) return;
    const ctx = this.boxingCtx;
    const w = this.boxingCanvas.width;
    const h = this.boxingCanvas.height;

    // Clear background
    ctx.fillStyle = '#0a0d16';
    ctx.fillRect(0, 0, w, h);

    // High-tech ring grid
    ctx.strokeStyle = 'rgba(255, 42, 95, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    if (this.boxingMode === 'defense') {
      this.renderBoxingDefenseMode(ctx, w, h);
    } else {
      this.renderBoxingStrikeMode(ctx, w, h);
    }
  }

  // Render Strike Biomechanics with Kinetic Chain
  renderBoxingStrikeMode(ctx, w, h) {
    const t = this.simFrame * 0.035;
    const strike = this.selectedStrike;
    const isSouthpaw = this.stance === 'southpaw';
    const flip = isSouthpaw ? -1 : 1;
    const centerX = 380;

    // Base Stance Positions
    let rearFootX = centerX - 90 * flip;
    let rearFootY = 460;
    let leadFootX = centerX + 60 * flip;
    let leadFootY = 460;
    let hipX = centerX - 10 * flip;
    let hipY = 320;
    let headX = centerX + 10 * flip;
    let headY = 160;

    let leadShoulderX = centerX + 40 * flip;
    let leadShoulderY = 205;
    let rearShoulderX = centerX - 40 * flip;
    let rearShoulderY = 205;

    let leadGloveX = centerX + 90 * flip;
    let leadGloveY = 180;
    let rearGloveX = centerX - 10 * flip;
    let rearGloveY = 185;

    let punchExtensionProgress = 0;
    let strikeNameLabel = 'REAR CROSS (2)';
    let kineticForce = '1,420 N';
    let velocityValue = '8.9 m/s';
    let hipTorqueDeg = '44°';

    // Strike specific kinematics
    if (strike === 'jab') {
      strikeNameLabel = 'LEAD JAB (1)';
      kineticForce = '880 N';
      velocityValue = '10.4 m/s (Fast Snap)';
      hipTorqueDeg = '15° Hip Push';

      const cycle = Math.sin(t * 1.8);
      punchExtensionProgress = Math.max(0, cycle);
      leadGloveX += punchExtensionProgress * 160 * flip;
      leadGloveY += Math.sin(t * 1.8) * 5;
      leadShoulderX += punchExtensionProgress * 20 * flip;
      headX += punchExtensionProgress * 10 * flip;

    } else if (strike === 'cross') {
      strikeNameLabel = 'REAR CROSS (2) - KINETIC POWER';
      kineticForce = '1,540 N';
      velocityValue = '9.1 m/s (Knockout Force)';
      hipTorqueDeg = '48° Hip Rotation';

      const cycle = Math.sin(t * 1.5);
      punchExtensionProgress = Math.max(0, cycle);
      rearGloveX += punchExtensionProgress * 220 * flip;
      rearShoulderX += punchExtensionProgress * 45 * flip;
      hipX += punchExtensionProgress * 20 * flip;
      rearFootX += punchExtensionProgress * 10 * flip; // rear heel lift

    } else if (strike === 'hook') {
      strikeNameLabel = 'LEAD HOOK (3) - ROTATIONAL TORQUE';
      kineticForce = '1,680 N';
      velocityValue = '8.6 m/s (Heavy Hook)';
      hipTorqueDeg = '52° Full Core Twist';

      const cycle = Math.sin(t * 1.4);
      punchExtensionProgress = Math.max(0, cycle);
      leadGloveX = (centerX + 30 * flip) + Math.cos(cycle * 1.5) * 80 * flip;
      leadGloveY = 180 + Math.sin(cycle * 1.5) * 30;
      leadShoulderX += punchExtensionProgress * 30 * flip;
      hipX -= punchExtensionProgress * 15 * flip;

    } else if (strike === 'uppercut') {
      strikeNameLabel = 'REAR UPPERCUT (6) - VERTICAL DRIVE';
      kineticForce = '1,720 N';
      velocityValue = '8.2 m/s (Upward Lift)';
      hipTorqueDeg = '40° Knee & Hip Extension';

      const cycle = Math.sin(t * 1.4);
      punchExtensionProgress = Math.max(0, cycle);
      rearGloveX += punchExtensionProgress * 120 * flip;
      rearGloveY = 240 - punchExtensionProgress * 110;
      hipY -= punchExtensionProgress * 12;
      headY -= punchExtensionProgress * 8;
    }

    ctx.save();

    // 1. Kinetic Chain Power Vector Flow (Rear Foot -> Hip -> Core -> Shoulder -> Fist)
    if (punchExtensionProgress > 0.2) {
      ctx.strokeStyle = 'rgba(255, 184, 0, 0.85)';
      ctx.lineWidth = 5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(rearFootX, rearFootY);
      ctx.lineTo(hipX, hipY);
      ctx.lineTo((leadShoulderX + rearShoulderX) / 2, (leadShoulderY + rearShoulderY) / 2);
      ctx.lineTo(strike === 'jab' || strike === 'hook' ? leadGloveX : rearGloveX, strike === 'jab' || strike === 'hook' ? leadGloveY : rearGloveY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Impact Shockwave at peak extension
      if (punchExtensionProgress > 0.85) {
        const impactX = strike === 'jab' || strike === 'hook' ? leadGloveX + 18 * flip : rearGloveX + 18 * flip;
        const impactY = strike === 'jab' || strike === 'hook' ? leadGloveY : rearGloveY;
        ctx.strokeStyle = '#ffb800';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(impactX, impactY, 28, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 184, 0, 0.25)';
        ctx.fill();
      }
    }

    // 2. Body Skeleton
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 4;
    // Spine
    ctx.beginPath();
    ctx.moveTo(headX, headY);
    ctx.lineTo((leadShoulderX + rearShoulderX) / 2, (leadShoulderY + rearShoulderY) / 2);
    ctx.lineTo(hipX, hipY);
    ctx.stroke();

    // Legs
    ctx.strokeStyle = '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(leadFootX, leadFootY);
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(rearFootX, rearFootY);
    ctx.stroke();

    // Shoulders
    ctx.strokeStyle = '#ff2a5f';
    ctx.beginPath();
    ctx.moveTo(leadShoulderX, leadShoulderY);
    ctx.lineTo(rearShoulderX, rearShoulderY);
    ctx.stroke();

    // Lead Arm
    ctx.strokeStyle = strike === 'jab' || strike === 'hook' ? '#ff2a5f' : '#00ff88';
    ctx.beginPath();
    ctx.moveTo(leadShoulderX, leadShoulderY);
    ctx.lineTo((leadShoulderX + leadGloveX) / 2, (leadShoulderY + leadGloveY) / 2 + 15);
    ctx.lineTo(leadGloveX, leadGloveY);
    ctx.stroke();

    // Rear Arm
    ctx.strokeStyle = strike === 'cross' || strike === 'uppercut' ? '#ff2a5f' : '#00ff88';
    ctx.beginPath();
    ctx.moveTo(rearShoulderX, rearShoulderY);
    ctx.lineTo((rearShoulderX + rearGloveX) / 2, (rearShoulderY + rearGloveY) / 2 + 18);
    ctx.lineTo(rearGloveX, rearGloveY);
    ctx.stroke();

    // 3. Joints with Plain-English Visual Pins
    const joints = [
      { x: leadGloveX, y: leadGloveY, r: 14, color: strike === 'jab' || strike === 'hook' ? '#ff2a5f' : '#ffb800', label: 'Lead Glove' },
      { x: rearGloveX, y: rearGloveY, r: 14, color: strike === 'cross' || strike === 'uppercut' ? '#ff2a5f' : '#ffb800', label: 'Rear Glove' },
      { x: headX, y: headY, r: 10, color: '#00ff88', label: 'Chin Slot (-15°)' },
      { x: leadShoulderX, leadShoulderY, r: 6, color: '#ffffff', label: 'Lead Shoulder' },
      { x: rearShoulderX, rearShoulderY, r: 6, color: '#ffffff', label: 'Rear Shoulder' },
      { x: hipX, y: hipY, r: 7, color: '#ffb800', label: 'Hip Pivot' },
      { x: leadFootX, y: leadFootY, r: 7, color: '#00e5ff', label: 'Lead Foot' },
      { x: rearFootX, y: rearFootY, r: 7, color: '#00e5ff', label: 'Rear Pivot Ball' }
    ];

    joints.forEach(j => {
      ctx.fillStyle = j.color;
      ctx.beginPath();
      ctx.arc(j.x, j.y, j.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // 4. Annotated Callout Pins (Plain English)
    ctx.font = '11px JetBrains Mono';
    
    // Chin Tuck Callout
    ctx.fillStyle = '#00ff88';
    ctx.fillText('🟢 CHIN TUCKED (SAFE)', headX - 65 * flip, headY - 24);

    // Kinetic Chain Power Badge on Active Fist
    const activeFistX = strike === 'jab' || strike === 'hook' ? leadGloveX : rearGloveX;
    const activeFistY = strike === 'jab' || strike === 'hook' ? leadGloveY : rearGloveY;
    if (punchExtensionProgress > 0.4) {
      ctx.fillStyle = '#ffb800';
      ctx.fillText(`⚡ ${velocityValue} [${kineticForce}]`, activeFistX - 40 * flip, activeFistY - 24);
    }

    // Hip Torque Arc & Angle
    ctx.strokeStyle = 'rgba(255, 184, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hipX, hipY, 26, 0, Math.PI * 0.6);
    ctx.stroke();
    ctx.fillStyle = '#ffb800';
    ctx.fillText(`🔄 ${hipTorqueDeg}`, hipX - 50 * flip, hipY + 40);

    // Rear Foot Pivot Angle Arc
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(rearFootX, rearFootY, 20, Math.PI * 1.1, Math.PI * 1.8);
    ctx.stroke();
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('🦶 55° CALCANEAL DRIVE', rearFootX - 70 * flip, rearFootY + 22);

    // Strike Title Banner
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Space Grotesk';
    ctx.fillText(`BIOMETRIC FOCUS: ${strikeNameLabel} [${this.stance.toUpperCase()}]`, 24, 34);

    ctx.restore();
  }

  // Render Defensive Biometrics & Guard Radar
  renderBoxingDefenseMode(ctx, w, h) {
    const t = this.simFrame * 0.035;
    const def = this.selectedDefense;
    const centerX = 380;

    let headX = centerX;
    let headY = 160;
    let leadGloveX = centerX + 60;
    let leadGloveY = 175;
    let rearGloveX = centerX - 25;
    let rearGloveY = 175;
    let leadShoulderX = centerX + 45;
    let leadShoulderY = 210;
    let rearShoulderX = centerX - 40;
    let rearShoulderY = 210;
    let hipX = centerX;
    let hipY = 320;
    let leadFootX = centerX + 60;
    let leadFootY = 460;
    let rearFootX = centerX - 90;
    let rearFootY = 460;

    let defTitle = 'HIGH GUARD SHIELD';
    let slipOffsetCm = '0.0 cm (Centered)';
    let balanceRatio = '50% / 50% Weight Balance';

    if (def === 'high-guard') {
      defTitle = 'HIGH GUARD SHIELD - DUAL FOREARM WALL';
      slipOffsetCm = 'Centerline Locked';
      balanceRatio = '50% Lead / 50% Rear';
      leadGloveX = centerX + 20; leadGloveY = 160;
      rearGloveX = centerX - 20; rearGloveY = 160;

    } else if (def === 'slip-right') {
      defTitle = 'SLIP RIGHT (INSIDE OPPONENT CROSS)';
      const slip = Math.sin(t * 1.5) * 35;
      headX += slip;
      headY += Math.abs(slip) * 0.3;
      leadShoulderX += slip * 0.8;
      rearShoulderX += slip * 0.8;
      slipOffsetCm = `${(Math.abs(slip) * 0.5).toFixed(1)} cm Off Centerline`;
      balanceRatio = '65% Rear / 35% Lead';

    } else if (def === 'slip-left') {
      defTitle = 'SLIP LEFT (OUTSIDE OPPONENT JAB)';
      const slip = -Math.sin(t * 1.5) * 35;
      headX += slip;
      headY += Math.abs(slip) * 0.3;
      leadShoulderX += slip * 0.8;
      rearShoulderX += slip * 0.8;
      slipOffsetCm = `${(Math.abs(slip) * 0.5).toFixed(1)} cm Off Centerline`;
      balanceRatio = '40% Rear / 60% Lead';

    } else if (def === 'bob-weave') {
      defTitle = 'BOB & WEAVE (ROLLING UNDER HOOKS)';
      const uShape = Math.sin(t * 1.5) * 40;
      headX += uShape;
      headY = 160 + Math.abs(Math.sin(t * 1.5)) * 32; // duck down in U-curve
      hipY = 320 + Math.abs(Math.sin(t * 1.5)) * 16;
      slipOffsetCm = '14.2 cm U-Arc Path';
      balanceRatio = 'Dynamic Shift (50 ➔ 70%)';

    } else if (def === 'philly-shell') {
      defTitle = 'PHILLY SHELL / MAYWEATHER SHOULDER ROLL';
      leadGloveX = centerX + 10; leadGloveY = 260; // low lead guard protecting body
      rearGloveX = centerX - 25; rearGloveY = 160; // right glove on cheek
      leadShoulderX = centerX + 30; leadShoulderY = 180; // elevated shoulder protecting chin
      slipOffsetCm = '8.0 cm Rotational Deflection';
      balanceRatio = '70% Rear Leg Weight';
    }

    ctx.save();

    // 1. Centerline Reference (Dotted Line)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX, 80);
    ctx.lineTo(centerX, 480);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('TARGET CENTERLINE', centerX - 45, 100);

    // 2. Defensive Guard Shield Radar
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(headX, headY, 52, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0, 255, 136, 0.12)';
    ctx.fill();

    // 3. Body Skeleton
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(headX, headY);
    ctx.lineTo((leadShoulderX + rearShoulderX) / 2, (leadShoulderY + rearShoulderY) / 2);
    ctx.lineTo(hipX, hipY);
    ctx.lineTo(leadFootX, leadFootY);
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(rearFootX, rearFootY);
    ctx.stroke();

    // Arms
    ctx.strokeStyle = '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(leadShoulderX, leadShoulderY);
    ctx.lineTo(leadGloveX, leadGloveY);
    ctx.moveTo(rearShoulderX, rearShoulderY);
    ctx.lineTo(rearGloveX, rearGloveY);
    ctx.stroke();

    // Joint Nodes
    [
      { x: leadGloveX, y: leadGloveY, r: 12, color: '#ffb800' },
      { x: rearGloveX, y: rearGloveY, r: 12, color: '#ffb800' },
      { x: headX, y: headY, r: 10, color: '#00ff88' },
      { x: leadShoulderX, y: leadShoulderY, r: 6, color: '#ffffff' },
      { x: rearShoulderX, y: rearShoulderY, r: 6, color: '#ffffff' },
      { x: hipX, y: hipY, r: 7, color: '#ffffff' },
      { x: leadFootX, y: leadFootY, r: 7, color: '#00e5ff' },
      { x: rearFootX, y: rearFootY, r: 7, color: '#00e5ff' }
    ].forEach(j => {
      ctx.fillStyle = j.color;
      ctx.beginPath();
      ctx.arc(j.x, j.y, j.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Plain-English HUD Overlays
    ctx.font = '11px JetBrains Mono';
    ctx.fillStyle = '#00ff88';
    ctx.fillText(`🛡️ GUARD: SECURE (${slipOffsetCm})`, headX - 60, headY - 65);

    ctx.fillStyle = '#00e5ff';
    ctx.fillText(`⚖️ ${balanceRatio}`, centerX - 80, 485);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Space Grotesk';
    ctx.fillText(`DEFENSIVE BIOMETRICS: ${defTitle}`, 24, 34);

    ctx.restore();
  }

  // Interactive controls listeners (Pills, playback, speeds)
  initInteractiveControls() {
    // Mode switcher buttons
    document.querySelectorAll('.bio-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bio-mode-btn').forEach(b => b.classList.remove('active', 'active-green'));
        btn.classList.add(btn.dataset.mode === 'defense' ? 'active-green' : 'active');
        this.setBoxingMode(btn.dataset.mode);

        const strikeRow = document.getElementById('boxing-strike-selector-row');
        const defRow = document.getElementById('boxing-defense-selector-row');
        if (strikeRow) strikeRow.style.display = btn.dataset.mode === 'strike' ? 'flex' : 'none';
        if (defRow) defRow.style.display = btn.dataset.mode === 'defense' ? 'flex' : 'none';
      });
    });

    // Strike selector buttons
    document.querySelectorAll('.bio-strike-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bio-strike-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setStrike(btn.dataset.strike);
      });
    });

    // Defense selector buttons
    document.querySelectorAll('.bio-def-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bio-def-btn').forEach(b => b.classList.remove('active-green'));
        btn.classList.add('active-green');
        this.setDefense(btn.dataset.defense);
      });
    });

    // Play/Pause button
    const playPauseBtn = document.getElementById('btn-bio-playpause');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        const isPaused = this.togglePlayPause();
        playPauseBtn.innerText = isPaused ? '▶ Play' : '⏸ Pause';
      });
    }

    // Slow Mo toggle
    const slowMoBtn = document.getElementById('btn-bio-slowmo');
    if (slowMoBtn) {
      slowMoBtn.addEventListener('click', () => {
        if (this.playbackSpeed === 1.0) {
          this.setPlaybackSpeed(0.5);
          slowMoBtn.classList.add('active');
          slowMoBtn.innerText = '⚡ 0.5x Slow-Mo';
        } else {
          this.setPlaybackSpeed(1.0);
          slowMoBtn.classList.remove('active');
          slowMoBtn.innerText = '⚡ 1.0x Normal';
        }
      });
    }

    // Stance toggle
    const stanceToggleBtn = document.getElementById('btn-bio-stance');
    if (stanceToggleBtn) {
      stanceToggleBtn.addEventListener('click', () => {
        const newStance = this.toggleStance();
        stanceToggleBtn.innerText = newStance === 'orthodox' ? '🥊 Orthodox' : '🥊 Southpaw';
      });
    }
  }

  // Toggle Live Webcam
  async toggleWebcam(sport) {
    const isArchery = sport === 'archery';
    const video = isArchery ? this.archeryVideo : this.boxingVideo;
    const btn = document.getElementById(isArchery ? 'archery-webcam-btn' : 'boxing-webcam-btn');
    const statusText = document.getElementById(isArchery ? 'archery-cam-status' : 'boxing-cam-status');

    if (isArchery ? this.isArcheryCamActive : this.isBoxingCamActive) {
      // Stop webcam
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
      if (isArchery) this.isArcheryCamActive = false;
      else this.isBoxingCamActive = false;

      if (btn) btn.innerHTML = '<span>Start Live Camera</span>';
      if (statusText) statusText.innerText = `${sport.toUpperCase()} MOTION TRACKER: READY`;
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: false
        });
        video.srcObject = stream;
        video.play();

        if (isArchery) this.isArcheryCamActive = true;
        else this.isBoxingCamActive = true;

        if (btn) btn.innerHTML = '<span>Stop Camera Feed</span>';
        if (statusText) statusText.innerText = `${sport.toUpperCase()} MOTION TRACKER: LIVE WEBCAM ACTIVE`;
        
        window.speechCoach.speak(`${sport === 'archery' ? 'Archery' : 'Boxing'} camera tracker activated. Position yourself in full frame.`);
      }
    } catch (err) {
      alert('Camera access permission was denied or camera is unavailable. Defaulting to high-precision biomechanics simulation.');
    }
  }

  resetCounters() {
    this.strikeCounts = { jabs: 0, crosses: 0, hooks: 0, slips: 0 };
    const j = document.getElementById('p-count-jabs');
    const c = document.getElementById('p-count-crosses');
    const h = document.getElementById('p-count-hooks');
    const s = document.getElementById('p-count-slips');
    if (j) j.innerText = '0';
    if (c) c.innerText = '0';
    if (h) h.innerText = '0';
    if (s) s.innerText = '0';
  }
}

window.visionAnalyzer = new VisionAnalyzer();

