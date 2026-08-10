// MVP VRN Background Service Worker — Manifest V3

// ── Tell Chrome to open the side panel automatically on icon click ──
// This is the correct Manifest V3 pattern for always-on side panels
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Fallback: also handle explicit action click for older Chrome versions
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// ── Simulated critical alert notifications ──
// In production this listens to a real WebSocket from the MVP VRN backend
const alerts = [
  { title: '⚠️ MVP VRN Alert', message: 'Jane Doe: Mobility index dropped 40% below baseline.' },
  { title: '🔴 Critical: MVP VRN', message: 'Robert Smith: SpO₂ reading below 90%. Review recommended.' },
  { title: '🟡 MVP VRN Monitor', message: 'Mary Johnson: Sleep duration shorter than 7-day average.' },
];

chrome.alarms.create('vitalsCheck', { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'vitalsCheck' && Math.random() > 0.7) {
    const alert = alerts[Math.floor(Math.random() * alerts.length)];
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: alert.title,
      message: alert.message,
      priority: 2
    });
  }
});
