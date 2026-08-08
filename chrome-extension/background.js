// AuraCare Background Service Worker
// Opens the side panel when the extension icon is clicked

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Set the side panel to open on action click for all tabs
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({
    enabled: true,
    path: 'sidepanel.html'
  });
});

// Alert simulation: push a Chrome notification if a critical anomaly is detected
// In production, this would listen to a real WebSocket from the AuraCare backend
setInterval(() => {
  const alerts = [
    { title: '⚠️ AuraCare Alert', message: 'Jane Doe: Mobility index dropped 40% below baseline.' },
    { title: '🔴 Critical: AuraCare', message: 'Robert Smith: SpO₂ reading below 90%. Review recommended.' },
    { title: '🟡 AuraCare Monitor', message: 'Mary Johnson: Sleep duration shorter than 7-day average.' },
  ];

  // Only fire demo notifications occasionally (not every interval)
  const rand = Math.random();
  if (rand > 0.92) {
    const alert = alerts[Math.floor(Math.random() * alerts.length)];
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: alert.title,
      message: alert.message,
      priority: 2
    });
  }
}, 30000); // Check every 30 seconds
