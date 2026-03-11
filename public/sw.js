self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Store reminders config
let remindersConfig = null;
let reminderTimers = [];

self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Tracky.', {
      body: data.body || "Don't forget to log your meal!",
      icon: '/icon-192.png',
      tag: data.tag || 'tracky-reminder',
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_REMINDERS') {
    scheduleReminders(e.data.reminders, e.data.lang);
  }
  if (e.data?.type === 'CHECK_REMINDERS') {
    checkAndNotify(e.data.reminders, e.data.loggedMeals, e.data.lang);
  }
});

function getMealName(slotId, lang) {
  const names = {
    breakfast:     lang==='es'?'Desayuno':'Breakfast',
    morningSnack:  lang==='es'?'Snack Mañana':'Morning Snack',
    lunch:         lang==='es'?'Almuerzo':'Lunch',
    afternoonSnack:lang==='es'?'Snack Tarde':'Afternoon Snack',
    dinner:        lang==='es'?'Cena':'Dinner',
    eveningSnack:  lang==='es'?'Snack Noche':'Evening Snack',
  };
  return names[slotId] || slotId;
}

function scheduleReminders(reminders, lang) {
  // Clear existing timers
  reminderTimers.forEach(t => clearTimeout(t));
  reminderTimers = [];
  remindersConfig = reminders;

  if (!reminders) return;

  const now = new Date();
  Object.entries(reminders).forEach(([slotId, cfg]) => {
    if (!cfg.enabled || !cfg.time) return;
    const [h, m] = cfg.time.split(':').map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);
    // If already passed today, schedule for tomorrow
    if (target <= now) target.setDate(target.getDate() + 1);
    const delay = target - now;
    const name = getMealName(slotId, lang);
    const body = lang==='es' ? `No olvides registrar tu ${name}!` : `Don't forget to log your ${name}!`;
    const t = setTimeout(() => {
      self.registration.showNotification('Tracky. 🥑', { body, tag: `reminder-${slotId}`, renotify: true });
      // Reschedule for next day
      scheduleReminders(reminders, lang);
    }, delay);
    reminderTimers.push(t);
  });
}

function checkAndNotify(reminders, loggedMeals, lang) {
  if (!reminders) return;
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  Object.entries(reminders).forEach(([slotId, cfg]) => {
    if (!cfg.enabled || cfg.time !== hhmm) return;
    if (loggedMeals?.[slotId]?.status === 'done') return;
    const name = getMealName(slotId, lang);
    const body = lang==='es' ? `No olvides registrar tu ${name}!` : `Don't forget to log your ${name}!`;
    self.registration.showNotification('Tracky. 🥑', { body, tag: `reminder-${slotId}`, renotify: true });
  });
}
