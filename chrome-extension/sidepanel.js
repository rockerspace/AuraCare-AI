// ── MVP VRN Side Panel JavaScript ──

// ── Tab switching ──
function switchTab(tab) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  event.target.classList.add('active');
}

// ── Live IoT Vitals Simulation (updates every 4 seconds) ──
const patients = [
  { id: 'p1', hr: 110, o2: 89,  temp: 101.2 },
  { id: 'p2', hr: 72,  o2: 98,  temp: 98.6  },
  { id: 'p3', hr: 85,  o2: 95,  temp: 99.1  },
];

function flashUpdate(el) {
  el.classList.remove('updated');
  void el.offsetWidth; // force reflow
  el.classList.add('updated');
}

function updateVitals() {
  patients.forEach(p => {
    p.hr   = Math.max(50, Math.min(140, p.hr   + (Math.floor(Math.random() * 5) - 2)));
    p.o2   = Math.max(80, Math.min(100, p.o2   + (Math.floor(Math.random() * 3) - 1)));
    p.temp = parseFloat((Math.max(96, Math.min(104, p.temp + (Math.random() * 0.4 - 0.2)))).toFixed(1));

    const hrEl   = document.getElementById('hr-'   + p.id);
    const o2El   = document.getElementById('o2-'   + p.id);
    const tempEl = document.getElementById('temp-' + p.id);

    if (hrEl)   { hrEl.textContent   = p.hr;   flashUpdate(hrEl); }
    if (o2El)   { o2El.textContent   = p.o2;   flashUpdate(o2El); }
    if (tempEl) { tempEl.textContent = p.temp; flashUpdate(tempEl); }

    // Randomly toggle Robert Smith status for demo
    if (p.id === 'p2' && Math.random() > 0.85) {
      const badge = document.getElementById('status-p2');
      if (badge.textContent === 'Stable') {
        badge.textContent = 'Review';
        badge.className = 'status-badge status-review';
      } else {
        badge.textContent = 'Stable';
        badge.className = 'status-badge status-stable';
      }
    }
  });
}

setInterval(updateVitals, 4000);

// ── Rotating Alert Banners ──
const alertMessages = [
  { title: '⚡ Behavioral Anomaly Detected', msg: 'Jane Doe: Mobility index dropped 40% below historical baseline. AI Triage Agent activated.' },
  { title: '🔴 Critical Alert', msg: 'Jane Doe: Heart rate elevated to 110 bpm. Haptic sensor detecting micro-tremors.' },
  { title: '🟡 Monitoring Update', msg: 'Mary Johnson: Sleep duration shorter than 7-day average. Observation recommended.' },
  { title: '📡 IoT Stream Active', msg: 'Real-time telemetry from 4 haptic wearables streaming to BigQuery. All devices connected.' },
];

let alertIdx = 0;
function rotateAlert() {
  const banner = document.getElementById('alert-banner');
  const textEl = document.getElementById('alert-text');
  alertIdx = (alertIdx + 1) % alertMessages.length;
  banner.style.opacity = 0;
  setTimeout(() => {
    document.querySelector('.alert-title').textContent = alertMessages[alertIdx].title;
    textEl.textContent = alertMessages[alertIdx].msg;
    banner.style.transition = 'opacity 0.5s';
    banner.style.opacity = 1;
  }, 400);
}

setInterval(rotateAlert, 8000);

// ── Agent Chat ──
const agentResponses = {
  default: { text: "I have cross-referenced the latest real-time IoT ingestion streams. Her vitals remain stable, and there are no immediate critical deviations detected.", source: "Gemini 1.5 Pro + BigQuery", actions: ["Acknowledge", "Escalate"] },
  haptic:  { text: "I've pulled the high-frequency haptic sensor data from the Edge node. The micro-tremor analysis indicates normal gait patterns, ruling out any immediate fall risk.", source: "Edge Agent + MCP", actions: ["View Micro-Tremor Graph", "Log Note"] },
  camera:  { text: "I requested video analysis from the Vision Agent. Gemini 1.5 Pro multimodal confirms she is resting comfortably in the living room. No hazards detected.", source: "Vision Agent (A2A)", actions: ["View Frame", "Dismiss"] },
  alert:   { text: "The alert triggered because her step count dropped 40% below the 30-day baseline. Qdrant vectors and the Nano Banana tool confirm she went to bed 2 hours earlier than usual.", source: "Gemini 1.5 Pro + Nano Banana", actions: ["View Qdrant Vectors", "Dismiss Alert"] },
  sleep:   { text: "BigQuery sleep logs show 5h 12m vs a 7h 30m baseline. The Edge wearable detected 3 micro-wake events. Recommend reviewing late-evening medication schedule.", source: "BigQuery + ADK", actions: ["View Sleep Chart", "Flag for Review"] },
  triage:  { text: "Full AI Triage complete. HR: 89 bpm (elevated). SpO₂: 97% (normal). Mobility Index: Low (-40% from baseline). Recommendation: Initiate Caregiver Review Protocol.", source: "Medical Triage Agent — Gemini 1.5 Pro", actions: ["Initiate Protocol", "Export Report"] },
};

function addAgentMessage(role, text, source, actions) {
  const container = document.getElementById('agent-messages');
  const row = document.createElement('div');
  row.className = 'msg-row' + (role === 'user' ? ' user' : '');
  
  const avatar = `<div class="msg-avatar ${role}">${role === 'user' ? 'DR' : 'AI'}</div>`;
  const bubble = `<div class="msg-bubble ${role}">${text}</div>`;
  const sourceHtml = source ? `<div class="msg-source">Source: ${source}</div>` : '';
  const actionsHtml = actions && actions.length
    ? `<div class="msg-actions">${actions.map(a => `<button class="action-btn">${a}</button>`).join('')}</div>`
    : '';

  row.innerHTML = role === 'user'
    ? `<div>${bubble}</div>${avatar}`
    : `${avatar}<div>${bubble}${sourceHtml}${actionsHtml}</div>`;

  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function addTypingIndicator(containerId) {
  const container = document.getElementById(containerId);
  const typing = document.createElement('div');
  typing.className = 'msg-row';
  typing.id = 'typing-indicator';
  typing.innerHTML = `
    <div class="msg-avatar ai">${containerId === 'family-messages' ? 'F' : 'AI'}</div>
    <div class="typing"><span></span><span></span><span></span></div>
  `;
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function getAgentResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('haptic') || m.includes('mobility') || m.includes('sensor')) return agentResponses.haptic;
  if (m.includes('camera') || m.includes('video'))                             return agentResponses.camera;
  if (m.includes('alert') || m.includes('anomaly'))                            return agentResponses.alert;
  if (m.includes('sleep') || m.includes('rest'))                               return agentResponses.sleep;
  if (m.includes('triage') || m.includes('full report'))                       return agentResponses.triage;
  return agentResponses.default;
}

function sendAgentMsg() {
  const input = document.getElementById('agent-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  addAgentMessage('user', msg, null, null);

  // Routing step
  setTimeout(() => {
    addTypingIndicator('agent-messages');
    setTimeout(() => {
      removeTypingIndicator();
      const res = getAgentResponse(msg);
      addAgentMessage('ai', res.text, res.source, res.actions);
    }, 2000);
  }, 400);
}

function sendAgentChip(prompt, responseText, source, actions) {
  addAgentMessage('user', prompt, null, null);
  setTimeout(() => {
    addTypingIndicator('agent-messages');
    setTimeout(() => {
      removeTypingIndicator();
      addAgentMessage('ai', responseText, source, actions);
    }, 2000);
  }, 400);
}

// ── Family Chat ──
const familyMembers = [
  { name: 'Sarah (Daughter)', avatar: 'S', gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
  { name: 'Michael (Son)',    avatar: 'M', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
  { name: 'Priya (Niece)',    avatar: 'P', gradient: 'linear-gradient(135deg,#f97316,#ef4444)' },
];

const familyTranslations = {
  mobility: "The doctor says Jane's walking ability is being closely monitored by an AI sensor. No immediate panic needed.",
  medication: "The doctor is updating Jane's medication plan. This is routine and will help her feel better.",
  sleep: "The doctor says Jane's sleep patterns are tracked by AI wearable sensors overnight.",
  visit: "The doctor says it is okay to visit. Please coordinate timing so Jane is rested.",
  eat: "Jane's food intake and appetite are being logged daily by the caregiving team.",
  default: msg => `The doctor says: "${msg}" — everything is being monitored carefully.`,
};

const familyReplies = {
  mobility: ["Oh okay, that's a relief!", "Thank you for the explanation!", "Is there anything we can do to help at home?"],
  medication: ["Got it, should we pick up anything from the pharmacy?", "Understood, we'll make sure she takes them on time."],
  sleep: ["She mentioned she's been having trouble sleeping. Good to know!", "We'll make sure not to call her too late."],
  visit: ["Perfect! Saturday afternoon works for us.", "Great, we will coordinate!", "Thank you doctor, we will be there!"],
  eat: ["We'll bring her some of her favorite food when we visit!", "Good to know she's being taken care of."],
  default: ["Got it, thank you for the update!", "We appreciate you keeping us in the loop!", "Understood, please keep us posted!"],
};

function addFamilyMsg(role, author, text, gradient, isTranslation) {
  const container = document.getElementById('family-messages');
  const row = document.createElement('div');
  row.className = 'msg-row' + (role === 'family' ? ' user' : '');

  let avatarStyle = '';
  let avatarChar = 'MD';

  if (role === 'family') {
    avatarStyle = `background:${gradient || 'linear-gradient(135deg,#8b5cf6,#ec4899)'}`;
    avatarChar = author ? author[0] : 'F';
  } else if (role === 'ai') {
    avatarStyle = 'background:linear-gradient(135deg,#10b981,#06b6d4)';
    avatarChar = 'AI';
  } else {
    avatarStyle = 'background:linear-gradient(135deg,#6b7280,#4b5563)';
  }

  const nameColor = role === 'ai' ? '#10b981' : '#9ca3af';
  const bubbleStyle = isTranslation
    ? 'border-color:rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);color:#a7f3d0;'
    : '';

  const translationLabel = isTranslation
    ? '<div style="font-size:9px;font-weight:600;color:#10b981;margin-bottom:2px;">✨ AI Translation</div>'
    : '';

  const nameDiv = author
    ? `<div style="font-size:9px;color:${nameColor};margin-bottom:2px;${role === 'family' ? 'text-align:right;' : ''}">${author}</div>`
    : '';

  if (role === 'family') {
    row.innerHTML = `
      <div>
        ${nameDiv}
        <div class="msg-bubble user">${text}</div>
      </div>
      <div class="msg-avatar user" style="${avatarStyle}">${avatarChar}</div>
    `;
  } else {
    row.innerHTML = `
      <div class="msg-avatar ai" style="${avatarStyle}">${avatarChar}</div>
      <div>
        ${nameDiv}
        <div class="msg-bubble ai" style="${bubbleStyle}">${translationLabel}${text}</div>
      </div>
    `;
  }

  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function getFamilyTranslation(msg) {
  const m = msg.toLowerCase();
  if (m.includes('mobility') || m.includes('walking')) return familyTranslations.mobility;
  if (m.includes('medication') || m.includes('medicine')) return familyTranslations.medication;
  if (m.includes('sleep') || m.includes('rest')) return familyTranslations.sleep;
  if (m.includes('visit') || m.includes('come')) return familyTranslations.visit;
  if (m.includes('eat') || m.includes('food')) return familyTranslations.eat;
  return familyTranslations.default(msg);
}

function getFamilyReply(msg) {
  const m = msg.toLowerCase();
  let pool = familyReplies.default;
  if (m.includes('mobility') || m.includes('walking')) pool = familyReplies.mobility;
  else if (m.includes('medication') || m.includes('medicine')) pool = familyReplies.medication;
  else if (m.includes('sleep')) pool = familyReplies.sleep;
  else if (m.includes('visit') || m.includes('come')) pool = familyReplies.visit;
  else if (m.includes('eat') || m.includes('food')) pool = familyReplies.eat;
  return pool[Math.floor(Math.random() * pool.length)];
}

function sendFamilyMsg(prefill) {
  const input = document.getElementById('family-input');
  const msg = prefill || input.value.trim();
  if (!msg) return;
  input.value = '';

  addFamilyMsg('md', 'Dr. Smith (Caregiver)', msg, null, false);

  setTimeout(() => {
    const translation = getFamilyTranslation(msg);
    addFamilyMsg('ai', 'AI Translator (Gemini)', translation, null, true);

    setTimeout(() => {
      const member = familyMembers[Math.floor(Math.random() * familyMembers.length)];
      addFamilyMsg('family', member.name, getFamilyReply(msg), member.gradient, false);
    }, 2000);
  }, 1500);
}
